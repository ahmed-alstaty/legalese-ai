export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          subscription_tier: string
          subscription_status: string
          analyses_used_this_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          subscription_tier?: string
          subscription_status?: string
          analyses_used_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          subscription_tier?: string
          subscription_status?: string
          analyses_used_this_month?: number
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_size: number | null
          document_type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_size?: number | null
          document_type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_size?: number | null
          document_type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          document_id: string
          user_id: string
          summary: string | null
          key_obligations: Json | null
          risk_assessment: Json | null
          confidence_score: number | null
          processing_time_seconds: number | null
          ai_model_used: string
          document_content: string
          highlighted_sections: Json | null
          ai_comments: Json | null
          document_structure: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          summary?: string | null
          key_obligations?: Json | null
          risk_assessment?: Json | null
          confidence_score?: number | null
          processing_time_seconds?: number | null
          ai_model_used?: string
          document_content: string
          highlighted_sections?: Json | null
          ai_comments?: Json | null
          document_structure?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          summary?: string | null
          key_obligations?: Json | null
          risk_assessment?: Json | null
          confidence_score?: number | null
          processing_time_seconds?: number | null
          ai_model_used?: string
          document_content?: string
          highlighted_sections?: Json | null
          ai_comments?: Json | null
          document_structure?: Json | null
          created_at?: string
        }
      }
      user_annotations: {
        Row: {
          id: string
          analysis_id: string
          user_id: string
          text_start: number
          text_end: number
          comment_text: string
          annotation_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          user_id: string
          text_start: number
          text_end: number
          comment_text: string
          annotation_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          user_id?: string
          text_start?: number
          text_end?: number
          comment_text?: string
          annotation_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_conversations: {
        Row: {
          id: string
          analysis_id: string
          user_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          user_id: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          user_id?: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string | null
          price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Analysis = Database['public']['Tables']['analyses']['Row']
export type UserAnnotation = Database['public']['Tables']['user_annotations']['Row']
export type ChatConversation = Database['public']['Tables']['chat_conversations']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export interface HighlightedSection {
  startPosition: number
  endPosition: number
  text: string
  riskLevel: number
  type: string
  comment: string
  suggestion: string
  severity: 'low' | 'medium' | 'high'
}

export interface AIComment {
  position: number
  text: string
  type: 'warning' | 'info' | 'suggestion'
  severity: 'low' | 'medium' | 'high'
}

export interface DocumentSection {
  title: string
  startPosition: number
  endPosition: number
  subsections: DocumentSection[]
}

export interface AnalysisResult {
  summary: string
  keyObligations: string[]
  riskAssessment: {
    termination: number
    liability: number
    intellectualProperty: number
    payment: number
    renewal: number
  }
  highlightedSections: HighlightedSection[]
  aiComments: AIComment[]
  documentStructure: {
    sections: DocumentSection[]
  }
  plainEnglishExplanations: Record<string, string>
  confidenceScore: number
}