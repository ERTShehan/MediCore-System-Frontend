import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/authContext";
import { loginUser, sendForgotPasswordOTP, resetPasswordWithOTP } from "../services/auth";
import logo from "../assets/medicore-logo.png";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import { Loader2, Mail, Lock, CheckCircle, AlertCircle, X, Key, Eye, EyeOff } from "lucide-react";
import { useAppDispatch } from "../redux/store";
import { setCredentials, loadUser } from "../redux/slices/authSlice";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  roles: string[];
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
}

const Login = () => {
  // Login States
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });
  
  // Modal Password Visibility
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password Validation State
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const dispatch = useAppDispatch();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);

    try {
      const res = await loginUser(formData);
      
      const { accessToken, refreshToken, roles }: LoginResponse = res.data;

      if (!accessToken) {
        throw new Error("Login failed: No token received");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      dispatch(setCredentials(res.data));
      await dispatch(loadUser())

      setUser(res.data);

      // Navigate based on user role
      const userRole = roles?.[0] || "";
      redirectBasedOnRole(userRole);

    } catch (err: any) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    const routes: Record<string, string> = {
      doctor: "/doctor-dashboard",
      counter: "/counter-dashboard",
      default: "/"
    };
    
    navigate(routes[role] || routes.default);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e as any);
    }
  };


  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    validatePassword(val);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return setResetMessage({ type: "error", text: "Please enter your email address" });
    
    setResetLoading(true);
    setResetMessage({ type: "", text: "" });

    try {
      await sendForgotPasswordOTP(resetEmail);
      setResetMessage({ type: "success", text: "OTP Code has been sent to your email!" });
      
      setTimeout(() => {
        setOtpStep(2);
        setResetMessage({ type: "", text: "" });
      }, 1500);

    } catch (err: any) {
      setResetMessage({ type: "error", text: err.response?.data?.message || "Failed to send OTP. Please try again." });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    if (otpCode.length !== 4) return setResetMessage({ type: "error", text: "Please enter the 4-digit OTP code" });
    if (!isPasswordValid) return setResetMessage({ type: "error", text: "Password does not meet the security requirements" });
    if (newPassword !== confirmResetPassword) return setResetMessage({ type: "error", text: "Passwords do not match" });

    setResetLoading(true);
    setResetMessage({ type: "", text: "" });

    try {
      await resetPasswordWithOTP({
        email: resetEmail,
        otp: otpCode,
        newPassword
      });
      
      setResetMessage({ type: "success", text: "Password reset successful! You can now login." });
      
      setTimeout(() => {
        setShowForgotModal(false);
        setOtpStep(1);
        setResetEmail("");
        setOtpCode("");
        setNewPassword("");
        setConfirmResetPassword("");
        setResetMessage({ type: "", text: "" });
      }, 2000);

    } catch (err: any) {
      setResetMessage({ type: "error", text: err.response?.data?.message || "Failed to reset password. Check OTP." });
    } finally {
      setResetLoading(false);
    }
  };

  const systemFeatures = [
    { title: "PHI Compliant Security", icon: "🔒" },
    { title: "Real-time Analytics", icon: "📊" },
    { title: "24/7 Support Access", icon: "🛟" },
    { title: "Smart Scheduling", icon: "📅" },
    { title: "Automated Billing", icon: "💰" },
    { title: "Patient Records", icon: "📁" },
  ];

  // Password Requirements List for Display
  const passwordRequirementsList = [
    { label: "At least 8 characters", valid: passwordValidation.length },
    { label: "One uppercase letter", valid: passwordValidation.uppercase },
    { label: "One lowercase letter", valid: passwordValidation.lowercase },
    { label: "One number", valid: passwordValidation.number },
    { label: "One special character", valid: passwordValidation.specialChar },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-linear-to-br from-gray-900 to-gray-800 text-gray-100' 
        : 'bg-linear-to-br from-gray-50 to-blue-50 text-gray-800'
    }`}>
      
      <nav className={`fixed top-0 left-0 right-0 backdrop-blur-lg z-40 border-b transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900/90 border-gray-800'
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="container mx-auto px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:opacity-90"
              aria-label="MediCore Home"
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 group-hover:bg-blue-500/30' 
                    : 'bg-blue-400/30 group-hover:bg-blue-500/40'
                }`} />
                <img 
                  src={logo} 
                  alt="MediCore Logo" 
                  className="h-10 w-auto relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className={`text-xl font-bold tracking-tight ${
                theme === 'dark' 
                  ? 'text-white' 
                  : 'text-gray-900'
              }`}>
                Medi<span className="text-emerald-500">Core</span>
              </span>
            </Link>

            {/* Navigation Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                to="/" 
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                aria-label="Back to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex min-h-screen pt-16">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex w-1/2 relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />
          <div className={`absolute inset-0 z-10 ${
            theme === 'dark' 
              ? 'bg-linear-to-r from-gray-900/95 via-gray-900/80 to-transparent' 
              : 'bg-linear-to-r from-white/95 via-white/80 to-transparent'
          }`} />
          
          <div className="relative z-20 flex flex-col justify-center px-12 h-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >

              <div>
                <h1 className={`text-5xl font-bold leading-tight mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Advanced Healthcare<br/>Management System
                </h1>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your clinic operations with our comprehensive solution designed for modern healthcare providers.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {systemFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className={`flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-black/5 border-gray-300/50 hover:bg-black/10'
                    } transition-all duration-300`}
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {feature.title}
                    </span>
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>
        </motion.div>

        <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Link 
              to="/" 
              className={`lg:hidden flex items-center gap-2 mb-8 p-3 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-500 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            <div className={`p-8 rounded-2xl shadow-2xl border ${
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
                : 'bg-white border-gray-200'
            }`}>
              
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome Back
                </h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Sign in to access your MediCore dashboard
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
                    theme === 'dark'
                      ? 'bg-red-900/20 border-red-800 text-red-400'
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} onKeyPress={handleKeyPress} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="doctor@medicore.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className={`text-sm font-medium transition-colors ${
                        theme === 'dark'
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                        theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </span>
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center">
                <div className={`flex-1 h-px ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
                <span className={`px-4 text-sm ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Don't have an account?
                </span>
                <div className={`flex-1 h-px ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
              </div>

              <div className="text-center">
                <Link
                  to="/register"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl relative ${
                theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
              }`}
            >
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setOtpStep(1);
                  setResetEmail("");
                  setResetMessage({ type: "", text: "" });
                }} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-full ${
                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <Key className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {otpStep === 1 ? "Reset Password" : "New Password"}
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {otpStep === 1 ? "We'll send a code to your email" : "Secure your account"}
                  </p>
                </div>
              </div>
              
              {/* Message Display */}
              {resetMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  resetMessage.type === 'error' 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {resetMessage.type === 'error' ? <AlertCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                  {resetMessage.text}
                </div>
              )}

              {/* Enter Email */}
              {otpStep === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input 
                        type="email" 
                        value={resetEmail} 
                        onChange={(e) => setResetEmail(e.target.value)} 
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                        }`} 
                        placeholder="doctor@example.com" 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={resetLoading} 
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center gap-2 transition-colors"
                  >
                    {resetLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send OTP"}
                  </button>
                </form>
              )}

              {/* Verify OTP & New Password */}
              {otpStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>4-Digit OTP Code</label>
                    <input 
                      type="text" 
                      maxLength={4} 
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value)} 
                      required
                      className={`w-full p-3 text-center text-2xl tracking-widest rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      }`} 
                      placeholder="0000" 
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={handleNewPasswordChange} 
                        required
                        className={`w-full p-3 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                        }`} 
                        placeholder="New Password" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Requirements List */}
                    <div className="mt-2 space-y-1 bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                      {passwordRequirementsList.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs transition-all duration-300">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            req.valid ? 'bg-emerald-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                          }`}>
                            {req.valid && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`${
                            req.valid 
                              ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmResetPassword} 
                      onChange={(e) => setConfirmResetPassword(e.target.value)} 
                      required
                      className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      }`} 
                      placeholder="Confirm Password" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={resetLoading} 
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    {resetLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Reset Password"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Login;