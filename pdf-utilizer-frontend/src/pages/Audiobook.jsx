import { useState } from "react";
import { textToSpeech } from "../api/apiService"; 
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Headphones, FileText, Download, PlayCircle, Loader } from "lucide-react";

const Audiobook = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAudioUrl(null);
    setMessage({ type: "", text: "" });
  };

  const handleConvert = async () => {
    if (!file) return setMessage({ type: "error", text: "Please select a PDF file." });

    setLoading(true);
    setMessage({ type: "info", text: "Generating Audiobook... This may take a minute." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", language);

    try {
      const response = await textToSpeech(formData);
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setMessage({ type: "success", text: "Audiobook ready! Listen or download below." });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Conversion failed. The PDF might be image-based." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-sans text-slate-800 overflow-hidden">
      <Sidebar />
      
      {/* Main Container: Allows scrolling */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-start min-h-full">
          
          <motion.div 
            // ✅ FIX 1: Removed 'overflow-hidden' to prevent clipping
            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-purple-100 my-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header: Added rounding here instead */}
            <div className="bg-purple-600 p-8 text-center text-white rounded-t-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform -skew-y-6 scale-150 origin-top-left"></div>
              <div className="relative z-10">
                <Headphones className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h1 className="text-3xl font-extrabold">Audiobook Creator</h1>
                <p className="text-purple-100 mt-2">Turn your PDFs into MP3s instantly</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Status Message */}
              {message.text && (
                <div className={`p-4 rounded-xl text-sm font-semibold text-center ${
                  message.type === "success" ? "bg-green-100 text-green-700" :
                  message.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {message.text}
                </div>
              )}

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-600">1. Upload PDF</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer group">
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <FileText className={`w-8 h-8 mb-2 ${file ? "text-purple-600" : "text-gray-400"}`} />
                    <span className={`text-xs font-medium px-2 text-center ${file ? "text-purple-700" : "text-gray-500"}`}>
                      {file ? (file.name.length > 25 ? file.name.substring(0,25)+"..." : file.name) : "Click to Upload"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-600">2. Select Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-gray-700 font-medium"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="hi">Hindi</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>

              {/* Convert Button */}
              <button 
                onClick={handleConvert} 
                disabled={loading || !file}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="animate-spin w-5 h-5" /> : <PlayCircle className="w-6 h-6" />}
                {loading ? "Generating Audio..." : "Create Audiobook"}
              </button>

              {/* Result Area */}
              {audioUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4"
                >
                  <h3 className="text-green-800 font-bold text-lg">Your Audiobook is Ready!</h3>
                  
                  {/* Audio Player */}
                  <audio controls src={audioUrl} className="w-full rounded-lg shadow-sm" />
                  
                  {/* Download Button */}
                  <a 
                    href={audioUrl} 
                    download={`audiobook_${language}.mp3`}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition transform hover:scale-105"
                  >
                    <Download className="w-5 h-5" /> Download MP3
                  </a>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ✅ FIX 2: Spacer to ensure bottom scrolling */}
          <div className="h-20 w-full flex-shrink-0"></div>
        </div>
      </main>
    </div>
  );
};

export default Audiobook;