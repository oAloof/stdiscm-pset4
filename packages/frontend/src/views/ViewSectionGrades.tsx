import { useEffect, useState } from "react";
import { useParams , useNavigate} from "react-router-dom";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function EditGrades() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const [grades, setGrades] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSectionGrades(sectionId!); // make sure this returns all enrollments
        console.log("SectionGrades:", data);
        setGrades(data.grades || []);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />
  
      <h1 className="text-2xl font-bold"></h1>
  
      {grades.length === 0 ? (
        <p className="text-gray-600 mt-20 mb-5">You have not given any grades yet.</p>
      ) : (
        <div>
        <h1 className="text-2xl font-bold mt-20 mb-5">Grades</h1>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full max-w-6xl">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, idx) => (
                <tr key={idx}>
                  <td>{g.student_name}</td>
                  <td>{g.grade_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}
       <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate(-1)} // goes back to previous page
      >
        Back
      </button>
    </div>
  );
  
}