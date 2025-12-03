import { useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../api/apiService"; // Import centralized API
import { motion } from "framer-motion";
import { LogIn, User, Lock, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Use the centralized API service
      const response = await loginUser({ username, password });

      // The structure of response.data depends on your backend, 
      // matching your previous axios call structure:
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refresh_token); 
      localStorage.setItem("username", username); 
      
      login(username);
      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      // Handle errors consistently
      const errorMsg = error.response?.data?.error || "Invalid credentials";
      setMessage({ type: "error", text: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <LogIn size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Welcome Back
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Enter your credentials to access your workspace.</p>
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="johndoe"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder-gray-600"
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
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={20} />}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;