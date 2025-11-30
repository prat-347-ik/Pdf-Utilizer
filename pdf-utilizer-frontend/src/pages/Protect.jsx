import { useState, useEffect } from "react";
import { protectPDF } from "../api/apiService";
import ToolLayout from "../components/ToolLayout"; // ✅ Using the new Layout with ModernSidebar
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Lock, Unlock, Eye, EyeOff, FileText, 
  CheckCircle, AlertCircle, Download, KeyRound, X 
} from "lucide-react";

const ProtectPDF = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [protectedFile, setProtectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [lockState, setLockState] = useState("open"); // open, half, closed

  // Animate lock based on password length
  useEffect(() => {
    if (password.length === 0) setLockState("open");
    else if (password.length > 0 && password.length < 4) setLockState("half");
    else setLockState("closed");
  }, [password]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setProtectedFile(null);
      setPassword("");
    }
  };

  const handleProtect = async () => {
    if (!file || !password) {
      setMessage({ type: "error", text: "Please provide a file and a password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await protectPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setProtectedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "Encryption successful!" });
    } catch (error) {
      console.error("Protection error:", error);
      setMessage({ type: "error", text: "Encryption failed. Please try again." });
    }

    setLoading(false);
  };

  return (
    <ToolLayout
      title="Protect PDF"
      description="Secure your confidential documents with military-grade AES-256 encryption. Add a password to restrict access."
      theme="emerald" // ✅ Sets the Secure Green Theme
    >
      <div className="h-full flex flex-col max-w-2xl mx-auto">
        
        {/* 1. Vault Drop Zone */}
        <div className="mb-8">
          {!file ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                id="protect-upload"
                className="hidden"
              />
              <label
                htmlFor="protect-upload"
                className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-emerald-500/50 rounded-3xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent" />
                
                <div className="p-5 rounded-full bg-emerald-500/20 group-hover:scale-110 transition-transform mb-4 z-10 border border-emerald-500/30">
                  <Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-100 z-10">Secure Upload</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-500/70 mt-1 z-10">Drag confidential files here</p>
              </label>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between p-5 bg-white/60 dark:bg-white/10 border border-emerald-500/30 rounded-2xl backdrop-blur-md shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                  <FileText className="text-emerald-600 dark:text-emerald-400" size={28} />
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-white font-bold truncate max-w-[200px]">{file.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono bg-emerald-100 dark:bg-black/30 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400">AES-256 Ready</span>
                     <p className="text-xs text-gray-600 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setProtectedFile(null); }}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition group"
              >
                <X className="text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" size={20} />
              </button>
            </motion.div>
          )}
        </div>

        {/* 2. Security Interface */}
        <AnimatePresence>
          {file && !protectedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/60 dark:bg-black/20 p-6 rounded-3xl border border-emerald-500/20 shadow-sm"
            >
              <div className="flex items-center justify-center mb-6">
                 {/* Dynamic Lock Icon */}
                 <motion.div 
                   animate={{ 
                     color: lockState === "closed" ? "#34d399" : "#9ca3af",
                     scale: lockState === "closed" ? 1.1 : 1
                   }}
                   className="p-4 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-100 dark:border-white/10"
                 >
                    {lockState === "open" && <Unlock size={40} />}
                    {lockState === "half" && <Lock size={40} className="opacity-50" />}
                    {lockState === "closed" && <Lock size={40} />}
                 </motion.div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className={`h-5 w-5 ${lockState === 'closed' ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set Encryption Password"
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono tracking-wider"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div className={`p-3 mb-4 rounded-xl flex items-center gap-2 text-sm ${
                  message.type === "error" ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30" : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                }`}>
                  {message.type === "error" ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                  {message.text}
                </div>
              )}

              {/* Encrypt Button */}
              <button
                onClick={handleProtect}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                  ${loading
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25"
                  }`}
              >
                {loading ? "Encrypting..." : (
                  <>Encrypt Document <Shield size={18} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Success / Vault Locked State */}
        <AnimatePresence>
          {protectedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-8 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
              
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Lock className="text-emerald-600 dark:text-emerald-400 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">File Secured</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                Your document is now encrypted. A password is required to view it.
              </p>
              
              <div className="flex gap-4 justify-center">
                 <button
                  onClick={() => { setProtectedFile(null); setFile(null); setPassword(""); }}
                  className="px-6 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition dark:border-white/5"
                >
                  Protect New
                </button>
                <button
                  onClick={() => window.open(protectedFile, "_blank")}
                  className="px-8 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={20} /> Download
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolLayout>
  );
};

export default ProtectPDF;