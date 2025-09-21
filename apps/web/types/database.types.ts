export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username?: string
          full_name?: string
          avatar_url?: string
          role?: string
          tenant_id?: string
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug?: string
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          version_number: number
          content?: string
          created_by?: string
          created_at: string
        }
        Insert: any
        Update: any
      }
      documents: {
        Row: {
          id: string
          name: string
          title?: string
          content?: string
          type?: string
          category?: string
          status?: string
          tags?: string[]
          tenant_id?: string
          user_id?: string
          retention_until?: string
          file_url?: string
          file_size?: number
          mime_type?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      en13813_recipes: {
        Row: any
        Insert: any
        Update: any
      }
      en13813_dops: {
        Row: any
        Insert: any
        Update: any
      }
      en13813_batches: {
        Row: any
        Insert: any
        Update: any
      }
      en13813_test_reports: {
        Row: any
        Insert: any
        Update: any
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}