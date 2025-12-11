import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { createVisit, getQueueStatus, getVisitDetails, getAllTodayVisits } from "../services/visit";

// Icons
import {
  Users,
  Clock,
  Printer,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Phone,
  RefreshCw,
  UserCheck,
  FileText,
  Search,
  X
} from "lucide-react";

// Interfaces
interface VisitData {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  status?: 'pending' | 'in_progress' | 'completed';
  date?: string;
  diagnosis?: string;
  prescription?: string;
}

export default function CounterDashboard() {
  // Registration Form
  const [formData, setFormData] = useState({ patientName: "", age: "", phone: "" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Status & Queue
  const [currentPatient, setCurrentPatient] = useState<VisitData | null>(null);
  const [completedList, setCompletedList] = useState<VisitData[]>([]);
  const [totalToday, setTotalToday] = useState<number>(0);

  // --- NEW STATES FOR MODAL ---
  const [showAllPatientsModal, setShowAllPatientsModal] = useState(false);
  const [allPatientsList, setAllPatientsList] = useState<VisitData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Refs
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const isPrintingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (printFrameRef.current) {
        document.body.removeChild(printFrameRef.current);
      }
    };
  }, []);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Polling for Status Updates (Every 3 seconds) ---
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);
    
    fetchStatus(); // Initial call
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getQueueStatus();
      setCurrentPatient(data.currentPatient);
      setCompletedList(data.completedList);
      setTotalToday(data.totalToday || 0); 
    } catch (err) {
      console.error("Queue poll error", err);
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  //Registration Handler ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const res = await createVisit(formData);
      setRegisteredToken(res.appointmentNumber);
      setFormData({ patientName: "", age: "", phone: "" });
      showNotification(`Patient registered successfully! Token: ${res.appointmentNumber}`, 'success');
      fetchStatus();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Registration failed", 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleViewAllPatients = async () => {
    setShowAllPatientsModal(true);
    setLoadingList(true);
    try {
        const res = await getAllTodayVisits();
        setAllPatientsList(res.data);
    } catch (error) {
        showNotification("Failed to fetch daily list", 'error');
    } finally {
        setLoadingList(false);
    }
  };

  // Filter Logic
  const filteredPatients = allPatientsList.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.appointmentNumber.toString().includes(searchQuery)
  );

  // Print Handler ---
  const handlePrint = async (id: string) => {
    if (isPrintingRef.current) {
      showNotification("Already printing, please wait...", 'error');
      return;
    }

    setIsPrinting(true);
    isPrintingRef.current = true;

    try {
      const details = await getVisitDetails(id);
      
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MediCore Clinic - Bill</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; color: #111827; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 3px solid #111827; padding-bottom: 24px; margin-bottom: 32px; }
            .clinic-name { font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 8px; }
            .clinic-address { color: #6b7280; font-size: 16px; margin-bottom: 4px; }
            .clinic-contact { color: #6b7280; font-size: 16px; }
            .bill-details { display: flex; justify-content: space-between; margin-bottom: 32px; }
            .section-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px; }
            .detail-table { font-size: 14px; }
            .detail-table tr td:first-child { padding-right: 16px; color: #6b7280; }
            .detail-table tr td:last-child { font-weight: 500; }
            .consultation-section { margin-bottom: 32px; }
            .section-header { background: #f3f4f6; padding: 12px 16px; border-left: 4px solid #3b82f6; margin-bottom: 16px; }
            .diagnosis-content { padding-left: 20px; border-left: 2px solid #d1d5db; margin-bottom: 20px; }
            .prescription-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; }
            .bill-summary { margin-bottom: 32px; }
            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table th { text-align: left; padding: 12px 0; border-bottom: 1px solid #d1d5db; font-weight: 600; }
            .summary-table td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .summary-table td:last-child { text-align: right; }
            .total-row { border-top: 2px solid #111827; font-weight: 700; font-size: 18px; }
            .footer { text-align: center; border-top: 2px solid #111827; padding-top: 24px; margin-top: 40px; }
            .token-number { font-size: 48px; font-weight: 800; color: #1d4ed8; margin-top: 8px; }
            @media print { @page { margin: 20mm; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="clinic-name">MediCore Clinic & Diagnostics</h1>
            <p class="clinic-address">123 Health Street, Medical District</p>
            <p class="clinic-contact">Colombo 05 • +94 11 234 5678</p>
          </div>
          <div class="bill-details">
            <div>
              <h2 class="section-title">PATIENT DETAILS</h2>
              <table class="detail-table">
                <tr><td>Name:</td><td><strong>${details.patientName}</strong></td></tr>
                <tr><td>Age:</td><td>${details.age} years</td></tr>
                <tr><td>Contact:</td><td>${details.phone}</td></tr>
              </table>
            </div>
            <div style="text-align: right;">
              <h2 class="section-title">BILLING DETAILS</h2>
              <table class="detail-table">
                <tr><td>Bill No:</td><td>B-${details.appointmentNumber}</td></tr>
                <tr><td>Date:</td><td>${new Date().toLocaleDateString()}</td></tr>
                <tr><td>Token No:</td></tr>
              </table>
              <div class="token-number">#${details.appointmentNumber}</div>
            </div>
          </div>
          <div class="consultation-section">
            <div class="section-header"><h3>MEDICAL CONSULTATION DETAILS</h3></div>
            <div style="margin-bottom: 24px;">
              <h4 style="font-weight: 600; margin-bottom: 8px; color: #374151;">Diagnosis</h4>
              <div class="diagnosis-content">${details.diagnosis || "No specific diagnosis recorded"}</div>
            </div>
            <div>
              <h4 style="font-weight: 600; margin-bottom: 8px; color: #374151;">Prescription</h4>
              <div class="prescription-box">${details.prescription || "No medicines prescribed."}</div>
            </div>
          </div>
          <div class="bill-summary">
            <div class="section-header"><h3>BILL SUMMARY</h3></div>
            <table class="summary-table">
              <thead><tr><th>Description</th><th>Amount (LKR)</th></tr></thead>
              <tbody><tr class="total-row"><td>TOTAL AMOUNT</td><td>2500.00</td></tr></tbody>
            </table>
          </div>
          <div class="footer">
            <p style="font-weight: 600; margin-bottom: 8px;">THANK YOU FOR CHOOSING MEDICORE CLINIC</p>
            <p style="color: #6b7280; font-size: 12px;">This is a computer generated bill</p>
          </div>
        </body>
        </html>
      `;

      const iframeDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      iframeDoc?.open();
      iframeDoc?.write(printContent);
      iframeDoc?.close();

      printFrame.onload = () => {
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
            setIsPrinting(false);
            isPrintingRef.current = false;
            showNotification("Bill printed successfully!", 'success');
          }, 100);
        }, 100);
      };
      
    } catch (error) {
      setIsPrinting(false);
      isPrintingRef.current = false;
      showNotification("Failed to load bill details", 'error');
    }
  };

  return (
    <Layout>
      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </motion.div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Counter Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* --- NEW BUTTON: TODAY REGISTERED PATIENT --- */}
              <button
                onClick={handleViewAllPatients}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Today Registered Patient
              </button>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh(Auto Refresh)
              </button>
              {/* <div className="text-sm text-gray-500">
                Auto-refreshing every 3 seconds
              </div> */}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* ================= SECTION 1: CURRENT STATUS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Patient Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Now Consulting</h2>
                    <p className="text-sm text-gray-500">Live patient status</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {currentPatient ? (
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">
                        Currently with Doctor
                      </div>
                      <div className="flex items-baseline space-x-4">
                        <span className="text-4xl font-bold text-gray-900">
                          Token #{currentPatient.appointmentNumber}
                        </span>
                        <span className="text-lg font-semibold text-gray-700">
                          {currentPatient.patientName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Age: {currentPatient.age}
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {currentPatient.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-5xl animate-pulse">🩺</div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Consultation</h3>
                  <p className="text-gray-500">The doctor is currently not seeing any patient</p>
                </div>
              )}
            </div>

            {/* Queue Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Queue Overview</h2>
                  <p className="text-sm text-gray-500">Real-time statistics</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Today's Total</p>
                      <p className="text-xs text-gray-500">All patients (Reg)</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {totalToday}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Completed</p>
                      <p className="text-xs text-gray-500">Ready for bill</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {completedList.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-amber-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">In Progress</p>
                      <p className="text-xs text-gray-500">With doctor</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {currentPatient ? 1 : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Registration Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">New Patient Registration</h2>
                      <p className="text-sm text-gray-500">Register and generate token</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter patient name"
                        required
                        value={formData.patientName}
                        onChange={e => setFormData({...formData, patientName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="Age"
                          required
                          value={formData.age}
                          onChange={e => setFormData({...formData, age: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {registerLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Register Patient
                        </>
                      )}
                    </button>
                  </form>

                  {/* Last Token Display */}
                  {registeredToken && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-6 p-4 bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Last Generated Token</p>
                          <p className="text-xs text-emerald-600">Successfully registered</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-emerald-900">#{registeredToken}</p>
                          <p className="text-xs text-emerald-600 mt-1">Ready for consultation</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Completed Patients */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-emerald-50 rounded-lg mr-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Completed Treatments</h2>
                        <p className="text-sm text-gray-500">Ready for billing and discharge</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                      {completedList.length} patients
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {completedList.length === 0 ? (
                    <div className="py-16 text-center">
                      <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Treatments</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Patients who have completed their consultation will appear here for billing.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Token No.</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Patient Name</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Age</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {completedList.map((visit) => (
                          <tr key={visit._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                  <span className="font-bold text-blue-700">#{visit.appointmentNumber}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">{visit.patientName}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-gray-700">{visit.age} years</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center text-gray-700">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {visit.phone}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handlePrint(visit._id)}
                                disabled={isPrinting}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isPrinting ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Printing...
                                  </>
                                ) : (
                                  <>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print Bill
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {completedList.length > 0 && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Showing {completedList.length} completed treatments
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NEW MODAL: TODAY'S ALL PATIENTS ================= */}
      <AnimatePresence>
        {showAllPatientsModal && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Modal Header */}
                    <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Today's Registered Patients</h2>
                            <p className="text-black text-sm">{new Date().toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setShowAllPatientsModal(false)} className=" p-2 rounded-full hover:bg-gray-700 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Search by patient name or token number..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Patient List Table */}
                    <div className="overflow-y-auto flex-1 p-4">
                        {loadingList ? (
                            <div className="text-center py-10 text-gray-500">Loading daily records...</div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                <Users className="w-12 h-12 mb-2 opacity-50" />
                                <p>No patients found matching your search.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Token</th>
                                        <th className="px-6 py-3">Patient Name</th>
                                        <th className="px-6 py-3">Age</th>
                                        <th className="px-6 py-3">Phone</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((p) => (
                                        <tr key={p._id} className="bg-white border-b hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-bold text-gray-900">#{p.appointmentNumber}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{p.patientName}</td>
                                            <td className="px-6 py-4">{p.age}</td>
                                            <td className="px-6 py-4">{p.phone}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                    ${p.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                      p.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                                      'bg-yellow-100 text-yellow-800'}`}>
                                                    {p.status === 'in_progress' ? 'With Doctor' : 
                                                     p.status === 'completed' ? 'Completed' : 'Waiting'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 text-right text-sm text-gray-500">
                        Total Records: {filteredPatients.length}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </Layout>
  );
}