import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import ThemeToggle from "./ThemeToggle"; // ThemeToggle import කරන්න
import { useTheme } from "../hooks/useTheme"; // Hook එක import කරන්න

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Theme state එක ගන්න

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    // Main container එකට dark mode classes එකතු කිරීම
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* --- Internal Header --- */}
      <header className={`shadow-sm border-b transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-900'
            }`}>
              Medi<span className="text-emerald-500">Core</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${
              theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role} Dashboard
            </span>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Theme Toggle Button එක මෙතැනට එකතු කරන්න */}
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <p className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {user?.name || user?.email}
              </p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Logged in</p>
            </div>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                theme === 'dark' 
                  ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
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
          <div className={`p-10 rounded-xl shadow-sm border text-center transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Welcome to the {user?.role === "doctor" ? "Doctor" : "Staff"} Dashboard
            </h2>
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Select an option from the menu to start managing the clinic.
            </p>
            
            {/* Dashboard Navigation Cards (Fallback) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-blue-900/20 border-blue-800' 
                    : 'bg-blue-50 border-blue-100'
                }`}>
                    <h3 className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                    }`}>Patients</h3>
                    <p className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>View Queue</p>
                </div>
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-emerald-900/20 border-emerald-800' 
                    : 'bg-emerald-50 border-emerald-100'
                }`}>
                    <h3 className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                    }`}>Appointments</h3>
                    <p className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}>Manage Today</p>
                </div>
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-purple-900/20 border-purple-800' 
                    : 'bg-purple-50 border-purple-100'
                }`}>
                    <h3 className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                    }`}>Reports</h3>
                    <p className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>View Analytics</p>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className={`border-t py-4 text-center text-sm transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-gray-500' 
          : 'bg-white border-gray-200 text-gray-400'
      }`}>
        © 2025 MediCore System.
      </footer>
    </div>
  );
}