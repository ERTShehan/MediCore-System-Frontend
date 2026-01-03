import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/authContext";
import { useTheme } from "../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { notify, ToastContainer } from "../components/ToastNotification";
import { 
  updateDoctorProfile, 
  changePassword, 
  sendForgotPasswordOTP, 
  resetPasswordWithOTP 
} from "../services/auth";

// Icons
import { 
  ArrowLeft, Camera, User, Mail, MapPin, Building, 
  Save, Lock, Key, Edit2, ShieldAlert, Loader2 
} from "lucide-react";

export default function DoctorProfileManage() {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile Data State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    clinicName: user?.clinicName || "",
    clinicAddress: user?.clinicAddress || "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Forgot Password / OTP State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // Email/Send OTP, Verify & Reset
  const [otpEmail, setOtpEmail] = useState(user?.email || "");
  const [otpCode, setOtpCode] = useState("");
  const [resetPasswords, setResetPasswords] = useState({ new: "", confirm: "" });

  // Handle Profile Input Change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Local preview
    }
  };

  // Submit Profile Updates
  const handleSaveProfile = async () => {
    setLoading(true);
    const loadId = notify.loading("Updating profile...");

    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("clinicName", profileData.clinicName);
      formData.append("clinicAddress", profileData.clinicAddress);
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const res = await updateDoctorProfile(formData);
      
      // Update Context
      setUser(res.data); 
      setIsEditing(false);
      notify.dismiss(loadId);
      notify.success("Profile updated successfully!");
    } catch (error: any) {
      notify.dismiss(loadId);
      notify.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Change Password (Logged In)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return notify.error("New passwords do not match");
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      notify.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      notify.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Send OTP
  const handleSendOTP = async () => {
    if (!otpEmail) return notify.error("Please enter email");
    setLoading(true);
    try {
      await sendForgotPasswordOTP(otpEmail);
      setOtpStep(2);
      notify.success(`OTP sent to ${otpEmail}`);
    } catch (error: any) {
      notify.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password with OTP
  const handleResetPassword = async () => {
    if (otpCode.length !== 4) return notify.error("Enter valid 4-digit OTP");
    if (resetPasswords.new !== resetPasswords.confirm) return notify.error("Passwords do not match");

    setLoading(true);
    try {
      await resetPasswordWithOTP({
        email: otpEmail,
        otp: otpCode,
        newPassword: resetPasswords.new
      });
      notify.success("Password reset successfully! Please login again if needed.");
      setShowForgotModal(false);
      //Logout user if critical
    } catch (error: any) {
      notify.error(error.response?.data?.message || "Invalid OTP or error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <div className={`min-h-screen pb-10 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        
        {/* Header */}
        <div className={`sticky top-0 z-40 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/doctor-dashboard")} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Manage Profile</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          
          {/* Profile Info Card */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            {/* Cover / Header */}
            <div className="h-32 bg-linear-to-r from-blue-600 to-emerald-600 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="relative group">
                  <div className={`w-28 h-28 rounded-full border-4 overflow-hidden ${theme === 'dark' ? 'border-gray-900 bg-gray-800' : 'border-white bg-gray-100'}`}>
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  {/* Photo Upload Button */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
              
              <div className="absolute top-4 right-4">
                 <button 
                   onClick={() => setIsEditing(!isEditing)}
                   className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                     isEditing 
                       ? 'bg-red-600 text-white hover:bg-red-700' 
                       : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                   }`}
                 >
                   {isEditing ? <><ShieldAlert className="w-4 h-4"/> Cancel</> : <><Edit2 className="w-4 h-4"/> Edit Profile</>}
                 </button>
              </div>
            </div>

            <div className="pt-16 px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-500">
                    <User className="w-5 h-5" /> Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        disabled={!isEditing}
                        value={profileData.name} 
                        onChange={handleProfileChange}
                        className={`w-full p-3 rounded-xl border outline-none transition-colors ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                        } ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          value={profileData.email} 
                          disabled // Email usually cannot be changed easily
                          className={`w-full pl-10 p-3 rounded-xl border outline-none ${
                            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                          } opacity-60 cursor-not-allowed`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinic Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-500">
                    <Building className="w-5 h-5" /> Clinic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Clinic / Center Name</label>
                      <input 
                        type="text" 
                        name="clinicName"
                        placeholder="Ex: City Care Medical Center"
                        disabled={!isEditing}
                        value={profileData.clinicName} 
                        onChange={handleProfileChange}
                        className={`w-full p-3 rounded-xl border outline-none transition-colors ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'
                        } ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Address (For Bill Header)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea 
                          name="clinicAddress"
                          placeholder="Ex: 123, Main Street, Colombo"
                          disabled={!isEditing}
                          value={profileData.clinicAddress} 
                          onChange={(e: any) => handleProfileChange(e)}
                          className={`w-full pl-10 p-3 rounded-xl border outline-none h-24 resize-none transition-colors ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'
                          } ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="mt-8 flex justify-end"
                  >
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Security Section */}
          <div className={`rounded-2xl border shadow-sm p-8 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Security Settings
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className={`flex-1 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${
                  theme === 'dark' ? 'border-gray-700 hover:border-gray-500 hover:bg-gray-800' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Change Password</span>
              </button>

              <button 
                onClick={() => { setShowForgotModal(true); setOtpStep(1); }}
                className={`flex-1 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${
                  theme === 'dark' ? 'border-gray-700 hover:border-gray-500 hover:bg-gray-800' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Key className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Forgot Password?</span>
              </button>
            </div>
          </div>

        </div>


        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <input type="password" placeholder="Old Password" required className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} 
                    value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} />
                  <input type="password" placeholder="New Password" required className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} 
                    value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                  <input type="password" placeholder="Confirm New Password" required className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} 
                    value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                  
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{loading ? "Saving..." : "Change Password"}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-bold mb-4">{otpStep === 1 ? "Reset Password" : "Verify & Reset"}</h2>
                
                {otpStep === 1 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Enter your email to receive a 4-digit verification code.</p>
                    <input type="email" placeholder="Enter Email Address" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                      className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} />
                    <button onClick={handleSendOTP} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-green-500">OTP sent to {otpEmail}</p>
                    <input type="text" maxLength={4} placeholder="Enter 4-Digit OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                      className={`w-full p-3 text-center text-2xl tracking-widest rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} />
                    
                    <input type="password" placeholder="New Password" value={resetPasswords.new} onChange={(e) => setResetPasswords({...resetPasswords, new: e.target.value})}
                      className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} />
                    
                    <input type="password" placeholder="Confirm Password" value={resetPasswords.confirm} onChange={(e) => setResetPasswords({...resetPasswords, confirm: e.target.value})}
                      className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`} />

                    <button onClick={handleResetPassword} disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      {loading ? "Verifying..." : "Reset Password"}
                    </button>
                  </div>
                )}

                <button onClick={() => setShowForgotModal(false)} className="w-full mt-3 text-sm text-gray-500 hover:underline">Cancel</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}