import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import logo from "../assets/medicore-logo.png";
import { useTheme } from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";

// Animated Number Component
const AnimatedNumber = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const countRef = useRef(0);

  useEffect(() => {
    if (isInView) {
      const increment = value / (duration * 60);
      const timer = setInterval(() => {
        countRef.current += increment;
        if (countRef.current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(countRef.current));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}+</span>;
};

// Stats Data
const stats = [
  { label: "Happy Patients", value: 1000 },
  { label: "Appointments", value: 2000 },
  { label: "Doctors", value: 30 },
];

export default function Index() {
  const { theme } = useTheme();

  // Animation Variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  // Scroll animations
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-linear-to-br from-slate-50 via-white to-blue-50/30 text-gray-800'
    }`}>
      {/*  Parallax use background*/}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{ y, opacity }}
      >
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-10' : 'opacity-5'
          }`}
          style={{
            backgroundImage: `url(${logo})`,
            backgroundSize: '60%',
            backgroundPosition: 'center 30%',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            filter: theme === 'dark' ? 'brightness(0.3)' : 'none'
          }}
        />
        {/* Animated gradient mesh */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-linear-to-br from-blue-900/10 via-transparent to-emerald-900/10' 
            : 'bg-linear-to-br from-blue-50/20 via-transparent to-emerald-50/20'
        }`} />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200/50 to-transparent dark:via-blue-700/30" />
      </motion.div>

      <nav className={`fixed top-0 left-0 right-0 backdrop-blur-xl shadow-lg z-50 border-b transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900/95 border-gray-800 shadow-gray-900/30'
          : 'bg-white/90 border-gray-200/80 shadow-blue-100/30'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 flex justify-between items-center">
          {/* Logo with hover effect */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className={`absolute -inset-3 rounded-2xl blur-xl transition-all duration-500 ${
                theme === 'dark'
                  ? 'bg-blue-500/20 group-hover:bg-blue-500/30'
                  : 'bg-blue-500/10 group-hover:bg-blue-500/20'
              }`} />
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="relative z-10"
              >
                <img 
                  src={logo} 
                  alt="MediCore Logo" 
                  className="h-11 w-auto transition-all duration-300"
                />
              </motion.div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent">
                Medi<span className="text-emerald-600">Core</span>
              </span>
              <span className={`text-[10px] font-medium tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                HEALTHCARE SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Nav Buttons */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 border-2 border-transparent hover:shadow-md ${
                theme === 'dark'
                  ? 'text-blue-300 hover:bg-blue-900/30 hover:border-blue-800/50 hover:shadow-gray-900'
                  : 'text-blue-800 hover:bg-blue-50 hover:border-blue-100 hover:shadow-md'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="relative px-7 py-2.5 text-sm bg-linear-to-r from-blue-600 via-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-blue-700 via-blue-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      <header ref={heroRef} className="pt-32 pb-28 relative overflow-hidden">
        {/* Animated background elements */}
        <div className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob ${
          theme === 'dark' ? 'bg-blue-900/30 opacity-20' : 'bg-blue-300 opacity-10'
        }`} />
        <div className={`absolute top-1/3 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 ${
          theme === 'dark' ? 'bg-emerald-900/30 opacity-20' : 'bg-emerald-300 opacity-10'
        }`} />
        <div className={`absolute -bottom-20 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 ${
          theme === 'dark' ? 'bg-purple-900/30 opacity-20' : 'bg-purple-300 opacity-10'
        }`} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Text Content */}
          <motion.div 
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className={`inline-flex items-center gap-2.5 px-4 py-2 backdrop-blur-sm rounded-full text-sm font-semibold border shadow-sm transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-800/80 border-gray-700 text-blue-300 shadow-gray-900/50'
                : 'bg-white/80 border-blue-100 text-blue-700 shadow-blue-100/50'
            }`}>
              <div className="w-2 h-2 bg-linear-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse" />
              <span>Trusted by 500+ Clinics Nationwide</span>
              <div className="w-2 h-2 bg-linear-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse" />
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className={`text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Modern Clinic
              <br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-700 to-emerald-600">
                  Management
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 bg-linear-to-r from-blue-600 to-emerald-600"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className={`text-xl leading-relaxed max-w-2xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Streamline patient appointments, medical records, and billing operations with our secure, intuitive platform designed for modern healthcare professionals.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-linear-to-r from-blue-600 via-blue-600 to-emerald-600 text-white text-base font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-700 via-blue-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-3">
                  Start Free
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/login"
                className={`group px-8 py-4 backdrop-blur-sm border-2 text-base font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/90 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-blue-800/50'
                    : 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-200'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Login
                </span>
              </Link>
            </motion.div>

            {/* Stats with animated numbers */}
            <motion.div 
              variants={fadeInUp}
              className={`grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t ${
                theme === 'dark' ? 'border-gray-700/80' : 'border-gray-200/80'
              }`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-700 to-emerald-600 bg-clip-text text-transparent mb-2">
                    <AnimatedNumber value={stat.value} duration={2.5} />
                  </div>
                  <div className={`text-sm font-medium tracking-wide transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-400 group-hover:text-gray-300'
                      : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image Card */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Floating elements */}
            <motion.div
              className={`absolute -top-6 -right-6 w-24 h-24 rounded-2xl shadow-xl ${
                theme === 'dark'
                  ? 'bg-linear-to-br from-blue-700 to-blue-900 shadow-blue-900/50'
                  : 'bg-linear-to-br from-blue-400 to-blue-600 shadow-blue-500/30'
              }`}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-2xl shadow-xl ${
                theme === 'dark'
                  ? 'bg-linear-to-br from-emerald-700 to-emerald-900 shadow-emerald-900/50'
                  : 'bg-linear-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30'
              }`}
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            
            {/* Main card */}
            <div className="relative">
              <div className="absolute -inset-6 bg-linear-to-r from-blue-400 via-blue-500 to-emerald-400 rounded-3xl blur-3xl opacity-20 animate-pulse" />
              <div className={`relative backdrop-blur-sm rounded-2xl p-8 shadow-2xl border overflow-hidden transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-linear-to-br from-gray-800 via-gray-800 to-gray-900/80 border-gray-700/50 shadow-gray-900/50'
                  : 'bg-linear-to-br from-white via-white to-blue-50/80 border-white/50 shadow-blue-500/10'
              }`}>
                {/* Card header */}
                <div className={`flex items-center gap-3 mb-6 pb-6 border-b ${
                  theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    theme === 'dark' ? 'bg-red-500' : 'bg-red-400'
                  }`} />
                  <div className={`w-3 h-3 rounded-full ${
                    theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-400'
                  }`} />
                  <div className={`w-3 h-3 rounded-full ${
                    theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
                  }`} />
                  <div className="flex-1 text-center">
                    <span className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      MediCore Dashboard
                    </span>
                  </div>
                </div>
                
                {/* Dashboard preview */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className={`flex-1 rounded-xl p-4 border ${
                      theme === 'dark'
                        ? 'bg-linear-to-r from-blue-900/30 to-blue-900/20 border-blue-800/30'
                        : 'bg-linear-to-r from-blue-100 to-blue-50 border-blue-200/50'
                    }`}>
                      <div className={`text-xs font-medium mb-2 ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        Today's Appointments
                      </div>
                      <div className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                      }`}>
                        24
                      </div>
                    </div>
                    <div className={`flex-1 rounded-xl p-4 border ${
                      theme === 'dark'
                        ? 'bg-linear-to-r from-emerald-900/30 to-emerald-900/20 border-emerald-800/30'
                        : 'bg-linear-to-r from-emerald-100 to-emerald-50 border-emerald-200/50'
                    }`}>
                      <div className={`text-xs font-medium mb-2 ${
                        theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                      }`}>
                        Patients Waiting
                      </div>
                      <div className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-emerald-200' : 'text-emerald-900'
                      }`}>
                        8
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-4 border ${
                    theme === 'dark'
                      ? 'bg-linear-to-r from-gray-800/50 to-blue-900/20 border-gray-700/50'
                      : 'bg-linear-to-r from-slate-50 to-blue-50 border-gray-200/50'
                  }`}>
                    <img 
                      src={logo} 
                      alt="MediCore Dashboard" 
                      className="w-full transform hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  
                  <div className={`rounded-xl p-3 border ${
                    theme === 'dark'
                      ? 'bg-linear-to-r from-purple-900/30 to-pink-900/20 border-purple-800/30'
                      : 'bg-linear-to-r from-purple-50 to-pink-50 border-purple-200/50'
                  }`}>
                    <div className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                    }`}>
                      Recent Activity
                    </div>
                    <div className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Dr. Smith completed 5 consultations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className={`py-24 relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-linear-to-b from-gray-900/50 via-gray-900 to-gray-800/30'
          : 'bg-linear-to-b from-white/50 via-white to-blue-50/30'
      }`}>
        {/* Background pattern */}
        <div className={`absolute inset-0 ${
          theme === 'dark' ? 'opacity-10' : 'opacity-5'
        }`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.2) 2px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              theme === 'dark'
                ? 'bg-linear-to-r from-blue-900/30 to-emerald-900/30 text-blue-300'
                : 'bg-linear-to-r from-blue-100 to-emerald-100 text-blue-800'
            }`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Key Features
            </div>
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Everything Your Clinic
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-600">
                Needs to Thrive
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Comprehensive tools designed to optimize every aspect of your medical practice
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Feature 1 */}
            <motion.div variants={scaleIn} className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-emerald-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
              <div className={`relative rounded-3xl p-8 shadow-xl hover:shadow-2xl border transition-all duration-300 group-hover:-translate-y-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700/50 hover:shadow-gray-900/50'
                  : 'bg-white border-gray-200/50 hover:shadow-2xl'
              }`}>
                <div className="inline-flex p-4 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Smart Records
                </h3>
                <p className={`leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Digitize patient records with AI-powered organization and instant retrieval.
                </p>
                <ul className="space-y-3">
                  {['HIPAA Compliant', 'Instant Search', 'Digital Prescriptions'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={scaleIn} className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
              <div className={`relative rounded-3xl p-8 shadow-xl hover:shadow-2xl border transition-all duration-300 group-hover:-translate-y-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700/50 hover:shadow-gray-900/50'
                  : 'bg-white border-gray-200/50 hover:shadow-2xl'
              }`}>
                <div className="inline-flex p-4 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Appointment Hub
                </h3>
                <p className={`leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Intelligent scheduling with automated reminders and waitlist management.
                </p>
                <ul className="space-y-3">
                  {['Online Booking', 'Auto Reminders', 'Calendar Sync'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={scaleIn} className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
              <div className={`relative rounded-3xl p-8 shadow-xl hover:shadow-2xl border transition-all duration-300 group-hover:-translate-y-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700/50 hover:shadow-gray-900/50'
                  : 'bg-white border-gray-200/50 hover:shadow-2xl'
              }`}>
                <div className="inline-flex p-4 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Billing Suite
                </h3>
                <p className={`leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Automated billing with insurance integration and real-time payment tracking.
                </p>
                <ul className="space-y-3">
                  {['Insurance Claims', 'Payment Tracking', 'Tax Ready'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Banner */}
          <motion.div 
            className="mt-20 relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-blue-700 to-emerald-600 shadow-2xl shadow-blue-500/30"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
            <div className="relative px-8 py-12 md:py-16 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Clinic?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare providers already using MediCore
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-white text-blue-700 text-lg font-semibold rounded-2xl hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    Start Free Trial
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="group px-8 py-4 bg-transparent border-2 border-white/50 text-white text-lg font-semibold rounded-2xl hover:bg-white/10 hover:border-white transition-all duration-300"
                >
                  Schedule Demo
                </Link>
              </div>
              <p className="mt-8 text-sm text-blue-200">
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        </div>
      </section>

      <footer className="bg-linear-to-br from-gray-900 to-gray-800 text-gray-400 py-10 border-t border-gray-700 relative z-10">
        <div className="max-w-6xl mx-auto px-8 lg:px-12">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="MediCore Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold text-white tracking-tight">
                  Medi<span className="text-emerald-400">Core</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Transforming healthcare management with innovative technology solutions for modern medical practices and clinics.
              </p>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/Pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
          </motion.div>
          
          <div className="pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-xs">
            <div className="mb-4 md:mb-0">
              <p>© 2025 MediCore. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .dark ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #10b981);
          border-radius: 5px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #1d4ed8, #047857);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #059669);
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1e40af, #065f46);
        }
      `}</style>
    </div>
  );
}