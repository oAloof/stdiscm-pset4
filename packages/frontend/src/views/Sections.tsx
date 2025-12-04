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

  const navigate = useNavigate();

  // Fetch sections and enrollments on load
  useEffect(() => {
    const fetchData = async () => {
      const sectionsData = await api.getSections(courseId!);
      console.log("Sections:", sectionsData);
      setSections(sectionsData.sections);

      const enrollmentsData = await api.getEnrollments();
      console.log("Students Enrollments:", enrollmentsData);
      const enrollmentInThisCourse = enrollmentsData.enrollments.find(
        (e: any) => e.course_id === courseId
      );
      setCourseEnrollmentSectionId(enrollmentInThisCourse?.section_id || null);
      setEnrolledSectionId(enrollmentInThisCourse?.section_id || null);
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

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />
      <h1 className="text-2xl font-bold mt-20 mb-5">Sections for {courseCode}</h1>

      {sections.map((s) => {
        // Determine button state
        let btnText = "Enroll";
        let btnDisabled = false;

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

        return (
          <div
            key={s.id}
            className="card card-border bg-base-100 w-full max-w-screen-sm mx-4 my-2"
          >
            <div className="card-body">
              <h2 className="card-title">
                [{s.section_code}] {s.faculty_name}
              </h2>

              <div className="flex justify-between items-center mt-2">
                <p className="text-lg text-gray-500 font-semibold">
                  {s.enrolled_count}/{s.max_capacity}
                </p>
                <button
                  className="btn btn-primary"
                  disabled={btnDisabled}
                  onClick={() => handleEnroll(s.id)}
                >
                  {btnText}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate(-1)} // goes back to previous page
      >
        Back
      </button>
    </div>
  );
}
