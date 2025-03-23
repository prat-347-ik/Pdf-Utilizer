import { Link } from "react-router-dom";
import { 
  FileText, Image, FileArchive, Shield, RotateCcw, FileSignature, Lock, 
  Layers, Scissors, Headphones, Mic, Home ,Languages 
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 text-gray-900 h-screen p-4 border-r border-gray-300">
      <h2 className="text-xl font-semibold mb-6">PDF Utilizer</h2>

      {/* Dashboard */}
      <ul className="space-y-2">
        <li>
          <Link to="/" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Home className="w-6 h-6" />
            <span>Dashboard</span>
          </Link>
        </li>
      </ul>

      {/* PDF Tools */}
      <h3 className="text-md font-semibold mt-4 mb-2 text-gray-600">📂 PDF Tools</h3>
      <ul className="space-y-2">
        <li>
          <Link to="/extract-text" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <FileText className="w-6 h-6" />
            <span>Extract Text</span>
          </Link>
        </li>
        <li>
          <Link to="/extract-images" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Image className="w-6 h-6" />
            <span>Extract Images</span>
          </Link>
        </li>
        <li>
          <Link to="/compress" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <FileArchive className="w-6 h-6" />
            <span>Compress PDF</span>
          </Link>
        </li>
        <li>
          <Link to="/protect" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Shield className="w-6 h-6" />
            <span>Protect PDF</span>
          </Link>
        </li>
        <li>
          <Link to="/rotate" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <RotateCcw className="w-6 h-6" />
            <span>Rotate PDF</span>
          </Link>
        </li>
        <li>
          <Link to="/sign" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <FileSignature className="w-6 h-6" />
            <span>Sign PDF</span>
          </Link>
        </li>
        <li>
          <Link to="/lock" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Lock className="w-6 h-6" />
            <span>Lock/Unlock PDF</span>
          </Link>
        </li>
        <li>
          <Link to="/merge" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Layers className="w-6 h-6" />
            <span>Merge PDF</span>
          </Link>
        </li>
        <li>
          <Link to="/split" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Scissors className="w-6 h-6" />
            <span>Split PDF</span>
          </Link>
        </li>
      </ul>

      {/* Utilities */}
      <h3 className="text-md font-semibold mt-4 mb-2 text-gray-600">🔊 Audio & Speech</h3>
      <ul className="space-y-2">
        <li>
          <Link to="/tts" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Headphones className="w-6 h-6" />
            <span>Text to Speech</span>
          </Link>
        </li>
        <li>
          <Link to="/stt" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Mic className="w-6 h-6" />
            <span>Speech to Text</span>
          </Link>
        </li>

      </ul>
      <h3 className="text-md font-semibold mt-4 mb-2 text-gray-600">🌍 Other Utilities</h3>
      <ul className="space-y-2">
        <li>
          <Link to="/translate" className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md">
            <Languages className="w-6 h-6" />
            <span>Translate PDF</span>
          </Link>
        </li>
      </ul>      
    </div>
  );
};

export default Sidebar;
