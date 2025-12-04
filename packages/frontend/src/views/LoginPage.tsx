import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContex"

export default function LoginPage() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submitting login...");

    try {
      const data = await api.login(email, password);

      console.log("API login response:", data);

      if (data.success) {
        login(data.user, data.token);

        if (data.user.role === "STUDENT") {
          navigate("/courses");
        } else if (data.user.role === "FACULTY") {
          navigate("/courses");
        } else {
          navigate("/login");
        }

      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to contact server.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-100 p-4"
      style={{
        backgroundImage: "url('/images/login-bg.png')"
      }}>
      <form onSubmit={handleSubmit} className="fieldset bg-black/50 backdrop-blur-sm border-base-300 rounded-box w-xs border p-4">

        <fieldset className="fieldset">
          <label className="label text-white">Email</label>
          <input
            type="email"
            className="input validator"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </fieldset>

        <label className="fieldset">
          <span className="label text-white">Password</span>
          <input
            type="password"
            className="input validator"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className="btn btn-primary mt-4" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
