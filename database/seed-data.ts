import dotenv from 'dotenv';
import { createSupabaseClient } from '@pset4/shared-types';

// Load .env from root (one level up from database folder)
dotenv.config({ path: '../.env' });

// Valid bcrypt hash for "password123"
const VALID_PASSWORD_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

interface User {
  id: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  email: string;
}

interface Course {
  id: string;
  code: string;
}

async function seedData() {
  console.log('Starting data seeding...\n');
  const supabase = createSupabaseClient();

  try {
    // 1. Update User Passwords
    console.log('Updating user passwords...');
    const { error: updateError } = await supabase
      .from('users')
      // @ts-ignore
      .update({ password_hash: VALID_PASSWORD_HASH })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all users

    if (updateError) throw new Error(`Failed to update passwords: ${updateError.message}`);
    console.log('User passwords updated.');

    // 2. Get IDs for relationships
    const { data: usersData } = await supabase.from('users').select('id, role, email');
    const { data: coursesData } = await supabase.from('courses').select('id, code');

    if (!usersData || !coursesData) throw new Error('Failed to fetch users or courses');

    const users = usersData as unknown as User[];
    const courses = coursesData as unknown as Course[];

    const faculty = users.filter(u => u.role === 'FACULTY');
    const students = users.filter(u => u.role === 'STUDENT');

    if (faculty.length < 2 || students.length < 1) {
      throw new Error('Insufficient faculty or students for seeding. Check schema.sql data.');
    }

    // 3. Create Sections
    console.log('\nCreating sections...');
    const sectionsToCreate: any[] = [];

    // Helper to get faculty ID (round robin)
    const getFacultyId = (index: number) => faculty[index % faculty.length].id;

    let sectionCount = 0;
    for (const course of courses) {
      // Section 1
      sectionsToCreate.push({
        course_id: course.id,
        section_code: 'S11',
        faculty_id: getFacultyId(sectionCount++),
        max_capacity: 40,
        enrolled_count: 0
      });
      // Section 2
      sectionsToCreate.push({
        course_id: course.id,
        section_code: 'S12',
        faculty_id: getFacultyId(sectionCount++),
        max_capacity: 40,
        enrolled_count: 0
      });
    }

    // Upsert sections (using course_id + section_code constraint)
    const { data: createdSections, error: sectionError } = await supabase
      .from('sections')
      // @ts-ignore
      .upsert(sectionsToCreate, { onConflict: 'course_id,section_code' })
      .select();

    if (sectionError) throw new Error(`Failed to create sections: ${sectionError.message}`);
    console.log(`Created/Updated ${createdSections?.length} sections.`);

    // 4. Create Enrollments
    if (createdSections && createdSections.length > 0 && students.length > 0) {
      console.log('\nCreating enrollments...');
      const sections = createdSections as any[];
      const enrollmentsToCreate: any[] = [];

      // Enroll first student in first section of first course
      enrollmentsToCreate.push({
        student_id: students[0].id,
        section_id: sections[0].id
      });

      // Enroll second student in first section of first course
      if (students.length > 1) {
        enrollmentsToCreate.push({
          student_id: students[1].id,
          section_id: sections[0].id
        });
      }

      // Enroll first student in second course
      if (sections.length > 2) {
        enrollmentsToCreate.push({
          student_id: students[0].id,
          section_id: sections[2].id
        });
      }

      const { error: enrollError } = await supabase
        .from('enrollments')
        // @ts-ignore
        .upsert(enrollmentsToCreate, { onConflict: 'student_id,section_id' });

      if (enrollError) throw new Error(`Failed to create enrollments: ${enrollError.message}`);
      console.log(`Created/Updated ${enrollmentsToCreate.length} enrollments.`);
    }

    console.log('\nSeeding completed successfully!');

  } catch (error) {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  }
}

seedData();
