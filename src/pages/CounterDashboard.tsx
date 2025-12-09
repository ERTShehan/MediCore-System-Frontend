import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { createVisit, getQueueStatus, getVisitDetails } from "../services/visit";

interface VisitData {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  date?: string;
  diagnosis?: string;
  prescription?: string;
}

export default function CounterDashboard() {
  const [formData, setFormData] = useState({ patientName: "", age: "", phone: "" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<number | null>(null);

  const [currentPatient, setCurrentPatient] = useState<VisitData | null>(null);
  const [completedList, setCompletedList] = useState<VisitData[]>([]);
  const [printData, setPrintData] = useState<VisitData | null>(null);

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
    } catch (err) {
      console.error("Queue poll error", err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const res = await createVisit(formData);
      setRegisteredToken(res.appointmentNumber);
      setFormData({ patientName: "", age: "", phone: "" });
      alert(`Registered! Token Number: ${res.appointmentNumber}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handlePrint = async (id: string) => {
    try {
      const details = await getVisitDetails(id);
      setPrintData(details);
      setTimeout(() => window.print(), 100);
    } catch (error) {
      alert("Failed to load bill details");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 print:hidden">
        
        <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-blue-200 uppercase tracking-widest mb-1">Now Consulting</h2>
            {currentPatient ? (
              <div>
                <h1 className="text-5xl font-extrabold">Token #{currentPatient.appointmentNumber}</h1>
                <p className="text-xl mt-2 opacity-90">{currentPatient.patientName} is with the doctor.</p>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold opacity-50">Waiting for Doctor...</h1>
                <p className="text-sm opacity-50">No patient is currently in session.</p>
              </div>
            )}
          </div>
          <div className="text-6xl animate-pulse">🩺</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">➕ Register New Patient</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <input 
                type="text" placeholder="Patient Name" required 
                value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <input 
                  type="number" placeholder="Age" required 
                  value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  type="tel" placeholder="Phone" required 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-2/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button 
                disabled={registerLoading}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
              >
                {registerLoading ? "Registering..." : "Register & Print Token"}
              </button>
            </form>
            
            {registeredToken && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-green-800">Last Generated Token</p>
                <p className="text-4xl font-bold text-green-700">#{registeredToken}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">✅ Completed Treatments (Ready for Bill)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Token</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {completedList.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6">No completed visits yet.</td></tr>
                  ) : (
                    completedList.map((visit) => (
                      <tr key={visit._id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">#{visit.appointmentNumber}</td>
                        <td className="px-4 py-3">{visit.patientName}</td>
                        <td className="px-4 py-3">{visit.phone}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handlePrint(visit._id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition text-xs font-semibold"
                          >
                            Print Bill
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {printData && (
        <div id="printable-area" className="hidden print:block fixed inset-0 bg-white p-8 z-100">
          <div className="border-2 border-gray-800 p-8 max-w-2xl mx-auto mt-10">
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-4xl font-bold text-gray-900">MediCore Clinic</h1>
              <p className="text-gray-600">123, Health Road, Colombo</p>
              <p className="text-gray-600 font-mono">Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="mb-6 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="text-xl font-bold">{printData.patientName}</p>
                <p className="text-sm text-gray-500 mt-1">Age: {printData.age}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Token Number</p>
                <p className="text-5xl font-extrabold">{printData.appointmentNumber}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold border-b border-gray-300 mb-2">Medical Diagnosis</h3>
              <p className="text-gray-800">{printData.diagnosis || "N/A"}</p>
            </div>

            <div className="mb-8">
              <h3 className="font-bold border-b border-gray-300 mb-2">Prescription</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono whitespace-pre-wrap text-sm">
                {printData.prescription || "No medicines prescribed."}
              </div>
            </div>

            <div className="text-center border-t-2 border-gray-800 pt-4 mt-12">
              <p className="text-sm font-bold">Total Fee: Rs. 600.00</p>
              <p className="text-xs text-gray-500 mt-2">Thank you! Get Well Soon.</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}