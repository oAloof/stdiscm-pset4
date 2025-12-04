import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function SectionsPage() {
  const [sections, setSections] = useState([]);

  const navigate = useNavigate();

  // Fetch faculty sections
  useEffect(() => {
    const fetchData = async () => {
      const sectionsData = await api.getFacultySections();
      console.log("Faculty Sections:", sectionsData);
      setSections(sectionsData.sections);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />
      <h1 className="text-2xl font-bold mt-20 mb-5"></h1>

      {sections.map((s: any) => {
        return (
          <div
            key={s.id}
            className="card card-border bg-base-100 w-full max-w-screen-sm mx-4 my-2"
          >
            <div className="card-body">
              <h2 className="card-title">
                [{s.section_code}] {s.course_code}
              </h2>

              <div className="flex justify-between items-center mt-2">
                <p className="text-lg text-gray-500 font-semibold">
                  {s.enrolled_count}/{s.max_capacity}
                </p>

                {/* FACULTY BUTTON → View Grades */}
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate("/faculty/grades/" + s.id, {
                      state: {
                        sectionCode: s.section_code,
                      },
                    })
                  }
                >
                  View Grades
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
