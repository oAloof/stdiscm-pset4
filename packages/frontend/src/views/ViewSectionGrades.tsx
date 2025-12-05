import { useEffect, useState } from "react";
import { useParams , useNavigate} from "react-router-dom";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function EditGrades() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSectionGrades(sectionId!); // make sure this returns all enrollments
        console.log("SectionGrades:", data);
        setGrades(data.grades || []);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
      } finally {
        setLoading(false);
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
      ) : grades.length === 0 ? (
        // ⬇️ IF LOADING IS DONE BUT NO GRADES
        <p className="text-gray-600 mt-20 mb-5">You have not given any grades yet.</p>
      ) : (
        <div className="w-full flex flex-col items-center">
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
                {grades.map((g: any, idx: number) => (
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