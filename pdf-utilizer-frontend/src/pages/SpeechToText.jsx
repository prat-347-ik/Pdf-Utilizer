import { useState } from "react";
import { convertSpeechToText } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

const SpeechToTextDownload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleConvert = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select an audio file." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing..." });

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await convertSpeechToText(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setMessage({ type: "success", text: "Transcription completed!" });
    } catch (error) {
      console.error("STT Error:", error);
      setMessage({ type: "error", text: "Failed to convert speech to text." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#FAF1E6" }}>
      <Sidebar />
      <motion.div
        className="flex flex-1 justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="p-6 w-full max-w-xl shadow-lg rounded-2xl"
          style={{ backgroundColor: "#FDFAF6" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-2xl font-bold mb-4 text-center"
            style={{ color: "#99BC85" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Speech-to-Text Converter
          </motion.h2>

          {message.text && (
            <motion.div
              className={`mb-4 p-3 rounded text-center ${
                message.type === "success"
                  ? "text-black"
                  : message.type === "error"
                  ? "text-red-700"
                  : "text-black"
              }`}
              style={{
                backgroundColor:
                  message.type === "success"
                    ? "#E4EFE7"
                    : message.type === "error"
                    ? "#ffe0e0"
                    : "#fdfaf6",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </motion.div>
          )}

          <div className="mb-4">
            <label className="block font-semibold mb-1" style={{ color: "#99BC85" }}>
              Upload Audio File:
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#E4EFE7] file:text-black hover:file:bg-[#99BC85] hover:file:text-white cursor-pointer"
            />
          </div>

          <motion.button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-2 px-4 rounded-md transition disabled:bg-gray-400 mb-2"
            whileHover={{ scale: 1.05 }}
            style={{
              backgroundColor: loading ? "#cccccc" : "#99BC85",
              color: "#fff",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Convert to PDF"}
          </motion.button>

          {downloadUrl && (
            <motion.div
              className="mt-4 p-3 rounded text-center"
              style={{ backgroundColor: "#E4EFE7" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[#4d7357] font-semibold">
                Your PDF is ready:
              </p>
              <a href={downloadUrl} download="transcription.pdf">
                <motion.button
                  className="mt-2 text-white py-2 px-4 rounded-md flex items-center gap-2"
                  style={{ backgroundColor: "#99BC85" }}
                  whileHover={{ scale: 1.05, backgroundColor: "#7fa16d" }}
                >
                  <Download size={20} /> Download PDF
                </motion.button>
              </a>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SpeechToTextDownload;
