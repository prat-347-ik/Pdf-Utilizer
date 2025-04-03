import { useState } from "react";
import { convertSpeechToText } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // Import Framer Motion

const SpeechToText = () => {
  const [file, setFile] = useState(null);
  const [textOutput, setTextOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleConvert = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select an audio file to convert to text." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing... Please wait." });

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await convertSpeechToText(formData);
      if (response.data.text) {
        setTextOutput(response.data.text);
        setMessage({ type: "success", text: "Speech converted to text successfully!" });
      } else {
        setMessage({ type: "error", text: "Error: " + response.data.error });
      }
    } catch (error) {
      console.error("STT error:", error);
      setMessage({ type: "error", text: "Error converting speech to text. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#FAF1E6]">
      <Sidebar />

      <motion.div
        className="flex flex-1 justify-center items-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="p-6 w-full max-w-xl bg-[#F8ED8C] shadow-lg rounded-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-[#89AC46]">Speech-to-Text Converter</h2>

          {/* Message Box with Fade-in Effect */}
          {message.text && (
            <motion.div
              className={`mb-4 p-3 rounded text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-[#FF8989] text-white"
                  : "bg-yellow-100 text-yellow-700"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </motion.div>
          )}

          <motion.div className="mb-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="block text-[#89AC46] font-semibold mb-1">Upload Audio File:</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#89AC46] file:text-white hover:file:bg-[#6F8A35] cursor-pointer"
            />
          </motion.div>

          {/* Convert Button with Hover Effect */}
          <motion.button
            onClick={handleConvert}
            disabled={loading}
            className="w-full bg-[#89AC46] text-white py-2 px-4 rounded-md disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Processing..." : "Convert to Text"}
          </motion.button>

          {/* Extracted Text Display */}
          {textOutput && (
            <motion.div
              className="mt-6 bg-[#FF8989] p-4 rounded-lg text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-semibold mb-2">Extracted Text:</h3>
              <motion.p
                className="bg-white text-black p-3 rounded-lg shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {textOutput}
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SpeechToText;
