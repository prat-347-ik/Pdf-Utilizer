import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        username,
        email,
        password,
      });
      setMessage({ type: "success", text: "Account created! Redirecting..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Registration failed" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Create Account
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Join us and start optimizing your PDFs.</p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium ${
              message.type === "error" 
                ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                : "bg-green-500/10 border border-green-500/20 text-green-400"
            }`}
          >
            {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="johndoe"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-white placeholder-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-white placeholder-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailRef}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-white placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordRef}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Creating Account..." : "Sign Up"}
            {!loading && <ArrowRight size={20} />}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;