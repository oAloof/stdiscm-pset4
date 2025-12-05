import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import NavBar from "../components/NavBar";

export default function EditGrades() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [students, setStudents] = useState<any[]>([]);
  const [editedGrades, setEditedGrades] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const gradeOptions = ["NGS", 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0.0];

  // Fetch section students on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSectionStudents(sectionId!);
        console.log("Loaded Section Students:", data);
        setStudents(data.students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectionId]);

  // Handle grade changes
  const handleChange = (studentId: string, newGrade: string | number) => {
    setEditedGrades((prev: any) => ({
      ...prev,
      [studentId]: newGrade === "NGS" ? null : Number(newGrade),
    }));
  };

  // Save all updated grades individually
  const handleSave = async () => {
    try {
      for (const [studentId, grade_value] of Object.entries(editedGrades)) {
        if (grade_value === null) continue; // skip NGS if desired
        const result = await api.uploadGrade(studentId, sectionId!, grade_value as number);
        if (!result.success) {
          alert(`Failed to update grade for student ${studentId}: ${result.message}`);
        }
      }

      // Update local table instantly
      setStudents((prev) =>
        prev.map((s) =>
          editedGrades[s.student_id] !== undefined
            ? { ...s, grade_value: editedGrades[s.student_id] }
            : s
        )
      );

      setEditedGrades({});
      alert("Grades updated successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving grades.");
    }
  };

  const hasChanges = Object.keys(editedGrades).length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center bg-primary-100 p-4">
      <NavBar />

      {loading ? (
        <div className="flex flex-col items-center mt-20">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-gray-600">Loading students...</p>
          <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mt-20 mb-5">Edit Grades</h1>

          {students.length === 0 ? (
            <p className="text-gray-600 mt-10">No enrolled students.</p>
          ) : (
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full max-w-6xl">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const currentValue =
                      editedGrades[s.student_id] !== undefined
                        ? editedGrades[s.student_id]
                        : s.grade_value ?? "NGS";

                    return (
                      <tr key={s.student_id}>
                        <td>{s.name}</td>
                        <td>
                          <select
                            className="select select-bordered"
                            value={currentValue === null ? "NGS" : currentValue}
                            onChange={(e) => handleChange(s.student_id, e.target.value)}
                          >
                            {gradeOptions.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Buttons aligned to right */}
          <div className="w-full flex justify-end mt-4">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>

            {students.length > 0 && (
              <button
                className="btn btn-primary ml-3"
                disabled={!hasChanges}
                onClick={handleSave}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
