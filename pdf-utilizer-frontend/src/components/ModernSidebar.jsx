import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, FilePlus, Scissors, FileText, Image, PenTool, Shield, 
  RotateCw, Volume2, Mic, Languages, FileArchive, ChevronRight 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <Home size={22} /> },
  { name: "Merge", path: "/merge", icon: <FilePlus size={22} /> },
  { name: "Split", path: "/split", icon: <Scissors size={22} /> },
  { name: "Compress", path: "/compress", icon: <FileArchive size={22} /> },
  { name: "Protect", path: "/protect", icon: <Shield size={22} /> },
  { name: "Sign", path: "/smart-sign", icon: <PenTool size={22} /> },
  // ... add other tools here
];

const ModernSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.div
      initial={{ width: "80px" }}
      animate={{ width: isOpen ? "280px" : "80px" }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      onHoverStart={() => setIsOpen(true)}
      onHoverEnd={() => setIsOpen(false)}
      className="h-screen fixed left-0 top-0 z-50 flex flex-col bg-white/10 dark:bg-black/40 backdrop-blur-xl border-r border-white/10 shadow-2xl overflow-hidden"
    >
      {/* Logo Area */}
      {/* Changed justify-center to pl-5. 
          Math: 20px padding + 40px icon + 20px remaining = 80px. 
          This keeps it centered in collapsed mode but pinned to the left during expansion. */}
      <div className="h-20 flex items-center pl-5 relative shrink-0">
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl shadow-lg flex-shrink-0 z-20" />
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-20 text-xl font-bold text-white tracking-wide whitespace-nowrap ml-2"
            >
              PDF Utilizer
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="relative block px-4">
              <div
                className={`flex items-center h-12 px-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* Icon - Wrapped in fixed width to prevent shift */}
                <div className="min-w-[24px] flex justify-center">{item.icon}</div>

                {/* Text Label (Only visible when open) */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-4 font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active Indicator Dot */}
                {isActive && !isOpen && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute right-4 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      {/* Also switched to pl-5 to align with the logo */}
      <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
        <div className="flex items-center pl-1">
           <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white/20 flex-shrink-0 z-20" />
           <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-bold text-white truncate">John Doe</p>
                <p className="text-xs text-gray-400 truncate">Free Plan</p>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ModernSidebar;