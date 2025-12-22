import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import ThemeToggle from "./ThemeToggle"; 
import { useTheme } from "../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, AlertCircle } from "lucide-react"; // Icons

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme(); 
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const performLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>

      <header className={`shadow-sm border-b transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                theme === 'dark' 
                  ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
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

      {/* --- Logout Confirmation Modal --- */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className={`p-6 text-center border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'
                }`}>
                  <AlertCircle className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Confirm Logout
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Are you sure you want to end your session? You will need to login again to access the system.
                </p>
              </div>
              <div className={`flex p-4 gap-3 ${
                theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={performLogout}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}