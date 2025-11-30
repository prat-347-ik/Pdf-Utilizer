import { useState } from "react";
import { Sun, Moon, Bell, Search } from "lucide-react";

const ModernHeader = ({ title }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="h-20 px-8 flex items-center justify-between z-40 relative">
      {/* Breadcrumb / Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white hidden md:block">
          {title || "Workspace"}
        </h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar (Optional) */}
        <div className="hidden md:flex items-center bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 backdrop-blur-sm focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
                type="text" 
                placeholder="Search tools..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
        </div>

        {/* Notifications */}
        <button className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white hover:shadow-lg transition text-gray-600 dark:text-gray-300">
            <Bell size={20} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white hover:shadow-lg transition text-gray-800 dark:text-yellow-400"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ModernHeader;