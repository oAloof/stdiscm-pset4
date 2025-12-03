-- Distributed Enrollment System - Base Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (students, faculty, admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections table (1 faculty per section, multiple sections per course)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_code VARCHAR(50) NOT NULL,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_capacity INTEGER NOT NULL DEFAULT 40,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, section_code)
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    grade_value DECIMAL(5,2) NOT NULL CHECK (grade_value >= 0 AND grade_value <= 100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sections_course ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_faculty ON sections(faculty_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_section ON enrollments(section_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_section ON grades(section_id);

-- Transactional enrollment function
CREATE OR REPLACE FUNCTION enroll_student_transactional(
  p_student_id UUID,
  p_section_id UUID
) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_enrolled_count INT;
  v_max_capacity INT;
BEGIN
  -- Lock section row (prevents race conditions)
  SELECT enrolled_count, max_capacity 
  INTO v_enrolled_count, v_max_capacity
  FROM sections
  WHERE id = p_section_id
  FOR UPDATE;

  -- Validate section exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Section not found'::TEXT;
    RETURN;
  END IF;

  -- Check capacity
  IF v_enrolled_count >= v_max_capacity THEN
    RETURN QUERY SELECT FALSE, 'Section is full'::TEXT;
    RETURN;
  END IF;

  -- Insert enrollment (will fail if duplicate due to UNIQUE constraint)
  INSERT INTO enrollments (student_id, section_id)
  VALUES (p_student_id, p_section_id);

  -- Increment count (same transaction, auto-rollback on failure)
  UPDATE sections 
  SET enrolled_count = enrolled_count + 1
  WHERE id = p_section_id;

  RETURN QUERY SELECT TRUE, 'Student enrolled successfully'::TEXT;

EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT FALSE, 'Student already enrolled in this section'::TEXT;
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Database error occurred'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing
-- Password for all test users: "password123" (hashed with bcrypt)

-- Insert sample faculty
INSERT INTO users (email, name, role, password_hash) VALUES
('faculty1@dlsu.edu.ph', 'Dr. John Smith', 'FACULTY', '$2b$10$placeholder_hash_here'),
('faculty2@dlsu.edu.ph', 'Prof. Jane Doe', 'FACULTY', '$2b$10$placeholder_hash_here')
ON CONFLICT (email) DO NOTHING;

-- Insert sample students
INSERT INTO users (email, name, role, password_hash) VALUES
('student1@dlsu.edu.ph', 'Alice Johnson', 'STUDENT', '$2b$10$placeholder_hash_here'),
('student2@dlsu.edu.ph', 'Bob Williams', 'STUDENT', '$2b$10$placeholder_hash_here'),
('student3@dlsu.edu.ph', 'Charlie Brown', 'STUDENT', '$2b$10$placeholder_hash_here')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (code, name, description) VALUES
('STDISCM', 'Distributed Systems and Concurrent Computing', 'Study of distributed computing architectures and concurrent programming'),
('CSSWENG', 'Software Engineering', 'Software development lifecycle and engineering practices'),
('CSADPRG', 'Advanced Programming', 'Advanced programming concepts and paradigms')
ON CONFLICT (code) DO NOTHING;

-- Note: Need to update faculty_id values with actual UUIDs from users table
-- For now, these are placeholders. Run queries to get the actual faculty IDs first.
