import { useState } from "react";
import { compressPDF } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const CompressPDF = () => {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("medium"); // Default level
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleCompressionChange = (event) => setCompressionLevel(event.target.value);

  const handleCompress = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to compress." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Compressing PDF... Please wait." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("compression_level", compressionLevel); // Send compression level

    try {
      const response = await compressPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setCompressedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDF compressed successfully!" });
    } catch (error) {
      console.error("Compression error:", error);
      setMessage({ type: "error", text: "Error compressing PDF. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-purple-200 to-pink-200">
      <Sidebar />

      <motion.div
        className="flex flex-1 justify-center items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="p-6 w-full max-w-xl bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <motion.h2
            className="text-2xl font-bold mb-4 text-center text-purple-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Compress PDF
          </motion.h2>

          {/* Message Box */}
          {message.text && (
            <motion.div
              className={`mb-4 p-3 rounded text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {message.text}
            </motion.div>
          )}

          {/* File Upload */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-gray-700 font-semibold mb-1">Select PDF:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
          </motion.div>

          {/* Compression Level Dropdown */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-gray-700 font-semibold mb-1">Compression Level:</label>
            <select
              value={compressionLevel}
              onChange={handleCompressionChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Low (Less Compression, Better Quality)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Maximum Compression, Low Quality)</option>
            </select>
          </motion.div>

          {/* Compress Button */}
          <motion.button
            onClick={handleCompress}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Compressing..." : "Compress PDF"}
          </motion.button>

          {/* Download Button */}
          {compressedFile && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-700 font-semibold">Compressed PDF is ready:</p>
              <motion.button
                onClick={() => window.open(compressedFile, "_blank")}
                className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Download Compressed PDF
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompressPDF;
