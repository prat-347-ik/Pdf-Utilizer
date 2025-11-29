import { useState } from "react";
import { extractText } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

const ExtractText = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [extractedData, setExtractedData] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage({ type: "info", text: "File selected. Ready to extract." });
  };

  const handleExtractText = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to extract text." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Extracting text... Please wait." });
    setExtractedData(""); // Clear previous results

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractText(formData);
      
      if (response.data.success) {
        setExtractedData(response.data.text);
        setMessage({ type: "success", text: "Text extracted successfully!" });
      } else {
         // Fallback if success flag isn't present but text is
        setExtractedData(response.data.text || JSON.stringify(response.data));
        setMessage({ type: "success", text: "Text extracted successfully!" });
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Error extracting text. Please try again." });
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedData);
    setMessage({ type: "success", text: "Copied to clipboard!" });
  };

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedData], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "extracted_text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-green-200 to-blue-200">
      <Sidebar />

      <motion.div
        className="flex flex-1 justify-center items-center p-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          // Increased max-width to max-w-3xl to accommodate the text area better
          className="p-6 w-full max-w-3xl bg-white shadow-lg rounded-lg flex flex-col max-h-[90vh]"
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

          {/* File Upload Section */}
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
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-700 cursor-pointer transition"
            />
          </motion.div>

          {/* Extract Button */}
          <motion.button
            onClick={handleExtractText}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Extracting..." : "Extract Text"}
          </motion.button>

          {/* Result Area - Only shows when text is extracted */}
          {extractedData && (
            <motion.div
              className="flex flex-col flex-1 min-h-0"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
            >
              <label className="block text-gray-700 font-semibold mb-1">Extracted Result:</label>
              <textarea
                className="flex-1 w-full p-3 border border-gray-300 rounded-md resize-none font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 overflow-y-auto"
                value={extractedData}
                readOnly
                style={{ minHeight: "200px" }}
              ></textarea>

              <div className="flex gap-3 justify-end">
                <motion.button 
                  onClick={copyToClipboard}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Copy to Clipboard
                </motion.button>
                <motion.button 
                  onClick={downloadTxtFile}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download .txt
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExtractText;