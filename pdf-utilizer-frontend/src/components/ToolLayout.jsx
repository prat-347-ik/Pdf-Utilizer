import { motion } from "framer-motion";
import ModernSidebar from "./ModernSidebar"; // 👈 Import new sidebar
import ModernHeader from "./ModernHeader";   // 👈 Import new header

const themes = {
  purple: { bg: "from-indigo-900 via-purple-900 to-pink-900", border: "border-purple-500/30", accent: "bg-purple-500", text: "text-purple-300" },
  blue: { bg: "from-blue-900 via-cyan-900 to-teal-900", border: "border-cyan-500/30", accent: "bg-cyan-500", text: "text-cyan-300" },
  // ... other themes
};

const ToolLayout = ({ children, title, description, theme = "purple" }) => {
  const currentTheme = themes[theme] || themes.purple;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white relative flex">
      
      {/* 1. The New Sidebar (Fixed Left) */}
      <ModernSidebar />

      {/* 2. Main Content Wrapper (Pushed right by sidebar width) */}
      <div className="flex-1 flex flex-col relative pl-[80px] transition-all duration-300">
        
        {/* Dynamic Backgrounds */}
        <div className={`fixed inset-0 bg-gradient-to-br ${currentTheme.bg} opacity-10 dark:opacity-40 z-0`} />
        <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* 3. The New Header (Sticky Top) */}
        <ModernHeader title={title} />

        {/* 4. The Tool Workspace */}
        <main className="flex-1 z-10 p-6 flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-6xl h-[80vh] flex flex-col md:flex-row bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden`}
          >
            {/* ... (Same Tool Content Logic as before) ... */}
            
            {/* Left Panel */}
            <div className="md:w-1/3 p-8 flex flex-col justify-center bg-white/30 dark:bg-white/5 border-r border-white/10">
               <div className={`w-12 h-1 mb-6 rounded-full ${currentTheme.accent}`} />
               <h1 className="text-3xl font-bold mb-4">{title}</h1>
               <p className={`text-lg ${currentTheme.text} mb-6`}>{description}</p>
            </div>

            {/* Right Panel */}
            <div className="md:w-2/3 p-8 relative overflow-y-auto custom-scrollbar bg-white/10 dark:bg-transparent">
               {children}
            </div>

          </motion.div>
        </main>

      </div>
    </div>
  );
};

export default ToolLayout;