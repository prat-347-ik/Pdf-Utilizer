import { useState } from "react";
import { extractText } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const ExtractText = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [downloadLink, setDownloadLink] = useState(null);

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleExtractText = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to extract text." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Extracting text... Please wait." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractText(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      setDownloadLink(fileURL);
      setMessage({ type: "success", text: "Text extracted successfully! Download the PDF." });
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Error extracting text. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-green-200 to-blue-200">
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
            className="text-2xl font-bold mb-4 text-center text-green-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Extract Text from PDF
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
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-700 cursor-pointer"
            />
          </motion.div>

          {/* Extract Button */}
          <motion.button
            onClick={handleExtractText}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Extracting..." : "Extract Text"}
          </motion.button>

          {/* Download PDF Button */}
          {downloadLink && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-700 font-semibold">Extracted text PDF is ready:</p>
              <motion.a
                href={downloadLink}
                download="extracted_text.pdf"
                className="mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition inline-block"
                whileHover={{ scale: 1.05 }}
              >
                Download PDF
              </motion.a>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExtractText;
