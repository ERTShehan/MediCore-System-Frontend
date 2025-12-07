import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { loginUser } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Call API
      const res = await loginUser({ email, password });
      
      const { accessToken, refreshToken, roles } = res.data; 
      const userData = res.data;

      if (!accessToken) {
         throw new Error("Login failed: No token received.");
      }

      // 2. Save Tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 3. Update Context
      setUser(userData);

      // 4. Role Based Redirect
      const userRole = roles && roles.length > 0 ? roles[0] : "";

      if (userRole === "doctor") {
        navigate("/doctor-dashboard");
      } else if (userRole === "counter") {
        navigate("/counter-dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-6">Clinic Management System</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">
            Are you a Doctor?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register New Clinic
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}