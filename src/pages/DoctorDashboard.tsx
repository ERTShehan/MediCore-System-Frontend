import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { createStaff, getMyStaff, deleteStaff, toggleStaffStatus } from "../services/staff";
import { motion } from "framer-motion";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function DoctorDashboard() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await getMyStaff();
      setStaffList(res.data);
    } catch (error) {
      console.error("Failed to fetch staff", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await createStaff(formData);
      setMessage({ text: "Staff member added successfully!", type: 'success' });
      setFormData({ name: "", email: "", password: "" }); // Reset form
      setShowAddForm(false);
      fetchStaff();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || "Failed to add staff", type: 'error' });
    }
  };

  // 3. Delete Handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await deleteStaff(id);
      setStaffList(staffList.filter(staff => staff._id !== id)); // Optimistic update
    } catch (error) {
      alert("Failed to delete staff");
    }
  };

  // 4. Toggle Status Handler
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStaffStatus(id);
      // Update local state to reflect change immediately
      setStaffList(staffList.map(staff => 
        staff._id === id ? { ...staff, isActive: !staff.isActive } : staff
      ));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
          <h3 className="font-bold text-blue-800">Total Patients Today</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">
          <h3 className="font-bold text-purple-800">Pending Queue</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">4</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
          <h3 className="font-bold text-emerald-800">Active Staff</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {staffList.filter(s => s.isActive).length}
          </p>
        </div>
      </div>

      {/* Staff Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manage Counter Staff</h2>
            <p className="text-sm text-gray-500">Add, remove or disable counter access</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm flex items-center gap-2"
          >
            {showAddForm ? "Close Form" : "+ Add New Staff"}
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.text}
          </div>
        )}

        {showAddForm && (
          <motion.div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-fade-in-down">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">New Staff Details</h3>
            <form onSubmit={handleCreateStaff}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Full Name" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <input type="email" placeholder="Email Address" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Create Password" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
                <div className="mt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition">Create Account</button>
                </div>
            </form>
          </motion.div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Staff Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={4} className="text-center py-6">Loading staff list...</td></tr>
                    ) : staffList.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-6 text-gray-400">No staff members found. Add one to get started.</td></tr>
                    ) : (
                        staffList.map((staff) => (
                            <tr key={staff._id} className="bg-white border-b hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">{staff.name}</td>
                                <td className="px-6 py-4">{staff.email}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {staff.isActive ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-3">
                                    <button 
                                        onClick={() => handleToggleStatus(staff._id)}
                                        className={`text-xs px-3 py-1 rounded border transition ${staff.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                    >
                                        {staff.isActive ? "Disable" : "Enable"}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(staff._id)}
                                        className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </Layout>
  );
}