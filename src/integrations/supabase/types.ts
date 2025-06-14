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
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["conversation_mode"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode: Database["public"]["Enums"]["conversation_mode"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["conversation_mode"]
          title?: string
          updated_at?: string
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
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["message_role"]
          timestamp: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["message_role"]
          timestamp?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["message_role"]
          timestamp?: string
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
        ]
      }
      node_definitions: {
        Row: {
          category: string | null
          created_at: string
          deprecated: boolean
          description: string | null
          display_name: string
          example_config: Json | null
          icon: string | null
          id: string
          node_type: string
          parameters_schema: Json | null
          replaced_by: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          deprecated?: boolean
          description?: string | null
          display_name: string
          example_config?: Json | null
          icon?: string | null
          id?: string
          node_type: string
          parameters_schema?: Json | null
          replaced_by?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          deprecated?: boolean
          description?: string | null
          display_name?: string
          example_config?: Json | null
          icon?: string | null
          id?: string
          node_type?: string
          parameters_schema?: Json | null
          replaced_by?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      node_parameters: {
        Row: {
          default_value: string | null
          description: string | null
          id: string
          node_definition_id: string
          options: Json | null
          parameter_name: string
          parameter_type: string
          required: boolean
          validation_rules: Json | null
        }
        Insert: {
          default_value?: string | null
          description?: string | null
          id?: string
          node_definition_id: string
          options?: Json | null
          parameter_name: string
          parameter_type: string
          required?: boolean
          validation_rules?: Json | null
        }
        Update: {
          default_value?: string | null
          description?: string | null
          id?: string
          node_definition_id?: string
          options?: Json | null
          parameter_name?: string
          parameter_type?: string
          required?: boolean
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "node_parameters_node_definition_id_fkey"
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
          created_at: string
          display_name: string | null
          id: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      workflow_interactions: {
        Row: {
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: Database["public"]["Enums"]["interaction_status"]
          timestamp: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status: Database["public"]["Enums"]["interaction_status"]
          timestamp?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: Database["public"]["Enums"]["interaction_status"]
          timestamp?: string
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
            foreignKeyName: "workflow_interactions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean
          n8n_workflow: Json | null
          name: string
          tags: string[] | null
          usage_count: number
          use_case: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean
          n8n_workflow?: Json | null
          name: string
          tags?: string[] | null
          usage_count?: number
          use_case?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean
          n8n_workflow?: Json | null
          name?: string
          tags?: string[] | null
          usage_count?: number
          use_case?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          conversation_id: string | null
          created_at: string
          description: string | null
          frontend_code: string | null
          id: string
          is_public: boolean
          n8n_json: Json | null
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          frontend_code?: string | null
          id?: string
          is_public?: boolean
          n8n_json?: Json | null
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          frontend_code?: string | null
          id?: string
          is_public?: boolean
          n8n_json?: Json | null
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
