import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Index = lazy(() => import("../pages/index"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const DoctorDashboard = lazy(() => import("../pages/DoctorDashboard"));
const CounterDashboard = lazy(() => import("../pages/CounterDashboard"));
const Features = lazy(() => import("../pages/Features"));
const Pricing = lazy(() => import("../pages/Pricing"));
const PrescriptionTemplates = lazy(() => import("../pages/PrescriptionTemplates"));

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

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.some((role) => user.roles?.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="w-16 h-16 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/doctor-dashboard"
            element={
              <RequireAuth roles={["doctor"]}>
                <DoctorDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/counter-dashboard"
            element={
              <RequireAuth roles={["counter"]}>
                <CounterDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/prescription-templates"
            element={
              <RequireAuth roles={["doctor"]}>
                <PrescriptionTemplates />
              </RequireAuth>
            }
          />

          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}