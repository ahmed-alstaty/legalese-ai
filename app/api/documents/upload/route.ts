import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateFile, generateUniqueFilename } from '@/utils/file-validation';
import { Database } from '@/types/database';

type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check limits
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

    // Check if user has active subscription for file uploads
    if (userProfile.subscription_status !== 'active' && userProfile.subscription_tier === 'free') {
      const freeLimit = 2; // Free users get 2 uploads per month
      if (userProfile.analyses_used_this_month >= freeLimit) {
        return NextResponse.json(
          { 
            error: 'Upload limit exceeded',
            message: 'Free users are limited to 2 document uploads per month. Please upgrade your subscription.'
          },
          { status: 403 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate unique filename for storage
    const uniqueFilename = generateUniqueFilename(file.name, user.id);
    const bucketPath = `documents/${uniqueFilename}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(bucketPath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Create document record in database
    const documentData: DocumentInsert = {
      user_id: user.id,
      filename: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      document_type: validation.fileType || 'unknown',
      status: 'uploaded',
    };

    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (documentError) {
      console.error('Database insert error:', documentError);
      
      // Clean up uploaded file on database error
      await supabase
        .storage
        .from('documents')
        .remove([bucketPath]);

      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    // Return success response with document info
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        fileSize: document.file_size,
        documentType: document.document_type,
        status: document.status,
        createdAt: document.created_at,
      },
      message: 'Document uploaded successfully',
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: documents, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents: documents || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Get documents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}