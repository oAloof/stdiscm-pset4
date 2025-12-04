// API client for communicating with the API Gateway

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

// TODO: Implement API client functions
// - login(email, password)
// - logout()
// - getCourses()
// - getSections(courseId)
// - enrollInSection(sectionId)
// - getGrades()
// - uploadGrade(studentId, sectionId, gradeValue)

export const api = {
 
  // --- AUTH --------------------------------------------
  login: async (email: string, password: string) => {
    console.log("Calling login API...");

    console.log(email, "+", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    console.log("Raw response:", response);

    const data = await response.json();

    console.log("Parsed login JSON:", data);

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  logout: async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    localStorage.removeItem("token");
    return response.json();
  },

  // --- COURSES ------------------------------------------
  getCourses: async (limit?: number, offset?: number) => {
    const query = new URLSearchParams();
    if (limit) query.append("limit", String(limit));
    if (offset) query.append("offset", String(offset));

    const response = await fetch(`${API_BASE_URL}/courses?${query.toString()}`);
    return response.json(); // { courses: [...] }
  },

  getSections: async (courseId: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/sections/${courseId}`);
    return response.json(); // { sections: [...] }
  },

  enrollInSection: async (sectionId: string) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ section_id: sectionId }),
    });

    return response.json(); // { success, message }
  },

  getFacultySections: async () => {
    const token = localStorage.getItem("token");
  
    const response = await fetch(`${API_BASE_URL}/courses/faculty/sections`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  
    return response.json(); // { sections: [...] }
  },  

  getEnrollments: async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/courses/enrollments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    return response.json(); // { enrollments: [...] }
  },
    // --- Grades ------------------------------------------

getGrades: async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/grades`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json(); // { grades: [...] }
},

uploadGrade: async (studentId: string, sectionId: string, gradeValue: number) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/grades`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      student_id: studentId,
      section_id: sectionId,
      grade_value: gradeValue,
    }),
  });

  return response.json(); // { success, message }
},

getSectionGrades: async (sectionId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/grades/section/${sectionId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json(); // { grades: [...] }
},
    
};
