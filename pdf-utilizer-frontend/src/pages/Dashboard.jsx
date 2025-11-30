import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, FilePlus, Scissors, FileText, Image, PenTool, 
  Shield, RotateCw, Volume2, Mic, Languages, FileArchive, 
  Sparkles, Sun, Moon ,Bot
} from "lucide-react";

// Tools config remains the same
const tools = [
  { id: 1, name: "Merge PDFs", path: "/merge", description: "Combine files into one.", icon: <FilePlus size={32} />, color: "bg-purple-500", span: "col-span-2 row-span-2" },
  { id: 2, name: "Split PDF", path: "/split", description: "Extract pages.", icon: <Scissors size={28} />, color: "bg-blue-500", span: "col-span-1 row-span-1" },
  { id: 3, name: "Sign PDF", path: "/smart-sign", description: "Digitally sign docs.", icon: <PenTool size={28} />, color: "bg-emerald-500", span: "col-span-1 row-span-1" },
  { id: 4, name: "Protect PDF", path: "/protect", description: "Encrypt with password.", icon: <Shield size={28} />, color: "bg-indigo-500", span: "col-span-1 row-span-2" },
  { id: 5, name: "Compress", path: "/compress", description: "Reduce file size.", icon: <FileArchive size={28} />, color: "bg-orange-500", span: "col-span-1 row-span-1" },
  { id: 6, name: "Extract Text", path: "/extract-text", description: "Convert PDF to text.", icon: <FileText size={28} />, color: "bg-pink-500", span: "col-span-1 row-span-1" },
  { id: 7, name: "Extract Images", path: "/extract-images", description: "Get images from PDF.", icon: <Image size={28} />, color: "bg-teal-500", span: "col-span-1 row-span-1" },
  { id: 8, name: "Rotate PDF", path: "/rotate", description: "Fix orientation.", icon: <RotateCw size={28} />, color: "bg-cyan-500", span: "col-span-1 row-span-1" },
  { id: 9, name: "Audiobook", path: "/audiobook", description: "Listen to PDFs.", icon: <Volume2 size={28} />, color: "bg-yellow-500", span: "col-span-1 row-span-1" },
  { id: 10, name: "Translate", path: "/translate", description: "Translate content.", icon: <Languages size={28} />, color: "bg-red-500", span: "col-span-1 row-span-1" },
  { id: 11, name: "Chat with PDF", path: "/chat",description: "Ask questions to your AI assistant.", icon: <Bot size={32} />, color: "bg-gradient-to-br from-indigo-600 to-violet-600"},
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) navigate("/login");
    else setUsername(storedUsername);
    
    if (document.documentElement.classList.contains("dark")) setDarkMode(true);
  }, [navigate]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    // Removed "flex" wrapper that held Sidebar. Now it's a simple full-width column.
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 overflow-y-auto font-sans transition-colors duration-300 relative">
        
        {/* Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* CONTAINER FOR CONTENT (Added max-w-7xl to keep it readable on huge screens) */}
        <div className="max-w-7xl mx-auto flex flex-col min-h-screen z-10 relative">

            {/* HEADER */}
            <header className="flex justify-between items-center p-8">
            <div className="flex flex-col">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
                {greeting}, {username} <span className="text-3xl">👋</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                Welcome to your workspace.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white dark:bg-white/10 shadow-lg hover:scale-110 transition text-gray-800 dark:text-white"
                >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-white shadow-lg"></div>
            </div>
            </header>

            {/* SEARCH BAR */}
            <div className="px-8 pb-8">
            <div className="relative w-full">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                type="text" 
                placeholder="What would you like to do today?" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800 dark:text-white transition-all text-lg"
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </div>

            {/* TOOLS GRID */}
            <div className="flex-1 px-8 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[180px]">
                
                {/* Promo Card */}
                <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-1 row-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between border border-white/10"
                >
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-white/10 rounded-lg"><Sparkles size={20} /></div>
                    <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">FREE</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold">PDF Utilizer</h3>
                    <p className="text-gray-400 text-sm">v1.0.0</p>
                </div>
                </motion.div>

                {/* Tool Cards */}
                {filteredTools.map((tool, index) => (
                <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative group overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/50 dark:border-white/5 bg-white dark:bg-white/5 ${tool.span || "col-span-1 row-span-1"}`}
                >
                    <Link to={tool.path} className="flex flex-col h-full w-full p-6 relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {tool.icon}
                    </div>
                    
                    <div className="mt-auto">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-500 transition-colors">
                        {tool.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 opacity-80 group-hover:opacity-100">
                        {tool.description}
                        </p>
                    </div>

                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-gray-400 dark:text-white">
                        →
                    </div>
                    </Link>

                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
                ))}

            </div>
            </div>
        </div>
    </div>
  );
}