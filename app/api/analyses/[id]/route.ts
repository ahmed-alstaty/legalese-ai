import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('include_content') === 'true';
    const includeAnnotations = searchParams.get('include_annotations') === 'true';
    const includeChat = searchParams.get('include_chat') === 'true';

    // Base query for analysis
    let analysisSelect = `
      id,
      document_id,
      summary,
      key_obligations,
      risk_assessment,
      confidence_score,
      processing_time_seconds,
      ai_model_used,
      highlighted_sections,
      ai_comments,
      document_structure,
      created_at,
      documents!inner(
        id,
        filename,
        document_type,
        created_at
      )
    `;

    // Conditionally include document content (large field)
    if (includeContent) {
      analysisSelect += ', document_content';
    }

    let query = supabase
      .from('analyses')
      .select(analysisSelect)
      .eq('id', id)
      .eq('user_id', user.id);

    const { data: analysis, error: analysisError } = await query.single();

    if (analysisError || !analysis) {
      if (analysisError?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }
      console.error('Database query error:', analysisError);
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      );
    }

    const analysisData = analysis as any;
    const response: any = {
      id: analysisData.id,
      documentId: analysisData.document_id,
      document: analysisData.documents,
      summary: analysisData.summary,
      keyObligations: analysisData.key_obligations,
      riskAssessment: analysisData.risk_assessment,
      highlightedSections: analysisData.highlighted_sections,
      aiComments: analysisData.ai_comments,
      documentStructure: analysisData.document_structure,
      confidenceScore: analysisData.confidence_score,
      processingTime: analysisData.processing_time_seconds,
      modelUsed: analysisData.ai_model_used,
      createdAt: analysisData.created_at,
    };

    // Include document content if requested
    if (includeContent && analysisData.document_content) {
      response.documentContent = analysisData.document_content;
    }

    // Include user annotations if requested
    if (includeAnnotations) {
      const { data: annotations, error: annotationsError } = await supabase
        .from('user_annotations')
        .select('*')
        .eq('analysis_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (annotationsError) {
        console.error('Annotations query error:', annotationsError);
      } else {
        response.userAnnotations = annotations || [];
      }
    }

    // Include chat conversation if requested
    if (includeChat) {
      const { data: conversation, error: chatError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('analysis_id', id)
        .eq('user_id', user.id)
        .single();

      if (chatError && chatError.code !== 'PGRST116') {
        console.error('Chat query error:', chatError);
      } else {
        response.chatConversation = conversation || null;
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'add_annotation': {
        const { textStart, textEnd, commentText, annotationType = 'note' } = data;

        if (typeof textStart !== 'number' || typeof textEnd !== 'number' || !commentText) {
          return NextResponse.json(
            { error: 'Invalid annotation data' },
            { status: 400 }
          );
        }

        // Verify analysis exists and belongs to user
        const { data: analysis, error: analysisError } = await supabase
          .from('analyses')
          .select('id')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (analysisError) {
          return NextResponse.json(
            { error: 'Analysis not found' },
            { status: 404 }
          );
        }

        // Create annotation
        const { data: annotation, error: annotationError } = await supabase
          .from('user_annotations')
          .insert({
            analysis_id: id,
            user_id: user.id,
            text_start: textStart,
            text_end: textEnd,
            comment_text: commentText,
            annotation_type: annotationType,
          })
          .select()
          .single();

        if (annotationError) {
          console.error('Annotation creation error:', annotationError);
          return NextResponse.json(
            { error: 'Failed to create annotation' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          annotation,
          message: 'Annotation added successfully',
        });
      }

      case 'update_annotation': {
        const { annotationId, commentText, annotationType } = data;

        if (!annotationId || !commentText) {
          return NextResponse.json(
            { error: 'Invalid update data' },
            { status: 400 }
          );
        }

        const updateData: any = {
          comment_text: commentText,
          updated_at: new Date().toISOString(),
        };

        if (annotationType) {
          updateData.annotation_type = annotationType;
        }

        const { data: annotation, error: updateError } = await supabase
          .from('user_annotations')
          .update(updateData)
          .eq('id', annotationId)
          .eq('user_id', user.id)
          .eq('analysis_id', id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update annotation' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          annotation,
          message: 'Annotation updated successfully',
        });
      }

      case 'delete_annotation': {
        const { annotationId } = data;

        if (!annotationId) {
          return NextResponse.json(
            { error: 'Annotation ID required' },
            { status: 400 }
          );
        }

        const { error: deleteError } = await supabase
          .from('user_annotations')
          .delete()
          .eq('id', annotationId)
          .eq('user_id', user.id)
          .eq('analysis_id', id);

        if (deleteError) {
          return NextResponse.json(
            { error: 'Failed to delete annotation' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Annotation deleted successfully',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Update analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Delete associated data first (due to foreign key constraints)
    const errors: string[] = [];

    // Delete user annotations
    const { error: annotationDeleteError } = await supabase
      .from('user_annotations')
      .delete()
      .eq('analysis_id', id)
      .eq('user_id', user.id);

    if (annotationDeleteError) {
      console.error('Annotation deletion error:', annotationDeleteError);
      errors.push('Failed to delete annotations');
    }

    // Delete chat conversations
    const { error: chatDeleteError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('analysis_id', id)
      .eq('user_id', user.id);

    if (chatDeleteError) {
      console.error('Chat deletion error:', chatDeleteError);
      errors.push('Failed to delete chat conversations');
    }

    // Delete the analysis
    const { error: analysisDeleteError } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (analysisDeleteError) {
      if (analysisDeleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }
      console.error('Analysis deletion error:', analysisDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete analysis' },
        { status: 500 }
      );
    }

    // Decrement usage counter
    const { error: usageUpdateError } = await supabase.rpc('decrement_usage', {
      user_id_param: user.id
    });

    if (usageUpdateError) {
      console.error('Usage update error:', usageUpdateError);
      errors.push('Failed to update usage counter');
    }

    // Return response with any warnings
    if (errors.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Analysis deleted successfully',
        warnings: errors,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis and all associated data deleted successfully',
    });

  } catch (error) {
    console.error('Delete analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}