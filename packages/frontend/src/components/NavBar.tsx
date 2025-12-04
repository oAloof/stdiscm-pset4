import React from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContex"


const NavBar: React.FC = () => {
    const { logout } = useAuth();

    const navigate = useNavigate();

  // Read user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "guest";

  // Define sidebar items by role
  const menuItems: Record<string, { label: string; link: string }[]> = {
    FACULTY: [
      { label: "My Sections", link: "faculty/sections" }
    ],
    STUDENT: [
      { label: "View Courses", link: "/courses" },
      { label: "My Enrollments", link: "/student/enrollments" },
      { label: "View Grades", link: "/student/grades" },
    ],
    guest: [{ label: "Login", link: "/login" }],
  };

  const portalTitle = {
    STUDENT: "Student Portal",
    FACULTY: "Faculty Portal"
  }[role] ?? "Portal";

  const sidebarItems = menuItems[role] ?? menuItems["guest"];

  // --------------------------
  // LOGOUT HANDLER
  // --------------------------
  const handleLogout = async () => {
    try {
        console.log("Logging out...");

      // call logout RPC in client.ts
        api.logout(); // <--- this should invalidate token in backend
        logout();

      // remove user + token from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // navigate back to login page
        navigate("/login");
    } catch (err) {
        console.error("Logout error:", err);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-base-100 shadow-md">
    <div className="drawer">
      <input id="sidebar-toggle" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <div className="navbar bg-base-100 shadow-sm">
          <div className="flex-none">
            <label htmlFor="sidebar-toggle" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>

          <div className="flex-1">
            <span className="btn-ghost text-xl">{portalTitle}</span>
          </div>

          <div className="flex-none">
            {/* logout button */}
            <button
              className="btn btn-primary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="drawer-side">
        <label htmlFor="sidebar-toggle" className="drawer-overlay"></label>

        <ul className="menu p-4 w-64 min-h-full bg-base-200 text-base-content">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <a href={item.link}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </div>
  );
};

export default NavBar;
