import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "../hooks/useTheme"; // Theme Hook import

// Services
import { requestNextPatient, submitTreatment, getPatientHistory, getQueueStatus } from "../services/visit";
import { createStaff, getMyStaff, deleteStaff, toggleStaffStatus } from "../services/staff";

// Icons
import { 
  Users, Activity, Calendar, Clock, 
  UserPlus, Trash2, FileText,
  Stethoscope, Pill, History,
  ChevronRight, CheckCircle, XCircle,
  AlertCircle, X, Info,
  AlertTriangle, Check, Loader2, Play
} from "lucide-react";

// Types
interface StaffMember {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Visit {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  diagnosis?: string;
  prescription?: string;
  date?: string;
}

// --- Custom Toast Components with Dark Mode Support ---
const SuccessToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900/50 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ErrorToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const WarningToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const InfoToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900/50 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const LoadingToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
    </div>
  </div>
);

// --- Confirmation Modal with Dark Mode ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}) => {
  if (!isOpen) return null;

  const typeColors = {
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200",
    danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200"
  };

  const buttonColors = {
    warning: "bg-amber-600 hover:bg-amber-700",
    danger: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700"
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors"
      >
        <div className={`p-6 border-b ${typeColors[type]}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              type === "warning" ? "bg-amber-100 dark:bg-amber-900/40" :
              type === "danger" ? "bg-red-100 dark:bg-red-900/40" :
              "bg-blue-100 dark:bg-blue-900/40"
            }`}>
              {type === "warning" && <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              {type === "danger" && <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
              {type === "info" && <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2.5 text-white font-medium rounded-lg transition-colors ${buttonColors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function DoctorDashboard() {
  const { theme } = useTheme();
  
  // Patient States
  const [currentPatient, setCurrentPatient] = useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState<Visit[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");

  // Staff States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffFormData, setStaffFormData] = useState({ name: "", email: "", password: "" });

  const [totalToday, setTotalToday] = useState<number>(0);
  const [completedList, setCompletedList] = useState<Visit[]>([]); 

  // Confirmation Modal States
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "warning" | "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning"
  });

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Initial Poll to check state ---
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);
      
    fetchStatus(); 
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getQueueStatus();
      if (data.currentPatient) {
         setCurrentPatient(data.currentPatient);
      } else {
         if (!isModalOpen) setCurrentPatient(null);
      }
      
      setCompletedList(data.completedList || []);
      setTotalToday(data.totalToday || 0); 
    } catch (err) {
      console.error("Queue poll error", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await getMyStaff();
      setStaffList(res.data);
    } catch (error) {
      toast.custom(() => <ErrorToast message="Failed to load staff list" />);
      console.error("Failed to fetch staff", error);
    } finally {
      setStaffLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
    const toastConfig = {
      duration: type === 'loading' ? Infinity : 4000,
      position: 'top-right' as const,
    };

    switch (type) {
      case 'success':
        return toast.custom(() => <SuccessToast message={message} />, toastConfig);
      case 'error':
        return toast.custom(() => <ErrorToast message={message} />, toastConfig);
      case 'warning':
        return toast.custom(() => <WarningToast message={message} />, toastConfig);
      case 'info':
        return toast.custom(() => <InfoToast message={message} />, toastConfig);
      case 'loading':
        return toast.custom(() => <LoadingToast message={message} />, toastConfig);
    }
  };

  // --- PATIENT HANDLERS ---
  const handleRequestPatient = async () => {
    if (currentPatient) {
        setIsModalOpen(true);
        return;
    }

    setPatientLoading(true);
    const loadingToast = showToast("Checking patient queue...", "loading");
    
    try {
      const patient = await requestNextPatient();
      setCurrentPatient(patient);
      setDiagnosis("");
      setPrescription("");
      setHistoryList([]);
      setIsModalOpen(true);
      toast.dismiss(loadingToast);
      showToast(`Patient ${patient.patientName} loaded successfully`, "success");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || "No patients in queue";
      showToast(errorMessage, "warning");
    } finally {
      setPatientLoading(false);
    }
  };

  const handleSubmitTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    
    const loadingToast = showToast("Submitting treatment...", "loading");
    
    try {
      await submitTreatment(currentPatient._id, { diagnosis, prescription });
      toast.dismiss(loadingToast);
      showToast("Treatment submitted successfully!", "success");
      setCurrentPatient(null);
      setIsModalOpen(false);
      fetchStatus();
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast("Failed to save treatment. Please try again.", "error");
    }
  };

  const handleViewHistory = async () => {
    if (!currentPatient) return;
    
    const loadingToast = showToast("Loading patient history...", "loading");
    
    try {
      const res = await getPatientHistory(currentPatient.phone);
      setHistoryList(res.data);
      setShowHistoryModal(true);
      toast.dismiss(loadingToast);
      showToast("Patient history loaded", "success");
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast("Failed to load patient history", "error");
    }
  };

  // --- STAFF HANDLERS ---
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = showToast("Creating staff member...", "loading");
    
    try {
      await createStaff(staffFormData);
      toast.dismiss(loadingToast);
      showToast("Staff member created successfully", "success");
      setStaffFormData({ name: "", email: "", password: "" });
      setShowAddStaffForm(false);
      fetchStaff();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      showToast(error.response?.data?.message || "Failed to create staff member", "error");
    }
  };

  const confirmDeleteStaff = (id: string, name: string) => {
    setConfirmationModal({
      isOpen: true,
      title: "Remove Staff Member",
      message: `Are you sure you want to remove ${name}? This action cannot be undone.`,
      onConfirm: () => performDeleteStaff(id, name),
      type: "danger"
    });
  };

  const performDeleteStaff = async (id: string, name: string) => {
    const loadingToast = showToast(`Removing ${name}...`, "loading");
    
    try {
      await deleteStaff(id);
      setStaffList(staffList.filter(s => s._id !== id));
      toast.dismiss(loadingToast);
      showToast(`${name} has been removed successfully`, "success");
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast("Failed to delete staff member", "error");
    }
  };

  const handleToggleStatus = async (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    const loadingToast = showToast(`${action === "activate" ? "Activating" : "Deactivating"} ${name}...`, "loading");
    
    try {
      await toggleStaffStatus(id);
      setStaffList(staffList.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
      toast.dismiss(loadingToast);
      showToast(`${name} ${action}d successfully`, "success");
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast(`Failed to ${action} staff member`, "error");
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Toaster position="top-right" reverseOrder={false} gutter={8} containerClassName="!z-[1000]" toastOptions={{ duration: 4000 }} />

        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          confirmText={confirmationModal.type === "danger" ? "Remove" : "Confirm"}
        />

        <div className={`border-b px-8 py-6 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Doctor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>{currentTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Staff</p>
                  <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{staffList.length}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <Users className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{staffList.filter(s => s.isActive).length} active</span>
              </div>
            </div>

            <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Patient in Queue</p>
                  <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{completedList.length}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <Users className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Currently consulting: {currentPatient ? currentPatient.patientName : "None"}
              </p>
            </div>

            <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Today's Appointments</p>
                  <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalToday}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                  <Calendar className={`w-6 h-6 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View schedule</p>
            </div>

            <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>System Status</p>
                  <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Online</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>All systems operational</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`border-b px-6 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Stethoscope className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Patient Consultation</h2>
                    </div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Queue Management</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                    }`}>
                      <Stethoscope className={`w-10 h-10 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currentPatient ? "Patient In Session" : "Ready for Next Patient"}
                    </h3>
                    <p className={`mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {currentPatient 
                        ? `You are currently treating ${currentPatient.patientName}`
                        : "Click below to call the next patient from the queue"}
                    </p>
                    
                    <button
                      onClick={handleRequestPatient}
                      disabled={patientLoading}
                      className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium text-white transition-all ${
                        currentPatient 
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {patientLoading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Checking Queue...
                        </>
                      ) : currentPatient ? (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Resume Consultation
                        </>
                      ) : (
                        <>
                          <Users className="w-5 h-5 mr-2" />
                          Call Next Patient
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff Management Section */}
              <div className={`rounded-xl border shadow-sm transition-colors ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`border-b px-6 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Staff Management</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Staff
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showAddStaffForm && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`mx-6 my-6 p-6 rounded-xl border ${
                        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                        }`}>Add New Staff Member</h3>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                              <input 
                                type="text" 
                                placeholder="John Doe"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                                  theme === 'dark' 
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' 
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                value={staffFormData.name}
                                onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                              <input 
                                type="email" 
                                placeholder="john@example.com"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                                  theme === 'dark' 
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' 
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                value={staffFormData.email}
                                onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                                  theme === 'dark' 
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' 
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                value={staffFormData.password}
                                onChange={(e) => setStaffFormData({...staffFormData, password: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddStaffForm(false)}
                              className={`px-4 py-2.5 border font-medium rounded-lg transition-colors ${
                                theme === 'dark' 
                                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Create Staff Account
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-6 pb-6">
                  <div className={`rounded-lg border overflow-hidden ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Staff Members ({staffList.length})</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Manage counter access</span>
                      </div>
                    </div>
                    
                    {staffLoading ? (
                      <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading staff members...</p>
                      </div>
                    ) : staffList.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : ''}`}>No staff members found</p>
                        <button 
                          onClick={() => setShowAddStaffForm(true)}
                          className={`mt-3 font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Add your first staff member
                        </button>
                      </div>
                    ) : (
                      <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {staffList.map((staff) => (
                          <div key={staff._id} className={`p-4 transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                                }`}>
                                  <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <div>
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{staff.name}</h4>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{staff.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${staff.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  <span className={`text-sm font-medium ${staff.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {staff.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleToggleStatus(staff._id, staff.name, staff.isActive)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                      staff.isActive
                                        ? theme === 'dark' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-700 hover:bg-red-100'
                                        : theme === 'dark' ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                  >
                                    {staff.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => confirmDeleteStaff(staff._id, staff.name)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      theme === 'dark' 
                                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                    title="Delete staff member"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-8">
              <div className={`rounded-xl border shadow-sm transition-colors ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`border-b px-6 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button 
                    onClick={() => showToast("Feature coming soon!", "info")}
                    className={`w-full flex items-center justify-between p-4 text-left rounded-xl transition-colors group ${
                      theme === 'dark' ? 'bg-blue-900/20 hover:bg-blue-900/40' : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 transition-colors ${
                        theme === 'dark' ? 'bg-blue-900/40 group-hover:bg-blue-900/60' : 'bg-blue-100 group-hover:bg-blue-200'
                      }`}>
                        <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>View Today's Schedule</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Check upcoming appointments</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  </button>
                  
                  <button 
                    onClick={() => showToast("Feature coming soon!", "info")}
                    className={`w-full flex items-center justify-between p-4 text-left rounded-xl transition-colors group ${
                      theme === 'dark' ? 'bg-emerald-900/20 hover:bg-emerald-900/40' : 'bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 transition-colors ${
                        theme === 'dark' ? 'bg-emerald-900/40 group-hover:bg-emerald-900/60' : 'bg-emerald-100 group-hover:bg-emerald-200'
                      }`}>
                        <History className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Patient History</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Access medical records</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  </button>
                  
                  <button 
                    onClick={() => showToast("Feature coming soon!", "info")}
                    className={`w-full flex items-center justify-between p-4 text-left rounded-xl transition-colors group ${
                      theme === 'dark' ? 'bg-purple-900/20 hover:bg-purple-900/40' : 'bg-purple-50 hover:bg-purple-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 transition-colors ${
                        theme === 'dark' ? 'bg-purple-900/40 group-hover:bg-purple-900/60' : 'bg-purple-100 group-hover:bg-purple-200'
                      }`}>
                        <Pill className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Prescription Templates</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Common prescriptions</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  </button>
                </div>
              </div>

              <div className={`rounded-xl border shadow-sm transition-colors ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`border-b px-6 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>System Status</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Patient Queue</span>
                    </div>
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Database</span>
                    </div>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Staff Portal</span>
                    </div>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-center">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Last updated: {currentTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      
      <AnimatePresence>
        {isModalOpen && currentPatient && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Patient Consultation</h2>
                      <p className="text-blue-100">Complete diagnosis and prescription</p>
                    </div>
                  </div>
                  <button
                    onClick={handleViewHistory}
                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                  >
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </button>
                </div>
              </div>

              <div className="px-8 pt-6">
                <div className={`rounded-xl p-6 mb-6 transition-colors ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Patient Name</p>
                      <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentPatient.patientName}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Age & Contact</p>
                      <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentPatient.age} years • {currentPatient.phone}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Token Number</p>
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg font-bold ${
                        theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        #{currentPatient.appointmentNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 overflow-y-auto flex-1">
                <form id="treatment-form" onSubmit={handleSubmitTreatment} className="space-y-8">
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        Diagnosis
                      </div>
                    </label>
                    <textarea
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px] resize-none transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter medical diagnosis..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center">
                        <Pill className="w-5 h-5 text-green-600 mr-2" />
                        Prescription
                      </div>
                    </label>
                    <textarea
                      required
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-40 font-mono text-sm transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter prescription details..."
                    />
                  </div>
                </form>
              </div>

              <div className={`border-t px-8 py-6 ${
                theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                        setIsModalOpen(false); 
                    }}
                    className={`px-6 py-3 border font-medium rounded-xl transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Close (Resume Later)
                  </button>
                  <button
                    type="submit"
                    form="treatment-form"
                    className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Consultation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className={`rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transition-colors ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`border-b px-8 py-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <History className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Medical History</h2>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Past consultations for {currentPatient?.patientName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
                {historyList.length === 0 ? (
                  <div className="text-center py-12">
                    <History className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No History Found</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No past consultations available for this patient</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyList.map((record) => (
                      <div key={record._id} className={`border rounded-xl p-6 transition-colors ${
                        theme === 'dark' 
                          ? 'border-gray-700 hover:border-blue-700 bg-gray-900/30' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Consultation</h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {record.date ? new Date(record.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Date not available'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}>
                            Token #{record.appointmentNumber}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Diagnosis</p>
                            <p className={`p-4 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-900'
                            }`}>{record.diagnosis}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prescription</p>
                            <div className={`p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap ${
                              theme === 'dark' 
                                ? 'bg-gray-900 border-gray-700 text-gray-300' 
                                : 'bg-white border-gray-200 text-gray-900'
                            }`}>
                              {record.prescription}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  </Layout>
  );
}