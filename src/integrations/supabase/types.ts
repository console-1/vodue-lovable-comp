export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string | null
          id: string
          mode: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mode?: string
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mode?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_workflow_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      extraction_errors: {
        Row: {
          created_at: string | null
          error_message: string
          error_type: string
          extraction_run_id: string
          file_path: string | null
          id: string
          node_name: string
          node_version: number | null
          stack_trace: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_type: string
          extraction_run_id: string
          file_path?: string | null
          id?: string
          node_name: string
          node_version?: number | null
          stack_trace?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_type?: string
          extraction_run_id?: string
          file_path?: string | null
          id?: string
          node_name?: string
          node_version?: number | null
          stack_trace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_errors_extraction_run_id_fkey"
            columns: ["extraction_run_id"]
            isOneToOne: false
            referencedRelation: "extraction_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_runs: {
        Row: {
          completed_at: string | null
          error_summary: string | null
          extractor_version: string | null
          id: string
          nodes_failed: number | null
          nodes_processed: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          error_summary?: string | null
          extractor_version?: string | null
          id?: string
          nodes_failed?: number | null
          nodes_processed?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          error_summary?: string | null
          extractor_version?: string | null
          id?: string
          nodes_failed?: number | null
          nodes_processed?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json | null
          role: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json | null
          role: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json | null
          role?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_workflow_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      node_credentials: {
        Row: {
          created_at: string | null
          credential_display_name: string | null
          credential_name: string
          id: string
          node_definition_id: string
          required: boolean | null
          test_request: Json | null
        }
        Insert: {
          created_at?: string | null
          credential_display_name?: string | null
          credential_name: string
          id?: string
          node_definition_id: string
          required?: boolean | null
          test_request?: Json | null
        }
        Update: {
          created_at?: string | null
          credential_display_name?: string | null
          credential_name?: string
          id?: string
          node_definition_id?: string
          required?: boolean | null
          test_request?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "node_credentials_node_definition_id_fkey"
            columns: ["node_definition_id"]
            isOneToOne: false
            referencedRelation: "current_node_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_credentials_node_definition_id_fkey"
            columns: ["node_definition_id"]
            isOneToOne: false
            referencedRelation: "node_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      node_definitions: {
        Row: {
          code_base_version: string | null
          created_at: string | null
          default_version: number | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          name: string
          node_group: string | null
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          code_base_version?: string | null
          created_at?: string | null
          default_version?: number | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          name: string
          node_group?: string | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          code_base_version?: string | null
          created_at?: string | null
          default_version?: number | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          name?: string
          node_group?: string | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      node_documentation: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          node_definition_id: string
          sort_order: number | null
          title: string | null
          type: string
          workflow_data: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          node_definition_id: string
          sort_order?: number | null
          title?: string | null
          type: string
          workflow_data?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          node_definition_id?: string
          sort_order?: number | null
          title?: string | null
          type?: string
          workflow_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "node_documentation_node_definition_id_fkey"
            columns: ["node_definition_id"]
            isOneToOne: false
            referencedRelation: "current_node_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_documentation_node_definition_id_fkey"
            columns: ["node_definition_id"]
            isOneToOne: false
            referencedRelation: "node_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      node_operations: {
        Row: {
          action: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string
          name: string
          node_version_id: string
          operation_type: string | null
          parent_resource: string | null
          request_method: string | null
          routing: Json | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          name: string
          node_version_id: string
          operation_type?: string | null
          parent_resource?: string | null
          request_method?: string | null
          routing?: Json | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          name?: string
          node_version_id?: string
          operation_type?: string | null
          parent_resource?: string | null
          request_method?: string | null
          routing?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "node_operations_node_version_id_fkey"
            columns: ["node_version_id"]
            isOneToOne: false
            referencedRelation: "node_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      node_parameters: {
        Row: {
          created_at: string | null
          default_value: Json | null
          depends_on: string | null
          description: string | null
          display_name: string | null
          display_options: Json | null
          extractors: Json | null
          id: string
          name: string
          node_version_id: string
          operation_id: string | null
          options: Json | null
          parent_parameter_id: string | null
          placeholder: string | null
          required: boolean | null
          sort_order: number | null
          type: string
          type_options: Json | null
          validation: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: Json | null
          depends_on?: string | null
          description?: string | null
          display_name?: string | null
          display_options?: Json | null
          extractors?: Json | null
          id?: string
          name: string
          node_version_id: string
          operation_id?: string | null
          options?: Json | null
          parent_parameter_id?: string | null
          placeholder?: string | null
          required?: boolean | null
          sort_order?: number | null
          type: string
          type_options?: Json | null
          validation?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: Json | null
          depends_on?: string | null
          description?: string | null
          display_name?: string | null
          display_options?: Json | null
          extractors?: Json | null
          id?: string
          name?: string
          node_version_id?: string
          operation_id?: string | null
          options?: Json | null
          parent_parameter_id?: string | null
          placeholder?: string | null
          required?: boolean | null
          sort_order?: number | null
          type?: string
          type_options?: Json | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "node_parameters_node_version_id_fkey"
            columns: ["node_version_id"]
            isOneToOne: false
            referencedRelation: "node_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_parameters_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "node_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_parameters_parent_parameter_id_fkey"
            columns: ["parent_parameter_id"]
            isOneToOne: false
            referencedRelation: "node_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      node_versions: {
        Row: {
          class_name: string
          created_at: string | null
          id: string
          inputs: Json | null
          node_definition_id: string
          outputs: Json | null
          properties: Json | null
          source_file_path: string
          typescript_definitions: string | null
          updated_at: string | null
          version: number
        }
        Insert: {
          class_name: string
          created_at?: string | null
          id?: string
          inputs?: Json | null
          node_definition_id: string
          outputs?: Json | null
          properties?: Json | null
          source_file_path: string
          typescript_definitions?: string | null
          updated_at?: string | null
          version: number
        }
        Update: {
          class_name?: string
          created_at?: string | null
          id?: string
          inputs?: Json | null
          node_definition_id?: string
          outputs?: Json | null
          properties?: Json | null
          source_file_path?: string
          typescript_definitions?: string | null
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "node_versions_node_definition_id_fkey"
            columns: ["node_definition_id"]
            isOneToOne: false
            referencedRelation: "current_node_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_versions_node_definition_id_fkey"
            columns: ["node_definition_id"]
            isOneToOne: false
            referencedRelation: "node_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_interactions: {
        Row: {
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string | null
          timestamp: string | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          timestamp?: string | null
          user_id: string
          workflow_id: string
        }
        Update: {
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          timestamp?: string | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_workflow_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workflow_interactions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_details_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_interactions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          description: string | null
          frontend_code: string | null
          id: string
          is_public: boolean | null
          n8n_json: Json
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          frontend_code?: string | null
          id?: string
          is_public?: boolean | null
          n8n_json?: Json
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          frontend_code?: string | null
          id?: string
          is_public?: boolean | null
          n8n_json?: Json
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_workflow_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      current_node_definitions: {
        Row: {
          class_name: string | null
          code_base_version: string | null
          created_at: string | null
          default_version: number | null
          description: string | null
          display_name: string | null
          icon: string | null
          id: string | null
          latest_version: number | null
          name: string | null
          node_group: string | null
          operation_count: number | null
          properties: Json | null
          subtitle: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          active_users_30d: number | null
          executions_30d: number | null
          new_users_30d: number | null
          public_workflows: number | null
          total_users: number | null
          total_workflows: number | null
          workflows_updated_7d: number | null
        }
        Relationships: []
      }
      popular_node_patterns: {
        Row: {
          node_1: string | null
          node_2: string | null
          pair_count: number | null
          public_usage: number | null
          public_usage_percentage: number | null
        }
        Relationships: []
      }
      user_workflow_stats: {
        Row: {
          active_workflows: number | null
          avg_workflow_complexity: number | null
          display_name: string | null
          last_activity: string | null
          public_workflows: number | null
          total_executions: number | null
          total_workflows: number | null
          user_id: string | null
        }
        Relationships: []
      }
      workflow_details_complete: {
        Row: {
          conversation_id: string | null
          conversation_mode: string | null
          conversation_title: string | null
          created_at: string | null
          creator_avatar: string | null
          creator_name: string | null
          description: string | null
          execution_count: number | null
          frontend_code: string | null
          id: string | null
          is_public: boolean | null
          n8n_json: Json | null
          name: string | null
          node_count: number | null
          status: string | null
          success_count: number | null
          updated_at: string | null
          user_id: string | null
          webhook_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_workflow_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      get_conversations_with_latest_message: {
        Args: { user_uuid: string }
        Returns: {
          conversation_id: string
          title: string
          mode: string
          created_at: string
          updated_at: string
          latest_message_content: string
          latest_message_timestamp: string
        }[]
      }
      get_node_details: {
        Args: { node_id: string }
        Returns: Json
      }
      get_user_workflow_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_workflow_suggestions: {
        Args: { current_node_ids: string[] }
        Returns: {
          suggested_node_id: string
          node_name: string
          display_name: string
          category: string
          compatibility_score: number
          usage_popularity: number
        }[]
      }
      refresh_search_vectors: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_table_stats: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      show_table_sizes: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          row_count: number
          total_size: string
          index_size: string
        }[]
      }
      test_query_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_name: string
          execution_time_ms: number
          record_count: number
        }[]
      }
      track_node_usage: {
        Args: {
          p_node_definition_id: string
          p_workflow_id?: string
          p_template_id?: string
          p_execution_time_ms?: number
          p_success?: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      conversation_mode: "build" | "interact"
      interaction_status: "success" | "error"
      message_role: "user" | "assistant"
      subscription_tier: "free" | "pro"
      workflow_status: "draft" | "deployed" | "active"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversation_mode: ["build", "interact"],
      interaction_status: ["success", "error"],
      message_role: ["user", "assistant"],
      subscription_tier: ["free", "pro"],
      workflow_status: ["draft", "deployed", "active"],
    },
  },
} as const
