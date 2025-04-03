import { Link, useLocation } from "react-router-dom";
import { 
  Home, FilePlus, Scissors, FileText, Image, 
  PenTool, Shield, RotateCcw, Volume2, Mic, Languages,FileArchive
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation(); // Get current path for active link

  const menuItems = [
    { name: "Dashboard", path: "/Dashboard", icon: <Home size={20} /> },
    { name: "Merge PDFs", path: "/merge", icon: <FilePlus size={20} /> },
    { name: "Split PDF", path: "/split", icon: <Scissors size={20} /> },
    { name: "Extract Text", path: "/extract-text", icon: <FileText size={20} /> },
    { name: "Extract Images", path: "/extract-images", icon: <Image size={20} /> },
    { name: "Sign PDF", path: "/sign", icon: <PenTool size={20} /> },
    { name: "Protect PDF", path: "/protect", icon: <Shield size={20} /> },
    { name: "Compress", path: "/compress", icon: <FileArchive size={20} /> },
    { name: "Rotate PDF", path: "/rotate", icon: <RotateCcw size={20} /> },
    { name: "Text to Speech", path: "/text-to-speech", icon: <Volume2 size={20} /> },
    { name: "Speech to Text", path: "/speech-to-text", icon: <Mic size={20} /> },
    { name: "Translate PDF", path: "/translate", icon: <Languages size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 shadow-lg overflow-y-auto">
      {/* Sidebar Title */}
      <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6 tracking-wide">
        PDF Utilizer
      </h2>

      {/* Sidebar Menu */}
      <ul>
        {menuItems.map((item) => (
          <li key={item.name} className="mb-2">
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-300 
                ${location.pathname === item.path 
                  ? "bg-cyan-600 text-black font-bold shadow-lg scale-105" 
                  : "hover:bg-gray-700 hover:scale-105"}`}
            >
              {item.icon} {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
