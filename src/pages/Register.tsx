import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerDoctor } from "../services/auth";
import logo from "../assets/medicore-logo.png";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  confirmationId: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    confirmationId: "",
  });
  
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const { theme } = useTheme();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate password when password field changes
    if (name === 'password') {
      validatePassword(value);
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Check if all password requirements are met
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Check if passwords match
  const doPasswordsMatch = formData.password === formData.confirmPassword;

  // Validate form before submission
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return false;
    }
    
    if (!doPasswordsMatch) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!formData.confirmationId.trim()) {
      setError("Confirmation ID is required");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await registerDoctor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmationId: formData.confirmationId,
      });
      
      setRegistrationSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      console.error("Registration Error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Registration failed. Please check your Confirmation ID and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // System features for registration
  const registrationFeatures = [
    {
      icon: "🏥",
      title: "Clinic Management",
      description: "Complete control over your practice operations"
    },
    {
      icon: "📋",
      title: "Patient Records",
      description: "Secure and organized patient history management"
    },
    {
      icon: "🔄",
      title: "Automated Workflows",
      description: "Streamline appointments, billing, and follow-ups"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Insights into your practice performance"
    }
  ];

  // Password validation requirements
  const passwordRequirements = [
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
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 backdrop-blur-lg z-50 border-b transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900/90 border-gray-800'
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="container mx-auto px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:opacity-90"
              aria-label="MediCore Home"
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
                  theme === 'dark' 
                    ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' 
                    : 'bg-emerald-400/30 group-hover:bg-emerald-500/40'
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

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                to="/login" 
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                aria-label="Go to Login"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
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
              backgroundImage: 'url("https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className={`absolute inset-0 z-10 ${
            theme === 'dark' 
              ? 'bg-linear-to-r from-emerald-900/90 via-gray-900/80 to-transparent' 
              : 'bg-linear-to-r from-emerald-900/80 via-white/90 to-transparent'
          }`} />
          
          <div className="relative z-20 flex flex-col justify-center px-12 h-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-45"
            >

              {/* Heading */}
              <div>
                <h1 className={`text-5xl font-bold leading-tight mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Join MediCore
                  <span className="block text-emerald-400 mt-2">Elevate Your Medical Practice</span>
                </h1>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Register your doctor account and transform how you manage your clinic with our comprehensive healthcare management platform.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {registrationFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className={`flex flex-col gap-3 p-4 rounded-xl backdrop-blur-sm border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/50 border-gray-300/50 hover:bg-white/70'
                    } transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <h3 className={`font-bold ${
                        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
              
            </motion.div>
          </div>
        </motion.div>

        <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 ${
          theme === 'dark' ? 'bg-gray-900/50' : 'bg-white'
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile Navigation */}
            <div className="lg:hidden flex justify-between items-center mb-8">
              <Link 
                to="/" 
                className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Home
              </Link>
              <Link 
                to="/login" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-gray-800'
                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Sign In
              </Link>
            </div>

            <AnimatePresence>
              {registrationSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 p-6 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-emerald-900' : 'bg-emerald-100'
                    }`}>
                      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Registration Successful!</h3>
                      <p className="text-sm opacity-90">Redirecting to login page...</p>
                    </div>
                  </div>
                  <div className={`h-1 w-full rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 3 }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Container */}
            <div className={`p-8 rounded-2xl shadow-2xl border ${
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
                : 'bg-white border-gray-200'
            }`}>
              
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Doctor Registration
                </h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Create your professional account in minutes
                </p>
              </div>

              {/* Error Display */}
              {error && !registrationSuccess && (
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
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Dr. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading || registrationSuccess}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="doctor@medicore.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading || registrationSuccess}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading || registrationSuccess}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {formData.password && (
                        <div className={`w-3 h-3 rounded-full ${
                          isPasswordValid ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                      )}
                    </div>
                  </div>

                  {formData.password && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-2"
                    >
                      <div className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Password Requirements:
                      </div>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              req.valid 
                                ? 'bg-emerald-500' 
                                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                            }`}>
                              {req.valid && (
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs ${
                              req.valid 
                                ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                                : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading || registrationSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className={`mt-2 text-xs ${
                      doPasswordsMatch 
                        ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                        : 'text-red-500'
                    }`}>
                      {doPasswordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      Confirmation ID
                      <span className={`text-xs font-normal ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        (Provided by administrator)
                      </span>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-blue-500' : 'text-blue-600'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="confirmationId"
                      placeholder="e.g., DOC001"
                      value={formData.confirmationId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-blue-900/20 border-blue-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                          : 'bg-blue-50 border-blue-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      required
                      disabled={loading || registrationSuccess}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || registrationSuccess || !isPasswordValid || !doPasswordsMatch}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                    loading || registrationSuccess
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : registrationSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Account Created Successfully
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Professional Account
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
                  Already registered?
                </span>
                <div className={`flex-1 h-px ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In to Existing Account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;