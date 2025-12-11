import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

// Services
import { requestNextPatient, submitTreatment, getPatientHistory } from "../services/visit";
import { createStaff, getMyStaff, deleteStaff, toggleStaffStatus } from "../services/staff";

// Icons
import { 
  Users, Activity, Calendar, Clock, 
  UserPlus, Trash2, Eye, FileText,
  Stethoscope, Pill, History, UserCheck,
  ChevronRight, CheckCircle, XCircle,
  AlertCircle, MoreVertical, X, Info,
  AlertTriangle, Check, Loader2
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

const SuccessToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white border border-emerald-200 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
        <Check className="w-5 h-5 text-emerald-600" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ErrorToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white border border-red-200 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-600" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const WarningToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white border border-amber-200 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const InfoToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white border border-blue-200 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Info className="w-5 h-5 text-blue-600" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
    <button onClick={() => toast.dismiss()} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const LoadingToast = ({ message }: { message: string }) => (
  <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-md">
    <div className="shrink-0">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{message}</p>
    </div>
  </div>
);

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
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className={`p-6 border-b ${typeColors[type]}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              type === "warning" ? "bg-amber-100" :
              type === "danger" ? "bg-red-100" :
              "bg-blue-100"
            }`}>
              {type === "warning" && <AlertTriangle className="w-6 h-6 text-amber-600" />}
              {type === "danger" && <AlertCircle className="w-6 h-6 text-red-600" />}
              {type === "info" && <Info className="w-6 h-6 text-blue-600" />}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
  
  // Patient States
  const [currentPatient, setCurrentPatient] = useState<Visit | null>(null);
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

  // Current Time State
  const [currentTime, setCurrentTime] = useState<string>("");


  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await getMyStaff();
      setStaffList(res.data);
      // toast.custom(() => <SuccessToast message="Staff list loaded successfully" />);
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
    setPatientLoading(true);
    const loadingToast = showToast("Checking patient queue...", "loading");
    
    try {
      const patient = await requestNextPatient();
      setCurrentPatient(patient);
      setDiagnosis("");
      setPrescription("");
      setHistoryList([]);
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
      <div className="min-h-screen bg-gray-50">
        {/* Toast Container */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName="!z-[1000]"
          toastOptions={{
            duration: 4000,
          }}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          confirmText={confirmationModal.type === "danger" ? "Remove" : "Confirm"}
        />

        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Manage patients and staff efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm bg-gray-50 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 font-medium">{currentTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{staffList.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{staffList.filter(s => s.isActive).length} active</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patient in Queue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{currentPatient ? "1" : "0"}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Currently consulting: {currentPatient ? currentPatient.patientName : "None"}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">View schedule</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">Online</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Stethoscope className="w-5 h-5 text-blue-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Patient Consultation</h2>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Queue Management</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                      <Stethoscope className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {currentPatient ? "Patient In Session" : "Ready for Next Patient"}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {currentPatient 
                        ? `You are currently treating ${currentPatient.patientName}`
                        : "Click below to call the next patient from the queue"}
                    </p>
                    
                    <button
                      onClick={handleRequestPatient}
                      disabled={patientLoading || !!currentPatient}
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
                          <UserCheck className="w-5 h-5 mr-2" />
                          Patient In-Session
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

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
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
                      <div className="mx-6 my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Add New Staff Member</h3>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                              <input 
                                type="text" 
                                placeholder="John Doe"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={staffFormData.name}
                                onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                              <input 
                                type="email" 
                                placeholder="john@example.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={staffFormData.email}
                                onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                              className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Staff Members ({staffList.length})</span>
                        <span className="text-xs text-gray-500">Manage counter access</span>
                      </div>
                    </div>
                    
                    {staffLoading ? (
                      <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading staff members...</p>
                      </div>
                    ) : staffList.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No staff members found</p>
                        <button 
                          onClick={() => setShowAddStaffForm(true)}
                          className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Add your first staff member
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {staffList.map((staff) => (
                          <div key={staff._id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{staff.name}</h4>
                                  <p className="text-sm text-gray-500">{staff.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${staff.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  <span className={`text-sm font-medium ${staff.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                                    {staff.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleToggleStatus(staff._id, staff.name, staff.isActive)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                      staff.isActive
                                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                  >
                                    {staff.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => confirmDeleteStaff(staff._id, staff.name)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            <div className="space-y-8">
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button 
                    onClick={() => showToast("Feature coming soon!", "info")}
                    className="w-full flex items-center justify-between p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">View Today's Schedule</span>
                        <p className="text-sm text-gray-500">Check upcoming appointments</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  
                  <button 
                    onClick={() => showToast("Feature coming soon!", "info")}
                    className="w-full flex items-center justify-between p-4 text-left bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-emerald-100 rounded-lg mr-3 group-hover:bg-emerald-200 transition-colors">
                        <History className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Patient History</span>
                        <p className="text-sm text-gray-500">Access medical records</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  
                  <button 
                    onClick={() => showToast("Feature coming soon!", "info")}
                    className="w-full flex items-center justify-between p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                        <Pill className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Prescription Templates</span>
                        <p className="text-sm text-gray-500">Common prescriptions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Patient Queue</span>
                    </div>
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Database</span>
                    </div>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Staff Portal</span>
                    </div>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Last updated: {currentTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}
        
        <AnimatePresence>
          {currentPatient && (
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
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
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Patient Name</p>
                        <p className="text-lg font-semibold text-gray-900">{currentPatient.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Age & Contact</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentPatient.age} years • {currentPatient.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Token Number</p>
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold">
                          #{currentPatient.appointmentNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 overflow-y-auto flex-1">
                  <form id="treatment-form" onSubmit={handleSubmitTreatment} className="space-y-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-600 mr-2" />
                          Diagnosis
                        </div>
                      </label>
                      <textarea
                        required
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px] resize-none"
                        placeholder="Enter medical diagnosis..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <div className="flex items-center">
                          <Pill className="w-5 h-5 text-green-600 mr-2" />
                          Prescription
                        </div>
                      </label>
                      <textarea
                        required
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-40 font-mono text-sm bg-gray-50"
                        placeholder="Enter prescription details..."
                      />
                    </div>
                  </form>
                </div>

                <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          isOpen: true,
                          title: "Cancel Consultation",
                          message: "Are you sure you want to cancel this consultation? All unsaved data will be lost.",
                          onConfirm: () => setCurrentPatient(null),
                          type: "warning"
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
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
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="border-b border-gray-200 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <History className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
                        <p className="text-gray-600">Past consultations for {currentPatient?.patientName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHistoryModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
                  {historyList.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Found</h3>
                      <p className="text-gray-600">No past consultations available for this patient</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historyList.map((record) => (
                        <div key={record._id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Consultation</h4>
                              <p className="text-sm text-gray-500">
                                {record.date ? new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Date not available'}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                              Token #{record.appointmentNumber}
                            </span>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Diagnosis</p>
                              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{record.diagnosis}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Prescription</p>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap">
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
      </div>
    </Layout>
  );
}