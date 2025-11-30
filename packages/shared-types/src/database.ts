/**
 * Database schema types for Supabase
 * Tables: users, courses, sections, enrollments, grades
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

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client instance with proper typing
 * Uses environment variables for configuration
 * @returns Typed Supabase client
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) are set in your .env file.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}
