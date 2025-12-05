import { useEffect, useState } from "react";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function ViewGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getGrades(); // make sure this returns all enrollments
        console.log("Grades:", data);
        setGrades(data.grades || []);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
      } finally{
        setLoading(false); // hide loader
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />
  
      <h1 className="text-2xl font-bold"></h1>
  
      {loading ? (
      <div className="flex flex-col items-center mt-20">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-gray-600">Loading grades...</p>
      </div>
      ) : (
      grades.length === 0 ? (
        <p className="text-gray-600 mt-20 mb-5">You have not been graded yet.</p>
      ) : (
        <div>
        <h1 className="text-2xl font-bold mt-20 mb-5">Grades</h1>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full max-w-6xl">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, idx) => (
                <tr key={idx}>
                  <td>{g.course_code}</td>
                  <td>{g.course_name}</td>
                  <td>{g.grade_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )
      )}
    </div>
  );
  
}
