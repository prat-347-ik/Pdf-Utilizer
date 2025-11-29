import { useState } from "react";
import { extractImages } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

const ExtractImages = () => {
  const [file, setFile] = useState(null);
  const [extractedFile, setExtractedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setExtractedFile(null); // Reset previous extraction
    setMessage({ type: "info", text: "File selected. Ready to extract." });
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to extract images from." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Extracting images... This may take a moment." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractImages(formData);
      
      // ✅ FIX: Treat response as a ZIP file, not a PDF
      const blob = new Blob([response.data], { type: "application/zip" });
      const fileURL = URL.createObjectURL(blob);
      
      setExtractedFile(fileURL);
      setMessage({ type: "success", text: "Images extracted successfully!" });
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Error extracting images. Please try again." });
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!extractedFile) return;
    
    // Create a temporary link to force the download with the correct extension
    const link = document.createElement("a");
    link.href = extractedFile;
    link.download = "extracted_images.zip"; // ✅ FIX: Download as .zip
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    // Updated background to a consistent Tailwind Gradient (Teal/Cyan theme)
    <div className="flex h-screen bg-gradient-to-r from-teal-200 to-cyan-200">
      <Sidebar />

      <motion.div
        className="flex flex-1 justify-center items-center p-4"
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
            className="text-2xl font-bold mb-4 text-center text-teal-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Extract Images from PDF
          </motion.h2>

          {/* Message Box */}
          {message.text && (
            <motion.div
              className={`mb-4 p-3 rounded text-center text-sm font-semibold ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </motion.div>
          )}

          {/* File Upload */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label className="block text-gray-700 font-semibold mb-1">Select PDF:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-600 cursor-pointer transition"
            />
          </motion.div>

          {/* Extract Button */}
          <motion.button
            onClick={handleExtract}
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Extracting..." : "Extract Images"}
          </motion.button>

          {/* Download Button */}
          {extractedFile && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-700 font-semibold mb-2">
                Images extracted successfully!
              </p>
              <motion.button
                onClick={handleDownload}
                className="bg-teal-700 text-white py-2 px-4 rounded-md hover:bg-teal-800 transition shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download ZIP File
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExtractImages;