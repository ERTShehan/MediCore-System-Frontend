import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Layout from "../components/Layout";

// Lazy Load Pages
const Index = lazy(() => import("../pages/index"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Features = lazy(() => import("../pages/Features"));
const Pricing = lazy(() => import("../pages/Pricing"));

type RequireAuthTypes = { children: ReactNode; roles?: string[] };

const RequireAuth = ({ children, roles }: RequireAuthTypes) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role Check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />; // Unauthorized නම් Home එකට යවන්න
  }

  return <>{children}</>;
};

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-gray-50">
             <div className="w-16 h-16 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div>
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Doctor */}
          <Route
            path="/doctor-dashboard"
            element={
              <RequireAuth roles={["doctor"]}>
                 <Layout></Layout>
              </RequireAuth>
            }
          />

          {/* Protected Routes - Counter Staff */}
          <Route
            path="/counter-dashboard"
            element={
              <RequireAuth roles={["counter"]}>
                <Layout></Layout>
              </RequireAuth>
            }
          />

          {/* Features Page */}
          <Route path="/features" element={<Features />} />

          {/* Pricing Page */}
          <Route path="/pricing" element={<Pricing />} />

          {/* Catch all - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}