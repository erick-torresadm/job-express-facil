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
      alertas: {
        Row: {
          ativo: boolean
          bairro: string | null
          cidade: string | null
          created_at: string
          id: string
          profissao: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cidade?: string | null
          created_at?: string
          id?: string
          profissao?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cidade?: string | null
          created_at?: string
          id?: string
          profissao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      anuncios: {
        Row: {
          ativo: boolean
          cliques: number
          created_at: string
          html_custom: string | null
          id: string
          imagem_url: string | null
          impressoes: number
          link_url: string | null
          placement: string
          prioridade: number
          titulo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cliques?: number
          created_at?: string
          html_custom?: string | null
          id?: string
          imagem_url?: string | null
          impressoes?: number
          link_url?: string | null
          placement: string
          prioridade?: number
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cliques?: number
          created_at?: string
          html_custom?: string | null
          id?: string
          imagem_url?: string | null
          impressoes?: number
          link_url?: string | null
          placement?: string
          prioridade?: number
          titulo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assinaturas: {
        Row: {
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          ciclo: Database["public"]["Enums"]["plano_ciclo"]
          created_at: string
          empresa_id: string
          id: string
          plano: Database["public"]["Enums"]["plano_tipo"]
          proximo_vencimento: string | null
          status: Database["public"]["Enums"]["assinatura_status"]
          updated_at: string
          valor: number
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          ciclo: Database["public"]["Enums"]["plano_ciclo"]
          created_at?: string
          empresa_id: string
          id?: string
          plano: Database["public"]["Enums"]["plano_tipo"]
          proximo_vencimento?: string | null
          status?: Database["public"]["Enums"]["assinatura_status"]
          updated_at?: string
          valor: number
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          ciclo?: Database["public"]["Enums"]["plano_ciclo"]
          created_at?: string
          empresa_id?: string
          id?: string
          plano?: Database["public"]["Enums"]["plano_tipo"]
          proximo_vencimento?: string | null
          status?: Database["public"]["Enums"]["assinatura_status"]
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      candidaturas: {
        Row: {
          candidato_id: string
          created_at: string
          curriculo_id: string
          empresa_id: string
          id: string
          respostas: Json
          status: Database["public"]["Enums"]["candidatura_status"]
          updated_at: string
          vaga_id: string
        }
        Insert: {
          candidato_id: string
          created_at?: string
          curriculo_id: string
          empresa_id: string
          id?: string
          respostas?: Json
          status?: Database["public"]["Enums"]["candidatura_status"]
          updated_at?: string
          vaga_id: string
        }
        Update: {
          candidato_id?: string
          created_at?: string
          curriculo_id?: string
          empresa_id?: string
          id?: string
          respostas?: Json
          status?: Database["public"]["Enums"]["candidatura_status"]
          updated_at?: string
          vaga_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
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
          empresa_origem_id: string | null
          endereco: string | null
          experiencias: Json
          habilidades: Json
          id: string
          idiomas: Json
          latitude: number | null
          linkedin_url: string | null
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
          empresa_origem_id?: string | null
          endereco?: string | null
          experiencias?: Json
          habilidades?: Json
          id?: string
          idiomas?: Json
          latitude?: number | null
          linkedin_url?: string | null
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
          empresa_origem_id?: string | null
          endereco?: string | null
          experiencias?: Json
          habilidades?: Json
          id?: string
          idiomas?: Json
          latitude?: number | null
          linkedin_url?: string | null
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
      favoritos: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vaga_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vaga_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vaga_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
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
          asaas_customer_id: string | null
          avatar_url: string | null
          bio_social: string | null
          campos_extras: Json
          company_name: string | null
          cor_primaria: string | null
          cover_url: string | null
          cpf_cnpj: string | null
          created_at: string
          full_name: string | null
          handle: string | null
          id: string
          logo_url: string | null
          slug_publico: string | null
          sobre: string | null
          updated_at: string
          verificada: boolean
          whatsapp: string | null
        }
        Insert: {
          asaas_customer_id?: string | null
          avatar_url?: string | null
          bio_social?: string | null
          campos_extras?: Json
          company_name?: string | null
          cor_primaria?: string | null
          cover_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          full_name?: string | null
          handle?: string | null
          id: string
          logo_url?: string | null
          slug_publico?: string | null
          sobre?: string | null
          updated_at?: string
          verificada?: boolean
          whatsapp?: string | null
        }
        Update: {
          asaas_customer_id?: string | null
          avatar_url?: string | null
          bio_social?: string | null
          campos_extras?: Json
          company_name?: string | null
          cor_primaria?: string | null
          cover_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          full_name?: string | null
          handle?: string | null
          id?: string
          logo_url?: string | null
          slug_publico?: string | null
          sobre?: string | null
          updated_at?: string
          verificada?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      revelacoes: {
        Row: {
          created_at: string
          curriculo_id: string
          empresa_id: string
          id: string
        }
        Insert: {
          created_at?: string
          curriculo_id: string
          empresa_id: string
          id?: string
        }
        Update: {
          created_at?: string
          curriculo_id?: string
          empresa_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revelacoes_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
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
      verificacoes: {
        Row: {
          comprovante_url: string
          created_at: string
          documento_url: string
          empresa_id: string
          id: string
          motivo_rejeicao: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verificacao_status"]
          updated_at: string
        }
        Insert: {
          comprovante_url: string
          created_at?: string
          documento_url: string
          empresa_id: string
          id?: string
          motivo_rejeicao?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verificacao_status"]
          updated_at?: string
        }
        Update: {
          comprovante_url?: string
          created_at?: string
          documento_url?: string
          empresa_id?: string
          id?: string
          motivo_rejeicao?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verificacao_status"]
          updated_at?: string
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
      app_role: "candidato" | "empresa" | "admin"
      assinatura_status: "pendente" | "ativa" | "atrasada" | "cancelada"
      candidatura_status: "enviado" | "visto" | "em_analise" | "finalizado"
      plano_ciclo: "mensal" | "anual"
      plano_tipo: "basico" | "full"
      verificacao_status: "pendente" | "aprovado" | "rejeitado"
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
      app_role: ["candidato", "empresa", "admin"],
      assinatura_status: ["pendente", "ativa", "atrasada", "cancelada"],
      candidatura_status: ["enviado", "visto", "em_analise", "finalizado"],
      plano_ciclo: ["mensal", "anual"],
      plano_tipo: ["basico", "full"],
      verificacao_status: ["pendente", "aprovado", "rejeitado"],
    },
  },
} as const
