import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import  Navbar  from "../components/Navbar";
import  ToolCard from "../components/ToolCard";
import { Scissors, FilePlus, FileText, Image, PenTool, Shield, RotateCw, Volume2, Mic, Languages, FileArchive } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tools = [
  { name: "Merge PDFs", path: "/merge", description: "Combine multiple PDFs into one", icon: <FilePlus size={40} /> },
  { name: "Split PDF", path: "/split", description: "Divide PDF into smaller files", icon: <Scissors size={40} /> },
  { name: "Extract Text", path: "/extract-text", description: "Extract text from PDF", icon: <FileText size={40} /> },
  { name: "Extract Images", path: "/extract-images", description: "Extract images from PDF", icon: <Image size={40} /> },
  { name: "Sign PDF", path: "/sign", description: "Digitally sign your PDF", icon: <PenTool size={40} /> },
  { name: "Protect PDF", path: "/protect", description: "Add password protection", icon: <Shield size={40} /> },
  { name: "Rotate PDF", path: "/rotate", description: "Rotate pages in your PDF", icon: <RotateCw size={40} /> },
  { name: "Text to Speech", path: "/text-to-speech", description: "Convert PDF text to audio", icon: <Volume2 size={40} /> },
  { name: "Speech to Text", path: "/speech-to-text", description: "Transcribe audio to text", icon: <Mic size={40} /> },
  { name: "Translate PDF", path: "/translate", description: "Translate text in your PDF", icon: <Languages size={40} /> },
  { name: "Compress PDF", path: "/compress", description: "Reduce PDF file size", icon: <FileArchive size={40} /> },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-[#8F87F1] via-[#E9A5F1] to-[#C68EFD] text-white">
      <Navbar />
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name || "User"}!</h1>
        <p className="text-lg mb-6">Choose a tool to get started:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <ToolCard key={index} name={tool.name} path={tool.path} description={tool.description} icon={tool.icon} className="w-52 h-52 flex flex-col items-center justify-center bg-white text-black rounded-xl shadow-lg p-6 hover:shadow-2xl transition" />
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable />
    </div>
  );
}