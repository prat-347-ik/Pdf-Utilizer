import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const isActive = (path) =>
    location.pathname === path ? "ring-2 ring-blue-500 font-semibold" : "";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center transition-colors duration-300">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">
        PDF Utilizer
      </h1>

      <div className="flex gap-4 items-center">
        <Link to="/">
          <button
            className={`px-4 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition ${isActive("/")}`}
          >
            Change Account
          </button>
        </Link>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
