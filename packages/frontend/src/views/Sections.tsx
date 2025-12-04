import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

type LocationState = {
  courseCode: string;
};

export default function SectionsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation() as unknown as { state: LocationState };
  const { courseCode } = location.state || {};
  const [sections, setSections] = useState([]);
  const [enrolledSectionId, setEnrolledSectionId] = useState<string | null>(null);
  const [courseEnrollmentSectionId, setCourseEnrollmentSectionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();

  // Fetch sections and enrollments on load
  useEffect(() => {
    const fetchData = async () => {
      // Load user from local storage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.error("No user found in localStorage");
        return;
      }
  
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
  
      // Fetch sections
      const sectionsData = await api.getSections(courseId!);
      setSections(sectionsData.sections);
  
      // If student → load enrollments
      if (parsedUser.role === "STUDENT") {
        const enrollmentsData = await api.getEnrollments();
        const enrollmentInThisCourse = enrollmentsData.enrollments.find(
          (e: any) => e.course_id === courseId
        );
        setCourseEnrollmentSectionId(enrollmentInThisCourse?.section_id || null);
        setEnrolledSectionId(enrollmentInThisCourse?.section_id || null);
      }
    };
  
    fetchData();
  }, [courseId]);

  const handleEnroll = async (sectionId: string) => {
    const result = await api.enrollInSection(sectionId);
    if (result.success) {
      // Update local state for real-time count
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, enrolled_count: s.enrolled_count + 1 }
            : s
        )
      );
      setEnrolledSectionId(sectionId);
      setCourseEnrollmentSectionId(sectionId);
    } else {
      alert(result.message || "Enrollment failed");
    }
  };

  const handleViewGrades = (sectionId: string) => {
    navigate(`/faculty/grades/${sectionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />
      <h1 className="text-2xl font-bold mt-20 mb-5">Sections for {courseCode}</h1>

      {sections.map((s) => {
        // STUDENT button logic
        let btnText = "Enroll";
        let btnDisabled = false;

        if (user?.role === "STUDENT") {
          if (enrolledSectionId === s.id) {
            btnText = "Enrolled";
            btnDisabled = true;
          } else if (courseEnrollmentSectionId && courseEnrollmentSectionId !== s.id) {
            btnText = "Already in Course";
            btnDisabled = true;
          } else if (s.enrolled_count >= s.max_capacity) {
            btnText = "Full";
            btnDisabled = true;
          }
        }

        // FACULTY button logic
        let facultyBtnText = "View Grades";
        let facultyBtnDisabled = user?.id !== s.faculty_id;

        return (
          <div key={s.id} className="card card-border bg-base-100 w-full max-w-screen-sm mx-4 my-2">
            <div className="card-body">
              <h2 className="card-title">
                [{s.section_code}] {s.faculty_name}
              </h2>

              <div className="flex justify-between items-center mt-2">
                <p className="text-lg text-gray-500 font-semibold">
                  {s.enrolled_count}/{s.max_capacity}
                </p>

                {/* STUDENT MODE */}
                {user?.role === "STUDENT" && (
                  <button
                    className="btn btn-primary"
                    disabled={btnDisabled}
                    onClick={() => handleEnroll(s.id)}
                  >
                    {btnText}
                  </button>
                )}

                {/* FACULTY MODE */}
                {user?.role === "FACULTY" && (
                  <button
                    className="btn btn-secondary"
                    disabled={facultyBtnDisabled}
                    onClick={() => handleViewGrades(s.id)}
                  >
                    {facultyBtnText}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}
