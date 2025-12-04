import { useState, useMemo, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext"; 
import { 
  FilePlus, Scissors, FileText, Image, PenTool, Shield, 
  RotateCw, Languages, FileArchive, 
  Search, BrainCircuit, Eraser, FileDiff, Sparkles, BookOpen, Layers,
  LayoutGrid, Settings as SettingsIcon
} from "lucide-react";

// 1. Organize Menu Items into Categories
const menuCategories = [
  {
    title: "General",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutGrid size={22} /> },
      { name: "Settings", path: "/settings", icon: <SettingsIcon size={22} /> },
    ]
  },
  {
    title: "Edit & Organize",
    items: [
      { name: "Merge PDFs", path: "/merge", icon: <FilePlus size={22} /> },
      { name: "Split PDF", path: "/split", icon: <Scissors size={22} /> },
      { name: "Rotate Pages", path: "/rotate", icon: <RotateCw size={22} /> },
      { name: "Compress", path: "/compress", icon: <FileArchive size={22} /> },
    ]
  },
  {
    title: "AI & Intelligence",
    items: [
      { name: "Chat with PDF", path: "/chat", icon: <BrainCircuit size={22} /> },
      { name: "Study Quiz", path: "/study-quiz", icon: <Sparkles size={22} /> },
      { name: "Translate", path: "/translate", icon: <Languages size={22} /> },
    ]
  },
  {
    title: "Security & Sign",
    items: [
      { name: "Protect PDF", path: "/protect", icon: <Shield size={22} /> },
      { name: "Smart Redact", path: "/redact", icon: <Eraser size={22} /> },
      { name: "Sign Document", path: "/smart-sign", icon: <PenTool size={22} /> },
    ]
  },
  {
    title: "Content Tools",
    items: [
      { name: "Extract Text", path: "/extract-text", icon: <FileText size={22} /> },
      { name: "Extract Images", path: "/extract-images", icon: <Image size={22} /> },
      { name: "Compare PDFs", path: "/diff", icon: <FileDiff size={22} /> },
    ]
  },
  {
    title: "Audio",
    items: [
      { name: "Audiobook", path: "/audiobook", icon: <BookOpen size={22} /> },
    ]
  }
];

const ModernSidebar = () => {
  // --- UPDATED: Get User Context ---
  const { user, isGuest } = useContext(AuthContext);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // --- UPDATED: Dynamic User Logic ---
  const displayName = user?.username || "Guest";
  const initials = displayName.charAt(0).toUpperCase();
  // If guest, show "Guest Mode", otherwise show plan (e.g. "free Plan")
  const userPlan = isGuest || !user ? "Guest Mode" : `${user.plan || "free"} Plan`;

  // ✅ FIX: Determine avatar style dynamically
  // If user has a custom avatar string (like a gradient class), use it.
  // Otherwise, fallback to the default purple gradient.
  const avatarStyle = user?.avatar || "bg-gradient-to-tr from-indigo-500 to-purple-500";

  // Filter items based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return menuCategories;
    
    return menuCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  return (
    <motion.div
      initial={{ width: "80px" }}
      animate={{ width: isOpen ? "280px" : "80px" }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      className={`h-screen fixed left-0 top-0 z-50 flex flex-col border-r border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-black/20`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => { setIsOpen(false); setSearchQuery(""); }}
    >
      {/* 1. Header & Logo */}
      <div className="h-20 flex items-center justify-start pl-5 border-b border-white/10 shrink-0 relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
          <Layers className="text-white" size={24} />
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-20"
            >
              <h1 className="text-xl font-bold tracking-wide text-gray-800 dark:text-white">PDF Utilizer</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Search Bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text"
                placeholder="Find a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/40 dark:bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-500 dark:text-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-2">
        {filteredCategories.map((category, idx) => (
          <div key={idx} className="px-3">
            
            {/* Category Header */}
            {isOpen && !searchQuery && (
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 mt-4">
                {category.title}
              </div>
            )}

            {/* Separator for closed state */}
            {!isOpen && idx !== 0 && (
              <div className="w-8 h-[1px] bg-white/10 mx-auto my-2" />
            )}

            {/* Menu Items */}
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Link to={item.path} key={item.path}>
                    <div className={`
                      relative flex items-center h-12 px-3.5 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? "bg-white/40 dark:bg-white/10 shadow-lg border border-white/20 backdrop-blur-md text-blue-600 dark:text-blue-300" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5"
                      }
                    `}>
                      <div className="shrink-0 flex justify-center w-6">
                        {item.icon}
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-4 text-sm font-medium whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {!isOpen && isActive && (
                        <motion.div
                          layoutId="active-dot"
                          className="absolute right-2 top-2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                        />
                      )}
                      
                      {!isOpen && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-white/80 dark:bg-black/80 backdrop-blur-md text-gray-800 dark:text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/20 shadow-xl translate-x-[-10px] group-hover:translate-x-0 duration-200">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-10 px-4">
            <p>No tools found</p>
          </div>
        )}
      </div>

      {/* 4. Footer / Profile - UPDATED */}
      <div className="p-4 border-t border-white/10 bg-black/5 dark:bg-white/5 shrink-0">
        <div className="flex items-center pl-1">
           {/* ✅ FIX: Use dynamic avatarStyle here */}
           <div className={`w-9 h-9 rounded-full ${avatarStyle} border border-white/20 flex items-center justify-center shrink-0 shadow-md`}>
              <span className="font-bold text-xs text-white">{initials}</span>
           </div>
           <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{userPlan}</p>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ModernSidebar;