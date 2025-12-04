import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.getCourses();
      console.log("Courses:", data);
      setCourses(data.courses); 
    };

    fetchData();
  }, []);

  const handleViewSections = (courseId: string, courseCode: string) => {
    navigate(`/courses/sections/${courseId}`, {
      state: { courseCode }, // pass the course code
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />
      <h1 className="text-2xl font-bold my-4">ViewCourses</h1>

      {courses.map((c) => (
        <div key={c.id} className="card card-border bg-base-100 w-full max-w-screen-sm mx-4 my-2">
          <div className="card-body">
            <h2 className="card-title">[{c.code}] {c.name}</h2>
            <p>{c.description}</p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-primary"
                onClick={() => handleViewSections(c.id, c.code)}
              >
                View Sections
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
