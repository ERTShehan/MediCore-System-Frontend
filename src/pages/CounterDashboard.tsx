import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { createVisit, getQueueStatus, getVisitDetails, getAllTodayVisits } from "../services/visit";
import { useTheme } from "../hooks/useTheme";
import TodayPatientsModal from "../components/TodayPatientsModal";
import { notify, ToastContainer } from "../components/ToastNotification";

// Icons
import {
  Users, Clock, Printer, UserPlus, CheckCircle,
  Phone, RefreshCw, UserCheck, FileText, AlertOctagon,
  Hash, Calendar, Activity, Download,
  Search, Filter, ArrowUpRight, Loader2
} from "lucide-react";

// Interfaces
interface VisitData {
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

export default function CounterDashboard() {
  const { theme } = useTheme();

  // Registration Form
  const [formData, setFormData] = useState({ patientName: "", age: "", phone: "" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<number | null>(null);
  
  // Status & Queue
  const [currentPatient, setCurrentPatient] = useState<VisitData | null>(null);
  const [completedList, setCompletedList] = useState<VisitData[]>([]);
  const [totalToday, setTotalToday] = useState<number>(0);

  // Modal States
  const [showAllPatientsModal, setShowAllPatientsModal] = useState(false);
  const [allPatientsList, setAllPatientsList] = useState<VisitData[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Polling for Status Updates
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
      setCurrentPatient(data.currentPatient);
      setCompletedList(data.completedList);
      setTotalToday(data.totalToday || 0); 
    } catch (err) {
      console.error("Queue poll error", err);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const res = await createVisit(formData);
      setRegisteredToken(res.appointmentNumber);
      setFormData({ patientName: "", age: "", phone: "" });
      notify.success(`Patient registered successfully! Token: ${res.appointmentNumber}`);
      fetchStatus();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Registration failed");
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
        notify.error("Failed to fetch daily list");
    } finally {
        setLoadingList(false);
    }
  };

  // Filter completed patients based on search
  const filteredCompletedList = completedList.filter(patient =>
    patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.appointmentNumber.toString().includes(searchQuery) ||
    patient.phone.includes(searchQuery)
  );

  // Print Handler
  const handlePrint = async (id: string) => {
    if (isPrintingRef.current) {
      notify.error("Already printing, please wait...");
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
                <tr><td>Name:</td><td><strong>${details.patientName} ${details.visitType === 'emergency' ? '(EMERGENCY)' : ''}</strong></td></tr>
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
          // <div class="bill-summary">
          //   <div class="section-header"><h3>BILL SUMMARY</h3></div>
          //   <table class="summary-table">
          //     <thead><tr><th>Description</th><th>Amount (LKR)</th></tr></thead>
          //     <tbody><tr class="total-row"><td>TOTAL AMOUNT</td><td>2500.00</td></tr></tbody>
          //   </table>
          // </div>
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
            notify.success("Bill printed successfully!");
          }, 100);
        }, 100);
      };
      
    } catch (error) {
      setIsPrinting(false);
      isPrintingRef.current = false;
      notify.error("Failed to load bill details");
    }
  };

  // Stats Cards Component
  const StatsCard = ({ title, value, icon: Icon, color = "blue", trend }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color?: "blue" | "green" | "purple" | "orange";
    trend?: string;
  }) => {
    const colorClasses = {
      blue: {
        bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
        icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        border: theme === 'dark' ? 'border-blue-900/30' : 'border-blue-200'
      },
      green: {
        bg: theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50',
        icon: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600',
        border: theme === 'dark' ? 'border-emerald-900/30' : 'border-emerald-200'
      },
      purple: {
        bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
        icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
        border: theme === 'dark' ? 'border-purple-900/30' : 'border-purple-200'
      },
      orange: {
        bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
        icon: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
        border: theme === 'dark' ? 'border-orange-900/30' : 'border-orange-200'
      }
    };

    return (
      <div className={`rounded-xl border p-5 ${colorClasses[color].border} ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
      } shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            <div className="flex items-baseline space-x-2 mt-2">
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {value}
              </p>
              {trend && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
            <Icon className={`w-5 h-5 ${colorClasses[color].icon}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <ToastContainer />

      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-40 border-b shadow-sm ${
          theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Counter Dashboard
                </h1>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Patient registration and queue management • Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleViewAllPatients}
                    className={`px-4 py-2.5 border text-sm font-medium rounded-lg transition-colors flex items-center ${
                      theme === 'dark'
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Today's Patients
                  </button>
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center ${
                      theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Today" 
              value={totalToday} 
              icon={Users} 
              color="blue"
            />
            <StatsCard 
              title="Completed" 
              value={completedList.length} 
              icon={CheckCircle} 
              color="green"
              trend="Ready"
            />
            <StatsCard 
              title="In Progress" 
              value={currentPatient ? 1 : 0} 
              icon={Activity} 
              color="purple"
            />
            <StatsCard 
              title="System Status" 
              value="Active" 
              icon={Clock} 
              color="orange"
              trend="Live"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Current Consultation Card */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl border shadow-sm ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Current Consultation</h2>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Patient currently with doctor
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      }`}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        Live
                      </span>
                    </div>
                  </div>

                  {currentPatient ? (
                    <div className={`rounded-xl p-6 border ${
                      theme === 'dark' 
                        ? 'bg-linear-to-r from-blue-900/20 to-blue-900/10 border-blue-800/30' 
                        : 'bg-linear-to-r from-blue-50 to-blue-50/50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                          }`}>
                            <UserCheck className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                              NOW CONSULTING
                            </div>
                            <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {currentPatient.patientName}
                            </h3>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded ${
                                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                  <Hash className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Token Number</div>
                                  <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    #{currentPatient.appointmentNumber}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded ${
                                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                  <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Age</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {currentPatient.age} years
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded ${
                                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                  <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Contact</div>
                                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {currentPatient.phone}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-5xl animate-pulse">
                          🩺
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-xl p-8 text-center border ${
                      theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <Clock className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
                      <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>No Active Consultation</h3>
                      <p className={`mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        The doctor is currently not seeing any patient. Patients will appear here once consultation begins.
                      </p>
                      <div className={`inline-flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-4 h-4 mr-2" />
                        Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div>
              <div className={`rounded-xl border shadow-sm ${
                theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>New Patient Registration</h2>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Register patient and generate token
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                    }`}>
                      <UserPlus className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter patient name"
                        required
                        value={formData.patientName}
                        onChange={e => setFormData({...formData, patientName: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="Age"
                          required
                          min="1"
                          max="120"
                          value={formData.age}
                          onChange={e => setFormData({...formData, age: e.target.value})}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                            theme === 'dark' 
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          required
                          pattern="[0-9]{10}"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                            theme === 'dark' 
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="w-full py-3.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                      {registerLoading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
                      className={`mt-6 p-4 border rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-linear-to-r from-emerald-900/20 to-emerald-900/10 border-emerald-800/30' 
                          : 'bg-linear-to-r from-emerald-50 to-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>Last Generated Token</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Successfully registered</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-900'}`}>
                            #{registeredToken}
                          </div>
                          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Ready for consultation
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Completed Treatments Table */}
          <div className={`rounded-xl border shadow-sm overflow-hidden ${
            theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Completed Treatments</h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ready for billing and discharge • {filteredCompletedList.length} patients
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <button className={`p-2.5 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}>
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {completedList.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>No Completed Treatments</h3>
                  <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Patients who have completed their consultation will appear here for billing.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Token No.</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Patient Details</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCompletedList.map((visit) => (
                          <tr key={visit._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-5 px-6">
                              <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                                }`}>
                                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                                    #{visit.appointmentNumber}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {visit.patientName}
                                  </span>
                                  {visit.visitType === 'emergency' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                                      <AlertOctagon className="w-3 h-3 mr-1" />
                                      Emergency
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {visit.age} years
                                  </span>
                                  <span className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Phone className="w-3 h-3 mr-1" />
                                    {visit.phone}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                theme === 'dark' 
                                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                Ready for Billing
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handlePrint(visit._id)}
                                  disabled={isPrinting}
                                  className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                  {isPrinting ? (
                                    <>
                                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                      Printing...
                                    </>
                                  ) : (
                                    <>
                                      <Printer className="w-4 h-4 mr-2" />
                                      Print Bill
                                    </>
                                  )}
                                </button>
                                <button className={`p-2 border rounded-lg ${
                                  theme === 'dark' 
                                    ? 'border-gray-700 text-gray-400 hover:bg-gray-800' 
                                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}>
                                  <ArrowUpRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={`mt-6 flex items-center justify-between text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div>
                      Showing {filteredCompletedList.length} of {completedList.length} completed treatments
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        View All
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <TodayPatientsModal 
        isOpen={showAllPatientsModal}
        onClose={() => setShowAllPatientsModal(false)}
        patients={allPatientsList}
        isLoading={loadingList}
      />

    </Layout>
  );
}