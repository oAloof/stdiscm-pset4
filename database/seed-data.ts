// @ts-nocheck
import dotenv from 'dotenv';
import { createSupabaseClient } from '@pset4/shared-types';

// Load .env from root
dotenv.config();

// Valid bcrypt hash for "password123"
const VALID_PASSWORD_HASH = '$2b$10$VkkBYbohTTksjsDWbI7aoezO2aefnX3OcFJMTS6VmvE25UyCh6P12';

async function seedData() {
  console.log('Starting data seeding...\n');
  const supabase = createSupabaseClient();

  try {
    // ====================================================================
    // STEP 1: CLEANUP - Make idempotent by deleting existing data
    // ====================================================================
    console.log('Cleaning up existing data...');

    // Delete in reverse FK order
    await supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✓ Cleanup complete\n');

    // ====================================================================
    // STEP 2: CREATE USERS
    // ====================================================================
    console.log('Creating users...');

    const usersToCreate = [
      // Faculty
      { email: 'faculty1@dlsu.edu.ph', name: 'Dr. John Smith', role: 'FACULTY', password_hash: VALID_PASSWORD_HASH },
      { email: 'faculty2@dlsu.edu.ph', name: 'Prof. Jane Doe', role: 'FACULTY', password_hash: VALID_PASSWORD_HASH },

      // Students (20 total)
      { email: 'student1@dlsu.edu.ph', name: 'Tony Stark', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student2@dlsu.edu.ph', name: 'Steve Rogers', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student3@dlsu.edu.ph', name: 'Natasha Romanoff', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student4@dlsu.edu.ph', name: 'Bruce Banner', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student5@dlsu.edu.ph', name: 'Thor Odinson', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student6@dlsu.edu.ph', name: 'Wanda Maximoff', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student7@dlsu.edu.ph', name: 'Peter Parker', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student8@dlsu.edu.ph', name: 'Elphaba Thropp', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student9@dlsu.edu.ph', name: 'Glinda Upland', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student10@dlsu.edu.ph', name: 'Fiyero Tigelaar', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student11@dlsu.edu.ph', name: 'Nessarose Thropp', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student12@dlsu.edu.ph', name: 'Boq Woodsman', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student13@dlsu.edu.ph', name: 'Phil Dunphy', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student14@dlsu.edu.ph', name: 'Claire Dunphy', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student15@dlsu.edu.ph', name: 'Haley Dunphy', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student16@dlsu.edu.ph', name: 'Alex Dunphy', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student17@dlsu.edu.ph', name: 'Luke Dunphy', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student18@dlsu.edu.ph', name: 'Gloria Pritchett', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student19@dlsu.edu.ph', name: 'Cameron Tucker', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
      { email: 'student20@dlsu.edu.ph', name: 'Mitchell Pritchett', role: 'STUDENT', password_hash: VALID_PASSWORD_HASH },
    ];

    const { data: createdUsers, error: usersError } = await supabase
      .from('users')
      .insert(usersToCreate)
      .select();

    if (usersError) throw new Error(`Failed to create users: ${usersError.message}`);
    console.log(`✓ Created ${createdUsers?.length} users (2 faculty, 20 students)\n`);

    // Get user IDs for relationships
    const faculty = createdUsers!.filter(u => u.role === 'FACULTY');
    const students = createdUsers!.filter(u => u.role === 'STUDENT');

    // ====================================================================
    // STEP 3: CREATE COURSES
    // ====================================================================
    console.log('Creating courses...');

    const coursesToCreate = [
      { code: 'STDISCM', name: 'Distributed Systems and Concurrent Computing', description: 'Study of distributed computing architectures and concurrent programming' },
      { code: 'CSSWENG', name: 'Software Engineering', description: 'Software development lifecycle and engineering practices' },
      { code: 'CSADPRG', name: 'Advanced Programming', description: 'Advanced programming concepts and paradigms' },
    ];

    const { data: createdCourses, error: coursesError } = await supabase
      .from('courses')
      .insert(coursesToCreate)
      .select();

    if (coursesError) throw new Error(`Failed to create courses: ${coursesError.message}`);
    console.log(`✓ Created ${createdCourses?.length} courses\n`);

    // ====================================================================
    // STEP 4: CREATE SECTIONS (with enrolled_count = 0)
    // ====================================================================
    console.log('Creating sections...');

    const sectionsToCreate = [
      // STDISCM - 3 sections
      { course_id: createdCourses![0].id, section_code: 'S11', faculty_id: faculty[0].id, max_capacity: 5, enrolled_count: 0 },   // Small for testing "full" scenario
      { course_id: createdCourses![0].id, section_code: 'S12', faculty_id: faculty[1].id, max_capacity: 15, enrolled_count: 0 },
      { course_id: createdCourses![0].id, section_code: 'S13', faculty_id: faculty[0].id, max_capacity: 15, enrolled_count: 0 },

      // CSSWENG - 3 sections
      { course_id: createdCourses![1].id, section_code: 'S11', faculty_id: faculty[0].id, max_capacity: 15, enrolled_count: 0 },
      { course_id: createdCourses![1].id, section_code: 'S12', faculty_id: faculty[1].id, max_capacity: 15, enrolled_count: 0 },
      { course_id: createdCourses![1].id, section_code: 'S13', faculty_id: faculty[0].id, max_capacity: 15, enrolled_count: 0 },

      // CSADPRG - 2 sections
      { course_id: createdCourses![2].id, section_code: 'S11', faculty_id: faculty[0].id, max_capacity: 15, enrolled_count: 0 },
      { course_id: createdCourses![2].id, section_code: 'S12', faculty_id: faculty[1].id, max_capacity: 15, enrolled_count: 0 },
    ];

    const { data: createdSections, error: sectionsError } = await supabase
      .from('sections')
      .insert(sectionsToCreate)
      .select();

    if (sectionsError) throw new Error(`Failed to create sections: ${sectionsError.message}`);
    console.log(`✓ Created ${createdSections?.length} sections\n`);

    // ====================================================================
    // STEP 5: CREATE ENROLLMENTS
    // ====================================================================
    console.log('Creating enrollments...');

    const enrollmentsToCreate = [
      // STDISCM S11 (max 5) - FULL (5/5) - cannot enroll more
      { student_id: students[0].id, section_id: createdSections![0].id },
      { student_id: students[1].id, section_id: createdSections![0].id },
      { student_id: students[2].id, section_id: createdSections![0].id },
      { student_id: students[3].id, section_id: createdSections![0].id },
      { student_id: students[4].id, section_id: createdSections![0].id },

      // STDISCM S12 (max 15) - NEAR FULL (14/15) - 1 spot left
      ...students.slice(5, 19).map(s => ({ student_id: s.id, section_id: createdSections![1].id })), // students 6-19 = 14 students

      // STDISCM S13 (max 15) - PARTIAL (10/15)
      ...students.slice(0, 10).map(s => ({ student_id: s.id, section_id: createdSections![2].id })),

      // CSSWENG S11 (max 15) - PARTIAL (8/15)
      ...students.slice(0, 8).map(s => ({ student_id: s.id, section_id: createdSections![3].id })),

      // CSSWENG S12 (max 15) - LOW (3/15)
      { student_id: students[10].id, section_id: createdSections![4].id },
      { student_id: students[15].id, section_id: createdSections![4].id },
      { student_id: students[19].id, section_id: createdSections![4].id },

      // CSSWENG S13 (max 15) - EMPTY (0/15)
      // No enrollments - for testing empty section

      // CSADPRG S11 (max 15) - FEW (5/15)
      ...students.slice(0, 5).map(s => ({ student_id: s.id, section_id: createdSections![6].id })),

      // CSADPRG S12 (max 15) - LOW (2/15)
      { student_id: students[18].id, section_id: createdSections![7].id },
      { student_id: students[19].id, section_id: createdSections![7].id },
    ];

    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert(enrollmentsToCreate);

    if (enrollError) throw new Error(`Failed to create enrollments: ${enrollError.message}`);
    console.log(`✓ Created ${enrollmentsToCreate.length} enrollments\n`);

    // ====================================================================
    // STEP 6: UPDATE enrolled_count BASED ON ACTUAL ENROLLMENTS
    // ====================================================================
    console.log('Updating section enrolled counts...');

    // Count enrollments per section
    const { data: enrollmentCounts } = await supabase
      .from('enrollments')
      .select('section_id');

    if (enrollmentCounts) {
      const countMap = new Map<string, number>();
      enrollmentCounts.forEach((e: any) => {
        countMap.set(e.section_id, (countMap.get(e.section_id) || 0) + 1);
      });

      // Update each section
      for (const [sectionId, count] of countMap.entries()) {
        await supabase
          .from('sections')
          .update({ enrolled_count: count })
          .eq('id', sectionId);
      }
    }

    console.log('✓ Section counts updated\n');

    // ====================================================================
    // STEP 7: CREATE GRADES (for some students, not all)
    // ====================================================================
    console.log('Creating grades...');

    const gradesToCreate = [
      // STDISCM S11 - Some students have grades, some don't
      { student_id: students[0].id, section_id: createdSections![0].id, grade_value: 4.0 },
      { student_id: students[1].id, section_id: createdSections![0].id, grade_value: 3.5 },
      { student_id: students[2].id, section_id: createdSections![0].id, grade_value: 2.5 },
      // students[3] and students[4] have NO grades yet

      // STDISCM S12 - Mix of grades
      { student_id: students[5].id, section_id: createdSections![1].id, grade_value: 3.0 },
      { student_id: students[6].id, section_id: createdSections![1].id, grade_value: 4.0 },
      // Other students in S12 have NO grades

      // CSSWENG S11 - One graded
      { student_id: students[0].id, section_id: createdSections![2].id, grade_value: 3.5 },
      // students[5] and students[10] have NO grades
    ];

    const { error: gradesError } = await supabase
      .from('grades')
      .insert(gradesToCreate);

    if (gradesError) throw new Error(`Failed to create grades: ${gradesError.message}`);
    console.log(`✓ Created ${gradesToCreate.length} grades\n`);

    // ====================================================================
    // SUMMARY
    // ====================================================================
    console.log('='.repeat(60));
    console.log('SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`  Users: ${createdUsers?.length} (2 faculty, 20 students)`);
    console.log(`  Courses: ${createdCourses?.length}`);
    console.log(`  Sections: ${createdSections?.length}`);
    console.log(`  Enrollments: ${enrollmentsToCreate.length}`);
    console.log(`  Grades: ${gradesToCreate.length}`);
    console.log('\nSection Enrollment Status:');
    console.log('  STDISCM S11: 5/5 (FULL - cannot enroll)');
    console.log('  STDISCM S12: 14/15 (NEAR FULL - 1 spot left)');
    console.log('  STDISCM S13: 10/15 (PARTIAL)');
    console.log('  CSSWENG S11: 8/15 (PARTIAL)');
    console.log('  CSSWENG S12: 3/15 (LOW)');
    console.log('  CSSWENG S13: 0/15 (EMPTY)');
    console.log('  CSADPRG S11: 5/15 (FEW)');
    console.log('  CSADPRG S12: 2/15 (LOW)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  }
}

seedData();
