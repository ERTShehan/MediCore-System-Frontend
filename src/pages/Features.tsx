import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import logo from "../assets/medicore-logo.png";

export default function Features() {
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 font-sans text-gray-800 relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0 opacity-12"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-3 flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              <img src={logo} alt="MediCore Logo" className="h-10 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent tracking-tight">
              Medi<span className="text-emerald-600">Core</span>
            </span>
          </Link>

          {/* Nav Buttons */}
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-blue-800 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-transparent hover:border-blue-100"
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

      <div className="pt-28 pb-20 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-6xl mx-auto px-8 lg:px-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </motion.div>

          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your clinic efficiently, from patient registration to billing and medical records.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            
            <motion.div variants={fadeInUp} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                👨‍⚕️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Doctor Dashboard</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Comprehensive dashboard for doctors to view appointments, manage patient history, and issue digital prescriptions instantly.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Patient Registration</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Streamlined digital intake forms for new patients, reducing paperwork and waiting times at the reception.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                ⏳
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Queue Management</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Automated token system and real-time queue updates to manage patient flow efficiently and prevent overcrowding.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📂
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Electronic Health Records</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Securely store and retrieve patient medical history, allergies, diagnosis reports, and past treatments in one click.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Billing & Invoicing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Automated billing generation linked to treatments and medicines, with support for printing professional invoices.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Staff Management</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage doctor and staff profiles, assign roles (Admin, Doctor, Receptionist), and control system access securely.
              </p>
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