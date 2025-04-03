import { useState, useRef } from "react";
import { textToSpeech } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { Play, Pause, Download, Upload } from "lucide-react";
import { motion } from "framer-motion";

const TextToSpeech = () => {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleConvert = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to convert to speech." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing... Please wait." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await textToSpeech(formData);
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setMessage({ type: "success", text: "Audio generated successfully!" });
    } catch (error) {
      console.error("TTS error:", error);
      setMessage({ type: "error", text: "Error converting text to speech. Please try again." });
    }

    setLoading(false);
  };

  const togglePlay = () => {
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#FAF1E6] to-[#F8ED8C]">
      <Sidebar />
      <div className="flex flex-1 justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 w-full max-w-xl bg-white shadow-lg rounded-lg border border-gray-200"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-[#89AC46]">🎙️ Text-to-Speech Converter</h2>

          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 p-3 rounded text-center text-white ${
                message.type === "success"
                  ? "bg-green-500"
                  : message.type === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">📂 Upload PDF:</label>
            <motion.div whileHover={{ scale: 1.05 }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md 
                      file:border-0 file:text-sm file:font-semibold file:bg-[#89AC46] 
                      file:text-white hover:file:bg-[#6F8A35] cursor-pointer"
              />
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConvert}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#89AC46] text-white py-2 px-4 
              rounded-md hover:bg-[#6F8A35] transition disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Convert to Speech"} <Upload size={18} />
          </motion.button>

          {loading && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="h-2 bg-blue-500 mt-4 rounded-md"
            />
          )}

          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-[#FF8989] p-4 rounded-lg text-white flex items-center justify-between shadow-lg"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="p-2 bg-[#D3E671] rounded-full hover:bg-[#B0C45D] transition"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </motion.button>

              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

              <motion.a
                whileTap={{ scale: 0.9 }}
                href={audioUrl}
                download="extracted_audio.mp3"
                className="p-2 bg-[#16a34a] rounded-full hover:bg-[#15803d] transition"
              >
                <Download size={24} />
              </motion.a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TextToSpeech;
