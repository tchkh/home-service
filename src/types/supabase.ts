// types/supabase.ts

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
      users: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          password: string
          tel: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          email: string
          password: string
          tel: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          first_name?: string
          last_name?: string
          email?: string
          password?: string
          tel?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      admins: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          password: string
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          email: string
          password: string
        }
        Update: {
          id?: number
          first_name?: string
          last_name?: string
          email?: string
          password?: string
        }
      }

      services: {
        Row: {
          id: number
          category_id: number
          title: string
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          category_id: number
          title: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          category_id?: number
          title?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }

      sub_services: {
        Row: {
          id: number
          service_id: number
          title: string
          price: number
          service_unit: string
        }
        Insert: {
          id?: number
          service_id: number
          title: string
          price: number
          service_unit: string
        }
        Update: {
          id?: number
          service_id?: number
          title?: string
          price?: number
          service_unit?: string
        }
      }

      categories: {
        Row: {
          id: number
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
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
    StorageBackets: {
      buckets: {
        Row: {
          id: string
          name: string
        }
      }
    }
    Storage: {
      Objects: {
        Row: {
          name: string
          bucket_id: string
          owner: string
          metadata: Json
        }
        Insert: {
          name: string
          bucket_id: string
          owner?: string
          metadata?: Json
        }
        Update: {
          name?: string
          bucket_id?: string
          owner?: string
          metadata?: Json
        }
      }
    }
  }
}
