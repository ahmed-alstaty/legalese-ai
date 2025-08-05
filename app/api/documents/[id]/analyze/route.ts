import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseDocument } from '@/lib/document-parser';
import { createAnalysisPrompt, validateAnalysisResult, estimateAnalysisComplexity } from '@/lib/analysis-prompt';
import { createChatCompletion, validateTokenLimit } from '@/lib/openai';
import { validateFileBuffer } from '@/utils/file-validation';
import { Database } from '@/types/database';
import { getTierLimit, getRemainingAnalyses } from '@/lib/subscription-config';

type AnalysisInsert = Database['public']['Tables']['analyses']['Insert'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { 
        error: 'Configuration Error',
        message: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.'
      },
      { status: 500 }
    );
  }
  
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check limits and subscription
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status, analyses_used_this_month')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check usage limits using centralized config
    const userLimit = getTierLimit(userProfile.subscription_tier);
    const remainingAnalyses = getRemainingAnalyses(userProfile.analyses_used_this_month, userProfile.subscription_tier);
    
    if (remainingAnalyses <= 0) {
      return NextResponse.json(
        { 
          error: 'Analysis limit exceeded',
          message: `You have reached your monthly limit of ${userLimit} analyses. Please upgrade your subscription.`,
          currentUsage: userProfile.analyses_used_this_month,
          limit: userLimit,
          remaining: 0
        },
        { status: 403 }
      );
    }

    // Get document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (documentError) {
      if (documentError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    // Check if document is already being analyzed
    if (document.status === 'processing') {
      return NextResponse.json(
        { error: 'Document is already being analyzed' },
        { status: 409 }
      );
    }

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', id);

    try {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('documents')
        .download(document.file_path);

      if (downloadError || !fileData) {
        console.error('Storage download error:', downloadError);
        throw new Error(`Failed to download document from storage: ${downloadError?.message || 'File not found'}`);
      }

      // Convert to buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Validate file buffer
      const validation = validateFileBuffer(fileBuffer, document.filename);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.error}`);
      }

      // Parse document
      const parseResult = await parseDocument(fileBuffer, validation.fileType!);
      
      // Validate text length for OpenAI
      if (!validateTokenLimit(parseResult.text)) {
        throw new Error('Document is too large for analysis. Please try a smaller document.');
      }

      // Estimate complexity
      const complexity = estimateAnalysisComplexity(parseResult.text);

      // Create analysis prompt
      const { systemPrompt, userPrompt } = createAnalysisPrompt(parseResult.text);

      // Call OpenAI for analysis
      const { content: analysisContent, usage } = await createChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          model: complexity.recommendedModel,
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }
      );

      // Parse and validate analysis result
      let analysisResult;
      try {
        analysisResult = JSON.parse(analysisContent);
      } catch (parseError) {
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      const validation_result = validateAnalysisResult(analysisResult, parseResult.text);
      if (!validation_result.isValid) {
        console.error('Analysis validation errors:', validation_result.errors);
        throw new Error(`Analysis validation failed: ${validation_result.errors.join(', ')}`);
      }

      const validatedResult = validation_result.sanitizedResult!;

      // Calculate processing time
      const processingTime = Math.round((Date.now() - startTime) / 1000);

      // Save analysis to database
      const analysisData: AnalysisInsert = {
        document_id: id,
        user_id: user.id,
        summary: validatedResult.summary,
        key_obligations: validatedResult.keyObligations as any,
        risk_assessment: validatedResult.riskAssessment as any,
        confidence_score: validatedResult.confidenceScore / 100, // Convert 0-100 to 0-1 for DECIMAL(3,2)
        processing_time_seconds: processingTime,
        ai_model_used: complexity.recommendedModel,
        document_content: parseResult.text,
        highlighted_sections: validatedResult.highlightedSections as any,
        ai_comments: validatedResult.aiComments as any,
        document_structure: validatedResult.documentStructure as any,
      };

      const { data: analysis, error: analysisError } = await supabase
        .from('analyses')
        .insert(analysisData)
        .select()
        .single();

      if (analysisError) {
        throw new Error(`Failed to save analysis: ${analysisError.message}`);
      }

      // Update usage counter
      await supabase
        .from('user_profiles')
        .update({ 
          analyses_used_this_month: userProfile.analyses_used_this_month + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Update document status to analyzed
      await supabase
        .from('documents')
        .update({ status: 'analyzed', updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        analysis: {
          id: analysis.id,
          summary: analysis.summary,
          keyObligations: analysis.key_obligations,
          riskAssessment: analysis.risk_assessment,
          highlightedSections: analysis.highlighted_sections,
          aiComments: analysis.ai_comments,
          documentStructure: analysis.document_structure,
          confidenceScore: analysis.confidence_score * 100, // Convert back to 0-100 for display
          processingTime: analysis.processing_time_seconds,
          modelUsed: analysis.ai_model_used,
          createdAt: analysis.created_at,
        },
        usage: {
          tokensUsed: usage?.total_tokens || 0,
          analysesRemaining: getRemainingAnalyses(userProfile.analyses_used_this_month + 1, userProfile.subscription_tier),
          currentMonthUsage: userProfile.analyses_used_this_month + 1,
          monthlyLimit: userLimit
        },
        message: 'Document analyzed successfully',
      });

    } catch (processingError) {
      console.error('Document processing error:', processingError);
      
      // Update document status to error
      await supabase
        .from('documents')
        .update({ 
          status: 'error', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      return NextResponse.json(
        { 
          error: 'Analysis failed',
          message: processingError instanceof Error ? processingError.message : 'Unknown processing error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document with current analysis status
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select(`
        id,
        filename,
        status,
        updated_at,
        analyses(
          id,
          summary,
          confidence_score,
          processing_time_seconds,
          ai_model_used,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (documentError) {
      if (documentError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    const response: any = {
      documentId: document.id,
      filename: document.filename,
      status: document.status,
      updatedAt: document.updated_at,
    };

    // Add analysis info if available
    if (document.analyses && document.analyses.length > 0) {
      const latestAnalysis = document.analyses[0]; // Should be the most recent
      response.analysis = {
        id: latestAnalysis.id,
        summary: latestAnalysis.summary,
        confidenceScore: latestAnalysis.confidence_score,
        processingTime: latestAnalysis.processing_time_seconds,
        modelUsed: latestAnalysis.ai_model_used,
        createdAt: latestAnalysis.created_at,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get analysis status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}