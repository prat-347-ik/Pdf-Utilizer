
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, Shield, PenTool, Layers, ArrowRight, 
  Zap, CheckCircle, Scissors, FileImage, Mic2 
} from "lucide-react";
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] opacity-50" />
      </div>
      {/* --- NAVBAR --- */}
      <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-lg shadow-lg shadow-purple-500/20" />
          <span className="text-xl font-bold tracking-tight">PDF Utilizer</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <button className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition shadow-lg shadow-white/10">
              Get Started
            </button>
          </Link>
        </div>
      </nav>
      {/* --- HERO SECTION --- */}
      <header className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-6">
              <Zap size={14} className="fill-purple-300" />
              <span>v2.0 is now live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Documents.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              The all-in-one workspace to merge, sign, secure, and convert your PDFs. 
              No limits, just powerful tools at your fingertips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition transform hover:scale-105">
                  Start for Free <ArrowRight size={20} />
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition">
                  Explore Tools
                </button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-950" />
                ))}
              </div>
              <p>Trusted by 10,000+ users</p>
            </div>
          </motion.div>
          {/* Right: 3D Floating Visuals */}
          <div className="relative h-[500px] hidden lg:block perspective-1000">
            {/* Main Dashboard Card (Tilted) */}
            <motion.div 
              initial={{ rotateY: -10, rotateX: 10, opacity: 0 }}
              animate={{ rotateY: -10, rotateX: 5, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Fake UI Header */}
              <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              {/* Fake UI Body */}
              <div className="p-6 grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 rounded-xl bg-white/5 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </motion.div>
            {/* Floating Tool Card: Merge */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -left-12 top-20 w-48 p-4 bg-gray-800/90 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-xl z-20"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 text-purple-400">
                <Layers size={20} />
              </div>
              <h3 className="font-bold text-white">Merge PDF</h3>
              <div className="h-1 w-12 bg-purple-500/50 rounded-full mt-2" />
            </motion.div>
            {/* Floating Tool Card: Sign */}
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 bottom-32 w-48 p-4 bg-gray-800/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl z-20"
            >
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3 text-cyan-400">
                <PenTool size={20} />
              </div>
              <h3 className="font-bold text-white">Smart Sign</h3>
              <div className="h-1 w-12 bg-cyan-500/50 rounded-full mt-2" />
            </motion.div>
             {/* Floating Tool Card: Security */}
             <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
              className="absolute right-32 -top-12 w-40 p-3 bg-gray-800/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-xl z-0"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Shield size={16} />
                </div>
                <div className="text-xs font-bold text-gray-300">Secure</div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>
      {/* --- FEATURE STRIP --- */}
      <div className="border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-8 overflow-hidden">
          <div className="flex gap-12 justify-center items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-6">
             {/* Use Icons as "Logos" */}
             <span className="flex items-center gap-2 font-bold text-lg"><Layers /> Merge</span>
             <span className="flex items-center gap-2 font-bold text-lg"><Scissors /> Split</span>
             <span className="flex items-center gap-2 font-bold text-lg"><FileText /> OCR</span>
             <span className="flex items-center gap-2 font-bold text-lg"><PenTool /> Sign</span>
             <span className="flex items-center gap-2 font-bold text-lg"><Shield /> Protect</span>
             <span className="flex items-center gap-2 font-bold text-lg"><FileImage /> Images</span>
             <span className="flex items-center gap-2 font-bold text-lg"><Mic2 /> Audio</span>
          </div>
        </div>
      </div>
      {/* --- BENTO GRID TEASER --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need.</h2>
            <p className="text-gray-400">Powerful tools designed for speed and security.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Merge</h3>
              <p className="text-gray-400 text-sm">Combine PDFs with drag-and-drop simplicity. Reorder pages instantly.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                <PenTool size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Digital Signature</h3>
              <p className="text-gray-400 text-sm">Sign documents securely. Place your signature exactly where it belongs.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
              <p className="text-gray-400 text-sm">Encrypt your files with AES-256 passwords. Your data stays private.</p>
            </div>
          </div>
        </div>
      </section>
      {/* --- FOOTER CTA --- */}
      <section className="py-20 text-center px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-purple-900/50 to-transparent border border-purple-500/30 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-gray-300 mb-8">Join thousands of users managing their documents efficiently.</p>
          <Link to="/register">
            <button className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition shadow-xl">
              Create Free Account
            </button>
          </Link>
        </div>
        <footer className="mt-16 text-gray-500 text-sm">
          © {new Date().getFullYear()} PDF Utilizer. All rights reserved.
        </footer>
      </section>
    </div>
  );
};
export default LandingPage;
