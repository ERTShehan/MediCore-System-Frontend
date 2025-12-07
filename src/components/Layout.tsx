import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* --- Internal Header --- */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-900">
              Medi<span className="text-emerald-500">Core</span>
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
              {user?.role} Dashboard
            </span>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500">Logged in</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {children ? (
          children
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to the {user?.role === "doctor" ? "Doctor" : "Staff"} Dashboard
            </h2>
            <p className="text-gray-500">
              Select an option from the menu to start managing the clinic.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-800 text-lg">Patients</h3>
                    <p className="text-blue-600">View Queue</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-100">
                    <h3 className="font-bold text-emerald-800 text-lg">Appointments</h3>
                    <p className="text-emerald-600">Manage Today</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                    <h3 className="font-bold text-purple-800 text-lg">Reports</h3>
                    <p className="text-purple-600">View Analytics</p>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        © 2025 MediCore System.
      </footer>
    </div>
  );
}