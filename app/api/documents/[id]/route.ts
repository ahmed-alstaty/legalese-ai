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

    // Get document with associated analysis
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select(`
        *,
        analyses(
          id,
          summary,
          confidence_score,
          ai_model_used,
          processing_time_seconds,
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
      console.error('Database query error:', documentError);
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      document,
    });

  } catch (error) {
    console.error('Get document API error:', error);
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

    // Get document to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    // Start transaction-like operations
    const errors: string[] = [];

    // Delete associated analyses first (due to foreign key constraints)
    const { error: analysisDeleteError } = await supabase
      .from('analyses')
      .delete()
      .eq('document_id', id)
      .eq('user_id', user.id);

    if (analysisDeleteError) {
      console.error('Analysis deletion error:', analysisDeleteError);
      errors.push('Failed to delete associated analyses');
    }

    // First get analysis IDs
    const { data: analysesForDoc } = await supabase
      .from('analyses')
      .select('id')
      .eq('document_id', id);

    // Delete user annotations
    if (analysesForDoc && analysesForDoc.length > 0) {
      const analysisIds = analysesForDoc.map(a => a.id);
      const { error: annotationDeleteError } = await supabase
        .from('user_annotations')
        .delete()
        .match({ user_id: user.id })
        .in('analysis_id', analysisIds);

      if (annotationDeleteError) {
        console.error('Annotation deletion error:', annotationDeleteError);
        errors.push('Failed to delete associated annotations');
      }
    }


    // Delete chat conversations  
    if (analysesForDoc && analysesForDoc.length > 0) {
      const analysisIds = analysesForDoc.map(a => a.id);
      const { error: chatDeleteError } = await supabase
        .from('chat_conversations')
        .delete()
        .match({ user_id: user.id })
        .in('analysis_id', analysisIds);

      if (chatDeleteError) {
        console.error('Chat deletion error:', chatDeleteError);
        errors.push('Failed to delete associated chat conversations');
      }
    }

    // Delete document from database
    const { error: documentDeleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (documentDeleteError) {
      console.error('Document deletion error:', documentDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete document from database' },
        { status: 500 }
      );
    }

    // Delete file from storage
    const { error: storageDeleteError } = await supabase
      .storage
      .from('documents')
      .remove([document.file_path]);

    if (storageDeleteError) {
      console.error('Storage deletion error:', storageDeleteError);
      errors.push('Failed to delete file from storage');
    }

    // Return response with any warnings
    if (errors.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Document deleted successfully',
        warnings: errors,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Document and all associated data deleted successfully',
    });

  } catch (error) {
    console.error('Delete document API error:', error);
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
    const { status } = body;

    // Validate status if provided
    const validStatuses = ['uploaded', 'processing', 'analyzed', 'error'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update document
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    const { data: document, error: updateError } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document updated successfully',
    });

  } catch (error) {
    console.error('Update document API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}