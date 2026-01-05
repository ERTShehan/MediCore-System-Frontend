import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { Link } from "react-router-dom";

// --- REDUX IMPORTS ---
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchQueue } from "../redux/slices/visitSlice";

// Services
import { 
  requestNextPatient, 
  submitTreatment, 
  getPatientHistory, 
  getAllTodayVisits,
  createEmergencyVisit
} from "../services/visit";
import { createStaff, getMyStaff, deleteStaff, toggleStaffStatus } from "../services/staff";
import { searchSuggestions } from "../services/template";

// Components
import TodayPatientsModal from "../components/TodayPatientsModal";
import { notify, ToastContainer } from "../components/ToastNotification";

// Icons
import { 
  Users, Calendar, Clock, 
  UserPlus, Trash2, FileText,
  Stethoscope, Pill, History,
  ChevronRight, CheckCircle,
  AlertCircle, X, Info,
  AlertTriangle, Loader2,
  Zap, Save, User, Phone, Hash,
  Shield, Search, Filter, Download, Eye,
  Bell, Settings
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
  status?: 'pending' | 'in_progress' | 'completed';
  visitType?: 'regular' | 'emergency';
  date?: string;
  diagnosis?: string;
  prescription?: string;
}

interface Suggestion {
  _id: string;
  name: string;
}

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
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const typeColors = {
    warning: theme === 'dark' ? "bg-amber-900/20 border-amber-900/50 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-800",
    danger: theme === 'dark' ? "bg-red-900/20 border-red-900/50 text-red-200" : "bg-red-50 border-red-200 text-red-800",
    info: theme === 'dark' ? "bg-blue-900/20 border-blue-900/50 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-800"
  };

  const buttonColors = {
    warning: "bg-amber-600 hover:bg-amber-700",
    danger: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700"
  };

  const iconBgColors = {
    warning: theme === 'dark' ? "bg-amber-900/40" : "bg-amber-100",
    danger: theme === 'dark' ? "bg-red-900/40" : "bg-red-100",
    info: theme === 'dark' ? "bg-blue-900/40" : "bg-blue-100"
  };

  const iconColors = {
    warning: theme === 'dark' ? "text-amber-400" : "text-amber-600",
    danger: theme === 'dark' ? "text-red-400" : "text-red-600",
    info: theme === 'dark' ? "text-blue-400" : "text-blue-600"
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className={`p-6 border-b ${typeColors[type]}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${iconBgColors[type]}`}>
              {type === "warning" && <AlertTriangle className={`w-6 h-6 ${iconColors[type]}`} />}
              {type === "danger" && <AlertCircle className={`w-6 h-6 ${iconColors[type]}`} />}
              {type === "info" && <Info className={`w-6 h-6 ${iconColors[type]}`} />}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 border font-medium rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
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

const DashboardHeader = ({ currentTime }: { currentTime: string }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`sticky top-0 z-40 border-b shadow-sm ${
      theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Doctor Dashboard
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, User • Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{currentTime}</span>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
            <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <Link 
              to="/doctor-profile" 
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              title="Manage Profile"
            >
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "blue",
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: string; 
  color?: "blue" | "green" | "purple" | "orange";
  subtitle?: string;
}) => {
  const { theme } = useTheme();
  
  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
      icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      border: theme === 'dark' ? 'border-blue-900/30' : 'border-blue-200',
      trend: theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
      icon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      border: theme === 'dark' ? 'border-green-900/30' : 'border-green-200',
      trend: theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
      icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      border: theme === 'dark' ? 'border-purple-900/30' : 'border-purple-200',
      trend: theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
      icon: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      border: theme === 'dark' ? 'border-orange-900/30' : 'border-orange-200',
      trend: theme === 'dark' ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
    }
  };

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color].border} ${
      theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
    } shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {trend && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${colorClasses[color].trend}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].icon}`} />
        </div>
      </div>
    </div>
  );
};

export default function DoctorDashboard() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  // --- REDUX STATE ---
  // Instead of local state, we use selectors for queue data
  const { currentPatient, completedList, totalToday } = useAppSelector((state) => state.visit);

  const prescriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Patient States (UI Specific)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState<Visit[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");

  // Emergency Patient States
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: "", age: "", phone: "", diagnosis: "", prescription: ""
  });

  // Staff States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffFormData, setStaffFormData] = useState({ name: "", email: "", password: "" });

  const [showAllPatientsModal, setShowAllPatientsModal] = useState(false);
  const [allPatientsList, setAllPatientsList] = useState<Visit[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [medicineQuery, setMedicineQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const [emMedicineQuery, setEmMedicineQuery] = useState("");
  const [emSuggestions, setEmSuggestions] = useState<Suggestion[]>([]);
  const [showEmSuggestions, setShowEmSuggestions] = useState(false);
  const [activeEmSuggestionIndex, setActiveEmSuggestionIndex] = useState(0);

  const emergencyPrescriptionRef = useRef<HTMLTextAreaElement>(null);
  
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
  const [activeTab, setActiveTab] = useState<"overview" | "patients" | "staff">("overview");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // --- REDUX POLLING ---
  // Polling fetchQueue thunk instead of a local fetch function
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchQueue());
    }, 3000);
      
    dispatch(fetchQueue()); 
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await getMyStaff();
      setStaffList(res.data);
    } catch (error) {
      notify.error("Failed to load staff list");
      console.error("Failed to fetch staff", error);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (medicineQuery.length >= 2) {
        try {
          const res = await searchSuggestions(medicineQuery);
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions");
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [medicineQuery]);

  const addMedicineToPrescription = (medicineName: string) => {
    const newPrescription = prescription 
      ? `${prescription}\n${medicineName}` 
      : medicineName;
    
    setPrescription(newPrescription);
    setMedicineQuery("");
    setShowSuggestions(false);

    setTimeout(() => {
      if (prescriptionRef.current) {
        prescriptionRef.current.focus();
        prescriptionRef.current.selectionStart = prescriptionRef.current.value.length;
        prescriptionRef.current.selectionEnd = prescriptionRef.current.value.length;
      }
    }, 100);
  };

  const handleSuggestionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      addMedicineToPrescription(suggestions[activeSuggestionIndex].name);
    }
  };

  useEffect(() => {
    const fetchEmSuggestions = async () => {
      if (emMedicineQuery.length >= 2) {
        try {
          const res = await searchSuggestions(emMedicineQuery);
          setEmSuggestions(res.data);
          setShowEmSuggestions(true);
        } catch (error) { 
          console.error("Error fetching emergency suggestions"); 
        }
      } else {
        setEmSuggestions([]);
        setShowEmSuggestions(false);
      }
    };
    const timer = setTimeout(fetchEmSuggestions, 300);
    return () => clearTimeout(timer);
  }, [emMedicineQuery]);

  const addMedicineToEmergencyPrescription = (medicineName: string) => {
    const currentPrescription = emergencyForm.prescription;
    const newPrescription = currentPrescription 
      ? `${currentPrescription}\n${medicineName} - ` 
      : `${medicineName} - `;
    
    setEmergencyForm(prev => ({ ...prev, prescription: newPrescription }));
    setEmMedicineQuery("");
    setShowEmSuggestions(false);
    setTimeout(() => emergencyPrescriptionRef.current?.focus(), 50);
  };

  const handleEmSuggestionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveEmSuggestionIndex(prev => (prev < emSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveEmSuggestionIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && showEmSuggestions && emSuggestions.length > 0) {
      e.preventDefault();
      addMedicineToEmergencyPrescription(emSuggestions[activeEmSuggestionIndex].name);
    }
  };

  const handleRequestPatient = async () => {
    if (currentPatient) {
      setIsModalOpen(true);
      return;
    }

    setPatientLoading(true);
    const loadingId = notify.loading("Checking patient queue...");
    
    try {
      const patient = await requestNextPatient();
      // Trigger immediate Redux update after DB change
      dispatch(fetchQueue());

      setDiagnosis("");
      setPrescription("");
      setHistoryList([]);
      setIsModalOpen(true);
      notify.dismiss(loadingId);
      notify.success(`Patient ${patient.patientName} loaded successfully`);
    } catch (error: any) {
      notify.dismiss(loadingId);
      const errorMessage = error.response?.data?.message || "No patients in queue";
      notify.warning(errorMessage);
    } finally {
      setPatientLoading(false);
    }
  };

  const handleSubmitTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    
    const loadingId = notify.loading("Submitting treatment...");
    
    try {
      await submitTreatment(currentPatient._id, { diagnosis, prescription });
      notify.dismiss(loadingId);
      notify.success("Treatment submitted successfully!");
      setIsModalOpen(false);
      
      // Refresh Redux state immediately
      dispatch(fetchQueue());
    } catch (error) {
      notify.dismiss(loadingId);
      notify.error("Failed to save treatment. Please try again.");
    }
  };

  const handleViewHistory = async () => {
    if (!currentPatient) return;
    
    const loadingId = notify.loading("Loading patient history...");
    
    try {
      const res = await getPatientHistory(currentPatient.phone);
      setHistoryList(res.data);
      setShowHistoryModal(true);
      notify.dismiss(loadingId);
      notify.success("Patient history loaded");
    } catch (error) {
      notify.dismiss(loadingId);
      notify.error("Failed to load patient history");
    }
  };

  // EMERGENCY PATIENT HANDLER
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencyLoading(true);
    const loadingId = notify.loading("Registering emergency patient...");

    try {
      await createEmergencyVisit(emergencyForm);
      notify.dismiss(loadingId);
      notify.success("Emergency patient registered & treated!");
      // Reset form
      setEmergencyForm({ patientName: "", age: "", phone: "", diagnosis: "", prescription: "" });
      setShowEmergencyModal(false);
      
      // Sync with Redux
      dispatch(fetchQueue()); 
    } catch (error: any) {
      notify.dismiss(loadingId);
      notify.error(error.response?.data?.message || "Failed to register emergency patient");
    } finally {
      setEmergencyLoading(false);
    }
  };

  // STAFF HANDLERS
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingId = notify.loading("Creating staff member...");
    
    try {
      await createStaff(staffFormData);
      notify.dismiss(loadingId);
      notify.success("Staff member created successfully");
      setStaffFormData({ name: "", email: "", password: "" });
      setShowAddStaffForm(false);
      fetchStaff();
    } catch (error: any) {
      notify.dismiss(loadingId);
      notify.error(error.response?.data?.message || "Failed to create staff member");
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
    const loadingId = notify.loading(`Removing ${name}...`);
    
    try {
      await deleteStaff(id);
      setStaffList(staffList.filter(s => s._id !== id));
      notify.dismiss(loadingId);
      notify.success(`${name} has been removed successfully`);
    } catch (error) {
      notify.dismiss(loadingId);
      notify.error("Failed to delete staff member");
    }
  };

  const handleToggleStatus = async (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    const loadingId = notify.loading(`${action === "activate" ? "Activating" : "Deactivating"} ${name}...`);
    
    try {
      await toggleStaffStatus(id);
      setStaffList(staffList.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
      notify.dismiss(loadingId);
      notify.success(`${name} ${action}d successfully`);
    } catch (error) {
      notify.dismiss(loadingId);
      notify.error(`Failed to ${action} staff member`);
    }
  };

  const handleViewAllPatients = async() => {
    setShowAllPatientsModal(true);
    setLoadingList(true);
    try {
      const res = await getAllTodayVisits();
      setAllPatientsList(res.data);
    } catch (error) {
      notify.error("Failed to load all patients");
    } finally {
      setLoadingList(false);
    }
  };

  // Recent Patients Component
  const RecentPatients = () => {
    const { theme } = useTheme();

    return (
      <div className={`rounded-xl border shadow-sm ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Patients</h3>
            <button onClick={handleViewAllPatients} className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              View All →
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {completedList.slice(0, 4).map((patient, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <User className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{patient.patientName}</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Token #{patient.appointmentNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    patient.status === 'completed' 
                      ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      : theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {patient.status === 'completed' ? 'Treated' : 'In Progress'}
                  </span>
                  <button className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Eye className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <ToastContainer />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.type === "danger" ? "Remove" : "Confirm"}
      />

      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <DashboardHeader currentTime={currentTime} />

        {/* Navigation Tabs */}
        <div className={`border-b ${
          theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="px-6">
            <div className="flex space-x-6">
              {["overview", "patients", "staff"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-1 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? theme === 'dark'
                        ? 'border-blue-400 text-blue-400'
                        : 'border-blue-600 text-blue-600'
                      : theme === 'dark'
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Staff" 
              value={staffList.length} 
              icon={Users} 
              color="blue"
              subtitle={`${staffList.filter(s => s.isActive).length} active`}
            />
            <StatCard 
              title="Today's Appointments" 
              value={totalToday} 
              icon={Calendar} 
              color="green"
              subtitle={`${completedList.length} completed`}
            />
            <StatCard 
              title="Patient Queue" 
              value={currentPatient ? 1 : 0} 
              icon={Users} 
              color="purple"
              subtitle={currentPatient ? "Consulting now" : "Queue empty"}
            />
            <StatCard 
              title="System Status" 
              value="Online" 
              icon={Shield} 
              color="orange"
              subtitle="All systems operational"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Consultation Card */}
              <div className={`rounded-xl border shadow-sm ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Patient Consultation</h2>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage current patient consultation and treatment
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setShowEmergencyModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Emergency
                      </button>
                      <Link to="/prescription-templates" className={`px-4 py-2 border rounded-lg font-medium flex items-center transition-colors ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <Pill className="w-4 h-4 mr-2" /> Templates
                      </Link>
                      <button 
                        onClick={handleViewAllPatients}
                        className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center ${
                          theme === 'dark'
                            ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </button>
                    </div>
                  </div>

                  {currentPatient ? (
                    <div className={`rounded-lg p-6 mb-6 border ${
                      theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-100'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                          }`}>
                            <User className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentPatient.patientName}</h3>
                            <div className={`flex items-center space-x-4 text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {currentPatient.age} years
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {currentPatient.phone}
                              </span>
                              <span className="flex items-center">
                                <Hash className="w-3 h-3 mr-1" />
                                #{currentPatient.appointmentNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleViewHistory}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                              theme === 'dark'
                                ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            View History
                          </button>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Continue Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <Stethoscope className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ready for Next Patient</h3>
                      <p className={`mb-8 max-w-md mx-auto ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No patient is currently in consultation. Call the next patient from the queue to begin.
                      </p>
                      <button
                        onClick={handleRequestPatient}
                        disabled={patientLoading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                      >
                        {patientLoading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 w-5 h-5" />
                            Checking Queue...
                          </>
                        ) : (
                          <>
                            <Users className="mr-2 w-5 h-5" />
                            Call Next Patient
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Patients */}
              <RecentPatients />

              {/* Staff Management */}
              <div className={`rounded-xl border shadow-sm ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Staff Management</h2>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage staff members and their access permissions
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Staff
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddStaffForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6"
                      >
                        <div className={`p-6 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Add New Staff Member</h3>
                          <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                                <input
                                  type="text"
                                  placeholder="John Doe"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
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
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
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
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                      : 'border-gray-300 bg-white text-gray-900'
                                  }`}
                                  value={staffFormData.password}
                                  onChange={(e) => setStaffFormData({...staffFormData, password: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => setShowAddStaffForm(false)}
                                className={`px-4 py-2 border rounded-lg font-medium ${
                                  theme === 'dark'
                                    ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                              >
                                Create Staff Account
                              </button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Staff List */}
                  <div className={`overflow-hidden rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Staff Members ({staffList.length})</span>
                        <div className="flex items-center space-x-3">
                          <button className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <Filter className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {staffLoading ? (
                      <div className="py-12 text-center">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto" />
                        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading staff members...</p>
                      </div>
                    ) : staffList.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className={`w-12 h-12 mx-auto mb-3 ${
                          theme === 'dark' ? 'text-gray-700' : 'text-gray-300'
                        }`} />
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No staff members found</p>
                      </div>
                    ) : (
                      <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {staffList.map((staff) => (
                          <div key={staff._id} className={`p-4 transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                                }`}>
                                  <User className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <div>
                                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{staff.name}</h4>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{staff.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                  staff.isActive 
                                    ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                                    : theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${staff.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  {staff.isActive ? 'Active' : 'Inactive'}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleToggleStatus(staff._id, staff.name, staff.isActive)}
                                    className={`px-3 py-1 text-sm rounded-lg ${
                                      staff.isActive
                                        ? theme === 'dark'
                                          ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30'
                                          : 'text-red-700 bg-red-50 hover:bg-red-100'
                                        : theme === 'dark'
                                          ? 'text-green-400 bg-green-900/20 hover:bg-green-900/30'
                                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                                    }`}
                                  >
                                    {staff.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => confirmDeleteStaff(staff._id, staff.name)}
                                    className={`p-1.5 rounded hover:bg-red-50 hover:text-red-600 ${
                                      theme === 'dark' ? 'hover:bg-red-900/20 hover:text-red-400' : ''
                                    }`}
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className={`rounded-xl border shadow-sm transition-colors ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`border-b px-6 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  
                  {/* Emergency Patient */}
                  <button 
                    onClick={() => setShowEmergencyModal(true)}
                    className={`w-full flex items-center justify-between p-4 text-left rounded-xl transition-colors group ${
                      theme === 'dark' 
                        ? 'bg-red-900/20 hover:bg-red-900/40 border border-red-900/30' 
                        : 'bg-red-50 hover:bg-red-100 border border-red-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 transition-colors ${
                        theme === 'dark' ? 'bg-red-900/40 group-hover:bg-red-900/60' : 'bg-red-100 group-hover:bg-red-200'
                      }`}>
                        <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <span className={`font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>Emergency Patient</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-red-400/70' : 'text-red-600/70'}`}>Register & treat instantly</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-red-500' : 'text-red-400'}`} />
                  </button>

                  <button 
                    onClick={handleViewAllPatients}
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
                    onClick={() => notify.info("Feature coming soon!")}
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
                  
                  <Link
                    to="/prescription-templates"
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
                  </Link>
                </div>
              </div>

              {/* System Status */}
              <div className={`rounded-xl border shadow-sm ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>System Status</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Patient Queue", status: "Operational", healthy: true },
                      { label: "Database", status: "Connected", healthy: true },
                      { label: "Staff Portal", status: "Active", healthy: true },
                      { label: "API Services", status: "Running", healthy: true },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${item.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                        </div>
                        <span className={`text-sm font-medium ${item.healthy ? 'text-green-600' : 'text-red-600'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-6 pt-4 border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Last updated: {currentTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className={`rounded-xl border shadow-sm ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Upcoming</h3>
                  <div className="space-y-3">
                    {allPatientsList.slice(0, 3).map((patient, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                        }`}>
                          <User className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{patient.patientName}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Token #{patient.appointmentNumber} • {patient.age} years
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient Consultation Modal */}
      <AnimatePresence mode="wait">
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
              className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
            >
              {/* Header */}
              <div className="bg-blue-600 px-8 py-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6"/>
                  <div>
                    <h2 className="text-xl font-bold">Consultation</h2>
                    <p className="text-sm opacity-90">{currentPatient.patientName} (#{currentPatient.appointmentNumber})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleViewHistory}
                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                  >
                    <History className="w-4 h-4 mr-2" />
                    History
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-8 pt-6">
              <div className={`rounded-xl p-6 mb-6 border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
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

            <div className="px-8 py-6 overflow-y-auto flex-1">
              <form id="treatment-form" onSubmit={handleSubmitTreatment} className="space-y-6">
                
                {/* Diagnosis Section */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Diagnosis</label>
                  <textarea 
                    required 
                    value={diagnosis} 
                    onChange={(e) => setDiagnosis(e.target.value)} 
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Enter diagnosis..."
                  />
                </div>

                {/* Prescription Section with Redux-ready AutoComplete logic */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Prescription</label>
                  
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <input 
                      type="text"
                      value={medicineQuery}
                      onChange={(e) => setMedicineQuery(e.target.value)}
                      onKeyDown={handleSuggestionKeyDown}
                      placeholder="Type medicine name to auto-search..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-48 overflow-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {suggestions.map((suggestion, index) => (
                          <li 
                            key={suggestion._id}
                            onClick={() => addMedicineToPrescription(suggestion.name)}
                            className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between ${
                              index === activeSuggestionIndex 
                                ? 'bg-blue-600 text-white' 
                                : theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            {suggestion.name}
                            {index === activeSuggestionIndex && <span className="text-xs opacity-70">Press Enter</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <textarea 
                    ref={prescriptionRef}
                    required 
                    value={prescription} 
                    onChange={(e) => setPrescription(e.target.value)} 
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Prescription items will appear here..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Tip: Use the search bar above to quickly add medicines from your templates.</p>
                </div>
              </form>
            </div>

            <div className={`border-t px-8 py-4 ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition">Close</button>
                <button type="submit" form="treatment-form" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2"/> Complete Consultation
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* --- EMERGENCY MODAL --- */}
    <AnimatePresence>
      {showEmergencyModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border-2 border-red-500 transition-colors ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className="bg-red-600 px-8 py-6 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Emergency Registration</h2>
                  <p className="text-red-100 text-sm">Instant entry & treatment submission</p>
                </div>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} className="p-2 rounded-full hover:bg-red-700 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="emergency-form" onSubmit={handleEmergencySubmit} className="space-y-8">
                <div className={`p-5 rounded-xl border ${
                  theme === 'dark' ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100'
                }`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 flex items-center ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>
                    <Users className="w-4 h-4 mr-2" /> Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input required type="text" value={emergencyForm.patientName} onChange={e => setEmergencyForm({...emergencyForm, patientName: e.target.value})} className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} placeholder="Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Age</label>
                      <input required type="number" value={emergencyForm.age} onChange={e => setEmergencyForm({...emergencyForm, age: e.target.value})} className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} placeholder="Age" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input required type="text" value={emergencyForm.phone} onChange={e => setEmergencyForm({...emergencyForm, phone: e.target.value})} className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} placeholder="Phone" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Immediate Diagnosis</label>
                    <textarea required value={emergencyForm.diagnosis} onChange={e => setEmergencyForm({...emergencyForm, diagnosis: e.target.value})} className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} placeholder="Enter diagnosis..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Prescription / Treatment</label>
                    <div className="relative mb-2">
                        <input 
                            type="text"
                            value={emMedicineQuery}
                            onChange={(e) => setEmMedicineQuery(e.target.value)}
                            onKeyDown={handleEmSuggestionKeyDown}
                            placeholder="Type medicine name to auto-search..."
                            className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white'}`}
                        />
                        {showEmSuggestions && emSuggestions.length > 0 && (
                            <ul className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-48 overflow-auto bg-white dark:bg-gray-800">
                                {emSuggestions.map((s, i) => (
                                    <li key={s._id} onClick={() => addMedicineToEmergencyPrescription(s.name)} className={`px-4 py-2 cursor-pointer text-sm ${i === activeEmSuggestionIndex ? 'bg-red-600 text-white' : 'hover:bg-red-50 dark:hover:bg-gray-700'}`}>{s.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <textarea ref={emergencyPrescriptionRef} required value={emergencyForm.prescription} onChange={e => setEmergencyForm({...emergencyForm, prescription: e.target.value})} className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-red-500 h-32 font-mono text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} placeholder="Enter prescription..." />
                  </div>
                </div>
              </form>
            </div>

            <div className={`border-t px-8 py-6 ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowEmergencyModal(false)} className="px-6 py-3 border font-medium rounded-xl">Cancel</button>
                <button type="submit" form="emergency-form" disabled={emergencyLoading} className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center shadow-lg shadow-red-500/30">
                  {emergencyLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Save & Complete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* --- HISTORY MODAL --- */}
    <AnimatePresence>
      {showHistoryModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className={`rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transition-colors ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`border-b px-8 py-6 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <History className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Medical History</h2>
                    <p className="text-sm text-gray-500">{currentPatient?.patientName}</p>
                  </div>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
              {historyList.length === 0 ? (
                <div className="text-center py-12 text-gray-400"><History className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>No History Found</p></div>
              ) : (
                <div className="space-y-4">
                  {historyList.map((record) => (
                    <div key={record._id} className={`border rounded-xl p-6 transition-colors ${theme === 'dark' ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">Consultation</h4>
                          <p className="text-sm text-gray-500">{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Token #{record.appointmentNumber}</span>
                      </div>
                      <div className="space-y-4">
                        <div><p className="text-sm font-medium mb-1 opacity-60">Diagnosis</p><p>{record.diagnosis}</p></div>
                        <div><p className="text-sm font-medium mb-1 opacity-60">Prescription</p><div className="p-4 rounded-lg border bg-white dark:bg-gray-800 font-mono text-sm whitespace-pre-wrap">{record.prescription}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`border-t px-8 py-4 text-right ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <button onClick={() => setShowHistoryModal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Close</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <TodayPatientsModal isOpen={showAllPatientsModal} onClose={() => setShowAllPatientsModal(false)} patients={allPatientsList} isLoading={loadingList} />
  </Layout>
  );
}