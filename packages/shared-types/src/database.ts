/**
 * Supabase database schema type definitions.
 * Defines tables: users, courses, sections, enrollments, grades.
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'STUDENT' | 'FACULTY' | 'ADMIN';
          password_hash: string;
          created_at: string;
        };
      };
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          created_at: string;
        };
      };
      sections: {
        Row: {
          id: string;
          course_id: string;
          section_code: string;
          faculty_id: string;
          max_capacity: number;
          enrolled_count: number;
          created_at: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          section_id: string;
          enrolled_at: string;
        };
      };
      grades: {
        Row: {
          id: string;
          student_id: string;
          section_id: string;
          grade_value: number;
          uploaded_at: string;
        };
      };
    };
  };
}

// Type aliases for database tables.
export type User = Database['public']['Tables']['users']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Section = Database['public']['Tables']['sections']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type Grade = Database['public']['Tables']['grades']['Row'];

export type UserRole = User['role'];

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a typed Supabase client instance.
 * 
 * @throws {Error} If SUPABASE_URL or authentication key environment variables are not set.
 * @returns {SupabaseClient<Database>} Configured Supabase client with full database typing.
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}
