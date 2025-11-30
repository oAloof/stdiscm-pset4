// TODO: Define database types for Supabase schema
// Tables: users, courses, sections, enrollments, grades

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

// TODO: Implement Supabase client creation function
