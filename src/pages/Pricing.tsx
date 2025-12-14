import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import logo from "../assets/medicore-logo.png";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";

export default function Pricing() {
  const { theme } = useTheme();

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

  return (
    <div className={`min-h-screen font-sans relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-linear-to-br from-gray-900 to-gray-800 text-gray-100' 
        : 'bg-linear-to-br from-slate-50 to-blue-50 text-gray-800'
    }`}>
      {/* --- Full Page Background Logo --- */}
      <div 
        className={`fixed inset-0 z-0 transition-opacity duration-300 ${
          theme === 'dark' ? 'opacity-5' : 'opacity-12'
        }`}
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'grayscale(0.5)'
        }}
      />

      {/* --- Navigation Bar --- */}
      <nav className={`fixed top-0 left-0 right-0 backdrop-blur-xl shadow-sm z-50 border-b transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900/95 border-gray-800 shadow-gray-900/30'
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-3 flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              <img src={logo} alt="MediCore Logo" className="h-10 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <span className={`text-xl font-bold bg-clip-text text-transparent tracking-tight ${
              theme === 'dark' 
                ? 'bg-linear-to-r from-blue-400 to-blue-200'
                : 'bg-linear-to-r from-blue-900 to-blue-700'
            }`}>
              Medi<span className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}>Core</span>
            </span>
          </Link>

          {/* Nav Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 border border-transparent ${
                theme === 'dark'
                  ? 'text-blue-300 hover:bg-gray-800 hover:border-gray-700'
                  : 'text-blue-800 hover:bg-blue-50 hover:border-blue-100'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Main Content Section --- */}
      <div className="pt-28 pb-20 relative overflow-hidden">
        {/* Background Blobs */}
        <div className={`absolute top-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
          theme === 'dark' ? 'bg-blue-900' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
          theme === 'dark' ? 'bg-emerald-900' : 'bg-emerald-200'
        }`}></div>
        
        <div className="max-w-6xl mx-auto px-8 lg:px-12 relative z-10">
          
          {/* Back to Home Button */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link 
              to="/" 
              className={`inline-flex items-center gap-2 font-semibold transition-colors group ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </motion.div>

          {/* Header Text */}
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Simple, Transparent Pricing</h1>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No hidden fees. No monthly subscriptions. Just one payment for lifetime access to the complete clinic management suite.
            </p>
          </motion.div>

          {/* Pricing Card Section */}
          <motion.div 
            className="flex justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="relative w-full max-w-lg">
              {/* Glow Effect behind the card */}
              <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-30"></div>
              
              <div className={`relative rounded-2xl shadow-2xl overflow-hidden border transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                {/* Card Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 p-8 text-center text-white">
                  <h3 className="text-xl font-semibold uppercase tracking-wider opacity-90 mb-2">Lifetime License</h3>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-2xl font-light opacity-80">Rs.</span>
                    <span className="text-5xl font-bold">20,000</span>
                  </div>
                  <p className="mt-2 text-blue-100 font-medium">One-time payment</p>
                </div>

                {/* Card Features */}
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {[
                      "Complete Doctor Dashboard",
                      "Unlimited Patient Records",
                      "Digital Prescriptions & Billing",
                      "Queue Management System",
                      "Secure Data Backup",
                      "24/7 Technical Support"
                    ].map((feature, idx) => (
                      <li key={idx} className={`flex items-center gap-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          ✓
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`block w-full py-4 text-white text-center font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    Get Lifetime Access
                  </Link>
                  
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Secure payment gateway • Instant account activation
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guarantee Section */}
          <motion.div 
            className="mt-16 grid md:grid-cols-3 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="p-4">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className={`font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Secure & Private</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Your clinic's data is encrypted and stored securely.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-4">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className={`font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Instant Setup</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Start managing your clinic immediately after registration.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-4">
              <div className="text-4xl mb-3">🤝</div>
              <h4 className={`font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>No Monthly Fees</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Pay once and own the system license forever.</p>
            </motion.div>
          </motion.div>

        </div>
      </div>

      <footer className="bg-linear-to-br from-gray-900 to-gray-800 text-gray-400 py-8 border-t border-gray-700 relative z-10">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 text-center text-sm">
          <p>© 2025 MediCore. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}