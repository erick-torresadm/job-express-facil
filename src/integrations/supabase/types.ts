export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      curriculos: {
        Row: {
          bairro: string | null
          cidade: string | null
          cnh: string | null
          created_at: string
          dicas: Json
          disponibilidade: string | null
          duracao_segundos: number
          email: string | null
          endereco: string | null
          experiencias: Json
          habilidades: Json
          id: string
          idiomas: Json
          latitude: number | null
          longitude: number | null
          nome: string
          pretensao_salarial: string | null
          profissao: string
          resumo: string
          slug: string
          tem_audio: boolean
          tem_video: boolean
          transcricao: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          cnh?: string | null
          created_at?: string
          dicas?: Json
          disponibilidade?: string | null
          duracao_segundos?: number
          email?: string | null
          endereco?: string | null
          experiencias?: Json
          habilidades?: Json
          id?: string
          idiomas?: Json
          latitude?: number | null
          longitude?: number | null
          nome: string
          pretensao_salarial?: string | null
          profissao: string
          resumo: string
          slug: string
          tem_audio?: boolean
          tem_video?: boolean
          transcricao?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          cnh?: string | null
          created_at?: string
          dicas?: Json
          disponibilidade?: string | null
          duracao_segundos?: number
          email?: string | null
          endereco?: string | null
          experiencias?: Json
          habilidades?: Json
          id?: string
          idiomas?: Json
          latitude?: number | null
          longitude?: number | null
          nome?: string
          pretensao_salarial?: string | null
          profissao?: string
          resumo?: string
          slug?: string
          tem_audio?: boolean
          tem_video?: boolean
          transcricao?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          autor: string
          conteudo: string
          cover_url: string | null
          created_at: string
          id: string
          publicado: boolean
          published_at: string
          resumo: string
          slug: string
          tags: Json
          titulo: string
          updated_at: string
        }
        Insert: {
          autor?: string
          conteudo: string
          cover_url?: string | null
          created_at?: string
          id?: string
          publicado?: boolean
          published_at?: string
          resumo: string
          slug: string
          tags?: Json
          titulo: string
          updated_at?: string
        }
        Update: {
          autor?: string
          conteudo?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          publicado?: boolean
          published_at?: string
          resumo?: string
          slug?: string
          tags?: Json
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vagas: {
        Row: {
          ativa: boolean
          bairro: string
          cidade: string
          created_at: string
          custo_alimentacao_mes: number | null
          descricao: string | null
          empresa_id: string
          empresa_nome: string
          endereco: string | null
          faixa_salarial_sugerida: string | null
          horario: string
          id: string
          latitude: number | null
          longitude: number | null
          perguntas_triagem: Json
          profissao: string
          profissao_slug: string
          requisitos: Json
          risco_fraude: number
          risco_motivo: string | null
          salario: string
          slug: string | null
          titulo: string
          updated_at: string
          urgente: boolean
        }
        Insert: {
          ativa?: boolean
          bairro: string
          cidade?: string
          created_at?: string
          custo_alimentacao_mes?: number | null
          descricao?: string | null
          empresa_id: string
          empresa_nome: string
          endereco?: string | null
          faixa_salarial_sugerida?: string | null
          horario: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          perguntas_triagem?: Json
          profissao: string
          profissao_slug: string
          requisitos?: Json
          risco_fraude?: number
          risco_motivo?: string | null
          salario: string
          slug?: string | null
          titulo: string
          updated_at?: string
          urgente?: boolean
        }
        Update: {
          ativa?: boolean
          bairro?: string
          cidade?: string
          created_at?: string
          custo_alimentacao_mes?: number | null
          descricao?: string | null
          empresa_id?: string
          empresa_nome?: string
          endereco?: string | null
          faixa_salarial_sugerida?: string | null
          horario?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          perguntas_triagem?: Json
          profissao?: string
          profissao_slug?: string
          requisitos?: Json
          risco_fraude?: number
          risco_motivo?: string | null
          salario?: string
          slug?: string | null
          titulo?: string
          updated_at?: string
          urgente?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "candidato" | "empresa"
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
    Enums: {
      app_role: ["candidato", "empresa"],
    },
  },
} as const
