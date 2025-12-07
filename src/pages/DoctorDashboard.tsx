import React, { useState } from "react";
import Layout from "../components/Layout";
import { registerCounter } from "../services/auth";

export default function DoctorDashboard() {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleCreateCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerCounter(formData);
      setMessage("Counter staff registered successfully!");
      setFormData({ name: "", email: "", password: "" });
      setShowAddStaff(false);
    } catch (error: any) {
      setMessage("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-800">Patients Queue</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
          <h3 className="font-bold text-purple-800">Total Visits</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">45</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-emerald-800">Status</h3>
            <p className="text-emerald-600 mt-2">Active</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Manage Counter Staff</h2>
          <button 
            onClick={() => setShowAddStaff(!showAddStaff)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            {showAddStaff ? "Cancel" : "+ Add New Staff"}
          </button>
        </div>

        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}

        {showAddStaff && (
          <form onSubmit={handleCreateCounter} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Name" className="px-4 py-2 border rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="email" placeholder="Email" className="px-4 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <input type="password" placeholder="Password" className="px-4 py-2 border rounded-lg" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            <button type="submit" className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm">Create Account</button>
          </form>
        )}
      </div>
    </Layout>
  );
}