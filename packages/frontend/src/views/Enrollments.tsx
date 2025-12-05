import { useEffect, useState } from "react";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await api.getEnrollments();
        console.log("Enrollments:", data);
        // fallback to empty array if undefined
        setEnrollments(data.enrollments || []);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false); // hide loader
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />

      {loading ? (
      <div className="flex flex-col items-center mt-20">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-gray-600">Loading enrolled classes...</p>
      </div>
      ) : (
      <>
        <h1 className="text-2xl font-bold my-4">My Enrollments</h1>

        {enrollments.length === 0 && (
          <p className="text-gray-600 mt-4">You are not enrolled in any courses yet.</p>
        )}

        {enrollments.map((e) => (
          <div
            key={e.id}
            className="card card-border bg-base-100 w-full max-w-screen-sm mx-4 my-2"
          >
            <div className="card-body">
              <h2 className="card-title">
                [{e.course_code}] {e.course_name}
              </h2>
              <p>Section: {e.section_code}</p>
              <p>Faculty: {e.faculty_name}</p>
            </div>
          </div>
        ))}
      </>
      )}
    </div>
  );
}
