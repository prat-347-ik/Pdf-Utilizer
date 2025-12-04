import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  updateUserPlan, 
  changeUserPassword, 
  deleteUserAccount
} from '../api/apiService';
import { 
  User, CreditCard, Save, CheckCircle, Zap, Shield, 
  Lock, Trash2, AlertTriangle 
} from 'lucide-react';

import ModernSidebar from '../components/ModernSidebar';
import ModernHeader from '../components/ModernHeader';

// Predefined Modern Avatars
const AVATAR_OPTIONS = [
  "bg-gradient-to-tr from-blue-500 to-purple-600",
  "bg-gradient-to-tr from-emerald-400 to-cyan-500",
  "bg-gradient-to-tr from-orange-400 to-rose-500",
  "bg-gradient-to-tr from-pink-500 to-indigo-500",
  "bg-gradient-to-tr from-gray-700 to-black",
  "bg-gradient-to-tr from-yellow-400 to-red-500",
];

const Settings = () => {
  const { user, login } = useContext(AuthContext); 
  const [profile, setProfile] = useState({ fullName: '', avatar: '', plan: 'free' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await fetchUserProfile(token);
          setProfile({ 
            fullName: data.fullName || '', 
            avatar: data.avatar || AVATAR_OPTIONS[0], 
            plan: data.plan 
          });
        } catch (err) { console.error(err); }
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Reverted to simple JSON update
      const updatedData = await updateUserProfile({
        fullName: profile.fullName,
        avatar: profile.avatar
      }, token);
      
      login({ ...user, ...updatedData }); 
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to update profile." });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
        setMessage({ type: 'error', text: "Please fill in all password fields." });
        return;
    }
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: "New passwords do not match." });
      return;
    }
    try {
      await changeUserPassword({ 
        currentPassword: passwords.current, 
        newPassword: passwords.new 
      }, localStorage.getItem("token"));
      
      setMessage({ type: 'success', text: "Password changed successfully." });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Failed to change password." });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This action is irreversible.")) {
      try {
        await deleteUserAccount(localStorage.getItem("token"));
        localStorage.removeItem("token");
        window.location.href = "/login";
      } catch (err) {
        setMessage({ type: 'error', text: "Failed to delete account." });
      }
    }
  };

  const handlePlanChange = async (newPlan) => {
    const token = localStorage.getItem("token");
    try {
      await updateUserPlan(newPlan, token);
      setProfile(prev => ({ ...prev, plan: newPlan }));
      login({ ...user, plan: newPlan }); 
      setMessage({ type: 'success', text: `Switched to ${newPlan.toUpperCase()} plan!` });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <ModernSidebar />
      <div className="ml-[80px] flex flex-col min-h-screen">
        <ModernHeader />

        <main className="flex-1 p-8 flex justify-center">
          <div className="max-w-5xl w-full space-y-8 animate-fade-in-up">
            
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile, security, and billing.</p>
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl flex items-center gap-3 shadow-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
              >
                <CheckCircle size={20} />
                {message.text}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN */}
              <div className="md:col-span-2 space-y-8">
                
                {/* 1. Public Profile */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-500" /> Public Profile
                  </h2>

                  {/* Original Avatar Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Choose Avatar Style</label>
                    <div className="flex gap-4 flex-wrap">
                      {AVATAR_OPTIONS.map((style, idx) => (
                        <button
                          key={idx}
                          onClick={() => setProfile({ ...profile, avatar: style })}
                          className={`w-12 h-12 rounded-full ${style} transition-all duration-300 hover:scale-110 ring-2 ring-offset-2 dark:ring-offset-gray-900 ${profile.avatar === style ? 'ring-blue-500 scale-110 shadow-lg' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                {/* 2. Security (Keep this) */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-orange-500" /> Security
                    </h2>

                    <div className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Current Password</label>
                            <input 
                                type="password" 
                                value={passwords.current} 
                                onChange={e => setPasswords({...passwords, current: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl outline-none dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">New Password</label>
                                <input 
                                    type="password" 
                                    value={passwords.new} 
                                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl outline-none dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Confirm New</label>
                                <input 
                                    type="password" 
                                    value={passwords.confirm} 
                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl outline-none dark:text-white"
                                />
                            </div>
                        </div>
                        <button onClick={handleChangePassword} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold mt-2">
                            Update Password
                        </button>
                    </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8 h-fit">
                {/* 3. Subscription */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-purple-500" /> Subscription
                  </h2>
                  <div className="space-y-4">
                    <div onClick={() => handlePlanChange('free')} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${profile.plan === 'free' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-white/5'}`}>
                      <div className="flex justify-between items-center mb-2"><span className="font-bold text-gray-800 dark:text-white">Free Plan</span>{profile.plan === 'free' && <CheckCircle size={18} className="text-blue-500" />}</div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Basic PDF tools, 5MB limit.</p>
                    </div>
                    <div onClick={() => handlePlanChange('pro')} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${profile.plan === 'pro' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-white/5'}`}>
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">RECOMMENDED</div>
                      <div className="flex justify-between items-center mb-2"><span className="font-bold text-gray-800 dark:text-white flex items-center gap-2">Pro Plan <Zap size={14} className="fill-yellow-400 text-yellow-400" /></span>{profile.plan === 'pro' && <CheckCircle size={18} className="text-purple-500" />}</div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Unlimited size, AI Chat, OCR & more.</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1"><Shield size={12} /> Secure transaction</p>
                  </div>
                </div>

                {/* 4. Danger Zone (Keep this) */}
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Danger Zone
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Permanently remove your account and all data.</p>
                    <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={18} /> Delete Account
                    </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;