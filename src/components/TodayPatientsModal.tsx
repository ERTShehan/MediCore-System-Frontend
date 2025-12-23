import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

// Patient Data Interface
export interface PatientData {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface TodayPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientData[];
  isLoading: boolean;
}

export default function TodayPatientsModal({ 
  isOpen, 
  onClose, 
  patients, 
  isLoading 
}: TodayPatientsModalProps) {
  
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredPatients = patients.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.appointmentNumber.toString().includes(searchQuery)
  );

  // Helper to get status styles
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'completed':
        return theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800';
      case 'in_progress':
        return theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800';
      default: // pending or waiting
        return theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'With Doctor';
      default: return 'Waiting';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 20 }}
            className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Today's Registered Patients</h2>
                <p className="text-blue-100 text-sm">{new Date().toLocaleDateString()}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className={`p-4 border-b ${
              theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input 
                  type="text" 
                  placeholder="Search by patient name or token number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none shadow-sm transition ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Patient List Table */}
            <div className="overflow-y-auto flex-1 p-4">
              {isLoading ? (
                <div className={`text-center py-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Loading daily records...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className={`text-center py-10 flex flex-col items-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Users className="w-12 h-12 mb-2 opacity-50" />
                  <p>No patients found matching your search.</p>
                </div>
              ) : (
                <table className={`w-full text-sm text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <thead className={`text-xs uppercase sticky top-0 ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <tr>
                      <th className="px-6 py-3">Token</th>
                      <th className="px-6 py-3">Patient Name</th>
                      <th className="px-6 py-3">Age</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredPatients.map((p) => (
                      <tr key={p._id} className={`border-b transition ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className={`px-6 py-4 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          #{p.appointmentNumber}
                        </td>
                        <td className={`px-6 py-4 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                          {p.patientName}
                        </td>
                        <td className="px-6 py-4">{p.age}</td>
                        <td className="px-6 py-4">{p.phone}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(p.status)}`}>
                            {getStatusLabel(p.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t text-right text-sm ${
              theme === 'dark' ? 'border-gray-700 bg-gray-900/50 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'
            }`}>
              Total Records: {filteredPatients.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}