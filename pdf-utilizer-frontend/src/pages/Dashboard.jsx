import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ToolCard from "../components/ToolCard";
import {
  Scissors,
  FilePlus,
  FileText,
  Image,
  PenTool,
  Shield,
  RotateCw,
  Volume2,
  Mic,
  Languages,
  FileArchive,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tools = [
  { name: "Merge PDFs", path: "/merge", description: "Combine multiple PDFs into one", icon: <FilePlus size={40} /> },
  { name: "Split PDF", path: "/split", description: "Divide PDF into smaller files", icon: <Scissors size={40} /> },
  { name: "Extract Text", path: "/extract-text", description: "Extract text from PDF", icon: <FileText size={40} /> },
  { name: "Extract Images", path: "/extract-images", description: "Extract images from PDF", icon: <Image size={40} /> },
  { name: "Sign PDF", path: "/smart-sign", description: "Digitally sign your PDF", icon: <PenTool size={40} /> },
  { name: "Protect PDF", path: "/protect", description: "Add password protection", icon: <Shield size={40} /> },
  { name: "Rotate PDF", path: "/rotate", description: "Rotate pages in your PDF", icon: <RotateCw size={40} /> },
  { name: "Text to Speech", path: "/text-to-speech", description: "Convert PDF text to audio", icon: <Volume2 size={40} /> },
  { name: "Speech to Text", path: "/speech-to-text", description: "Transcribe audio to text", icon: <Mic size={40} /> },
  { name: "Translate PDF", path: "/translate", description: "Translate text in your PDF", icon: <Languages size={40} /> },
  { name: "Compress PDF", path: "/compress", description: "Reduce PDF file size", icon: <FileArchive size={40} /> },
];

export default function Dashboard() {
  const navigate = useNavigate();
   // const { user } = useContext(AuthContext);

  const [username, setUsername] = useState("User");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/login");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF1E6] dark:bg-[#121212] text-gray-900 dark:text-white">
      <Navbar />
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 text-[#89AC46] dark:text-[#c0f08a]">Welcome, {username}!</h1>
        <p className="text-lg mb-6">Choose a tool to get started:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              name={tool.name}
              path={tool.path}
              description={tool.description}
              icon={tool.icon}
              index={index}
            />
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable />
    </div>
  );
}
