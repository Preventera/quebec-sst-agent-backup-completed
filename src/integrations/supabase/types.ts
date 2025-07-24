export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      conversation_logs: {
        Row: {
          agent_name: string
          agent_response: string
          context_data: Json | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          user_message: string
        }
        Insert: {
          agent_name: string
          agent_response: string
          context_data?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          user_message: string
        }
        Update: {
          agent_name?: string
          agent_response?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      learning_metrics: {
        Row: {
          accuracy_percentage: number
          agent_name: string
          compliant_responses: number
          id: string
          last_updated: string
          total_annotations: number
        }
        Insert: {
          accuracy_percentage?: number
          agent_name: string
          compliant_responses?: number
          id?: string
          last_updated?: string
          total_annotations?: number
        }
        Update: {
          accuracy_percentage?: number
          agent_name?: string
          compliant_responses?: number
          id?: string
          last_updated?: string
          total_annotations?: number
        }
        Relationships: []
      }
      response_annotations: {
        Row: {
          annotated_by: string
          annotation_notes: string | null
          conversation_log_id: string
          created_at: string
          id: string
          is_compliant: boolean
          updated_at: string
        }
        Insert: {
          annotated_by: string
          annotation_notes?: string | null
          conversation_log_id: string
          created_at?: string
          id?: string
          is_compliant: boolean
          updated_at?: string
        }
        Update: {
          annotated_by?: string
          annotation_notes?: string | null
          conversation_log_id?: string
          created_at?: string
          id?: string
          is_compliant?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_annotations_conversation_log_id_fkey"
            columns: ["conversation_log_id"]
            isOneToOne: false
            referencedRelation: "conversation_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_content_changes: {
        Row: {
          change_type: string
          content_id: string
          detected_at: string
          id: string
          new_content: string | null
          notified: boolean
          previous_content: string | null
          summary: string | null
        }
        Insert: {
          change_type: string
          content_id: string
          detected_at?: string
          id?: string
          new_content?: string | null
          notified?: boolean
          previous_content?: string | null
          summary?: string | null
        }
        Update: {
          change_type?: string
          content_id?: string
          detected_at?: string
          id?: string
          new_content?: string | null
          notified?: boolean
          previous_content?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_content_changes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "sst_crawled_content"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_crawled_content: {
        Row: {
          article_number: string | null
          content: string
          content_hash: string
          crawled_at: string
          created_at: string
          id: string
          last_updated_at: string
          section: string | null
          source_id: string
          tags: string[] | null
          title: string
          url: string
        }
        Insert: {
          article_number?: string | null
          content: string
          content_hash: string
          crawled_at?: string
          created_at?: string
          id?: string
          last_updated_at?: string
          section?: string | null
          source_id: string
          tags?: string[] | null
          title: string
          url: string
        }
        Update: {
          article_number?: string | null
          content?: string
          content_hash?: string
          crawled_at?: string
          created_at?: string
          id?: string
          last_updated_at?: string
          section?: string | null
          source_id?: string
          tags?: string[] | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sst_crawled_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sst_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_sources: {
        Row: {
          crawl_frequency: number
          created_at: string
          id: string
          is_active: boolean
          last_crawled_at: string | null
          name: string
          source_type: string
          updated_at: string
          url: string
        }
        Insert: {
          crawl_frequency?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_crawled_at?: string | null
          name: string
          source_type: string
          updated_at?: string
          url: string
        }
        Update: {
          crawl_frequency?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_crawled_at?: string | null
          name?: string
          source_type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
