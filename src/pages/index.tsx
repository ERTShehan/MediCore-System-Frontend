import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import logo from "../assets/medicore-logo.png";

export default function Index() {
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 font-sans text-gray-800 relative overflow-hidden">
      {/* --- Full Page Background Logo --- */}
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

      {/* --- Enhanced Navigation Bar --- */}
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

      {/* --- Enhanced Hero Section --- */}
      <header className="pt-28 pb-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Changed: max-w-7xl -> max-w-6xl AND px-6 -> px-8 lg:px-12 */}
        {/* Changed: gap-12 -> gap-8 to reduce middle space */}
        <div className="max-w-6xl mx-auto px-8 lg:px-12 grid lg:grid-cols-2 gap-8 items-center relative z-10">
          
          {/* Text Content */}
          <motion.div 
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-700 border border-blue-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
               The Future of Clinic Management
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Smart Clinic
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-700 to-emerald-600">
                Management
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Streamline patient appointments, medical records, and billing operations with our secure, intuitive platform designed for modern healthcare professionals.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group"
              >
                <span className="flex items-center justify-center gap-2">
                  Register as Doctor
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 text-base font-semibold rounded-xl hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-center"
              >
                Staff Login
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">99%</div>
                <div className="text-xs text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">24/7</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-blue-400 to-emerald-400 rounded-3xl blur-2xl opacity-15 animate-pulse"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200">
                <img 
                  src={logo} 
                  alt="MediCore System" 
                  className="w-full max-w-sm transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- Enhanced How it Works Section --- */}
      <section className="py-20 bg-white/50 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-50/50"></div>
        {/* Changed: max-w-7xl -> max-w-6xl AND px-6 -> px-8 lg:px-12 */}
        <div className="max-w-6xl mx-auto px-8 lg:px-12 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Streamlined Clinic Operations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your clinic management and enhance patient care experience.
            </p>
          </motion.div>

          <motion.div 
            className="grid lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-md">
                  👨‍⚕️
                </div>
                <div className="text-blue-600 font-semibold text-xs uppercase tracking-wide mb-2">Step 1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Doctor Setup & Configuration</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Physicians register their practice and create secure staff accounts through an intuitive dashboard with role-based access control.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ul className="text-xs text-gray-500 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Secure clinic registration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Staff account management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Role-based permissions
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-md">
                  🏥
                </div>
                <div className="text-emerald-600 font-semibold text-xs uppercase tracking-wide mb-2">Step 2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Patient Registration & Scheduling</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Front desk staff efficiently register patients and manage appointments with automated digital queue management and real-time updates.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ul className="text-xs text-gray-500 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Digital patient intake
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Automated queue management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Real-time notifications
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="group relative">
              <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-md">
                  💊
                </div>
                <div className="text-purple-600 font-semibold text-xs uppercase tracking-wide mb-2">Step 3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Treatment & Billing Management</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Comprehensive patient care with electronic health records, prescription management, and automated billing with insurance integration.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ul className="text-xs text-gray-500 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Electronic health records
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Digital prescriptions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Automated billing system
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* --- Enhanced Footer --- */}
      <footer className="bg-linear-to-br from-gray-900 to-gray-800 text-gray-400 py-10 border-t border-gray-700 relative z-10">
        {/* Changed: max-w-7xl -> max-w-6xl AND px-6 -> px-8 lg:px-12 */}
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}