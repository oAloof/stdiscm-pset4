import React from "react";
import NavBar from "../components/NavBar";

export default function StudentPage() {

    const user = localStorage.getItem("user");

    console.log("User:", user);

    return (
        <div className="min-h-screen flex-column items-center justify-center bg-gray-100">
        <NavBar />
        <h1 className="text-3xl font-bold">Hello, this is a teacher page!</h1>
        </div>
  );
}
