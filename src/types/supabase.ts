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
      consultas: {
        Row: {
          cintura: number | null
          created_at: string | null
          data_consulta: string
          id: string
          observacoes: string | null
          paciente_id: string
          percentual_gordura: number | null
          peso: number | null
          proximo_retorno: string | null
          quadril: number | null
        }
        Insert: {
          cintura?: number | null
          created_at?: string | null
          data_consulta?: string
          id?: string
          observacoes?: string | null
          paciente_id: string
          percentual_gordura?: number | null
          peso?: number | null
          proximo_retorno?: string | null
          quadril?: number | null
        }
        Update: {
          cintura?: number | null
          created_at?: string | null
          data_consulta?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string
          percentual_gordura?: number | null
          peso?: number | null
          proximo_retorno?: string | null
          quadril?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_engaac: {
        Row: {
          assunto: string | null
          created_at: string | null
          email: string
          id: string
          mensagem: string
          nome: string
          telefone: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string | null
          email: string
          id?: string
          mensagem: string
          nome: string
          telefone?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string | null
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      nutricionistas: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          alergias: string[] | null
          altura: number | null
          atividade_fisica: boolean | null
          atividade_fisica_descricao: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          horario_acorda: string | null
          horario_dorme: string | null
          id: string
          litros_agua: number | null
          medicamentos: string | null
          nivel_atividade: string | null
          nome: string
          nutricionista_id: string
          objetivo_texto: string | null
          objetivos: string[] | null
          observacoes: string | null
          patologias: string[] | null
          peso_inicial: number | null
          refeicoes_por_dia: number | null
          restricoes_alimentares: string[] | null
          sexo: string | null
          suplementos: string | null
          telefone: string | null
          whatsapp: string | null
        }
        Insert: {
          alergias?: string[] | null
          altura?: number | null
          atividade_fisica?: boolean | null
          atividade_fisica_descricao?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          horario_acorda?: string | null
          horario_dorme?: string | null
          id?: string
          litros_agua?: number | null
          medicamentos?: string | null
          nivel_atividade?: string | null
          nome: string
          nutricionista_id: string
          objetivo_texto?: string | null
          objetivos?: string[] | null
          observacoes?: string | null
          patologias?: string[] | null
          peso_inicial?: number | null
          refeicoes_por_dia?: number | null
          restricoes_alimentares?: string[] | null
          sexo?: string | null
          suplementos?: string | null
          telefone?: string | null
          whatsapp?: string | null
        }
        Update: {
          alergias?: string[] | null
          altura?: number | null
          atividade_fisica?: boolean | null
          atividade_fisica_descricao?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          horario_acorda?: string | null
          horario_dorme?: string | null
          id?: string
          litros_agua?: number | null
          medicamentos?: string | null
          nivel_atividade?: string | null
          nome?: string
          nutricionista_id?: string
          objetivo_texto?: string | null
          objetivos?: string[] | null
          observacoes?: string | null
          patologias?: string[] | null
          peso_inicial?: number | null
          refeicoes_por_dia?: number | null
          restricoes_alimentares?: string[] | null
          sexo?: string | null
          suplementos?: string | null
          telefone?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_nutricionista_id_fkey"
            columns: ["nutricionista_id"]
            isOneToOne: false
            referencedRelation: "nutricionistas"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_alimentares: {
        Row: {
          conteudo: Json
          created_at: string | null
          id: string
          paciente_id: string
        }
        Insert: {
          conteudo: Json
          created_at?: string | null
          id?: string
          paciente_id: string
        }
        Update: {
          conteudo?: Json
          created_at?: string | null
          id?: string
          paciente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_alimentares_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
