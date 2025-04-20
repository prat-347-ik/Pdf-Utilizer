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
    setExtractedFile(null);
    setMessage({ type: "", text: "" });
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to extract images from." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Extracting images... Please wait." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractImages(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setExtractedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "Image extraction complete!" });
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Error extracting images. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#F5EEDD" }}>
      <Sidebar />

      <motion.div
        className="flex flex-1 justify-center items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="p-6 w-full max-w-xl bg-white shadow-lg rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-2xl font-bold mb-4 text-center"
            style={{ color: "#077A7D" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Extract Images from PDF
          </motion.h2>

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

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Select PDF:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold"
              style={{
                backgroundColor: "#7AE2CF",
                color: "#06202B",
              }}
            />
          </div>

          <motion.button
            onClick={handleExtract}
            disabled={loading}
            className="w-full text-white py-2 px-4 rounded-md transition disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
            style={{
              backgroundColor: loading ? "#999999" : "#077A7D",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Extracting..." : "Extract Images"}
          </motion.button>

          {extractedFile && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-600 font-semibold mb-2">
                Extracted PDF is ready:
              </p>
              <motion.button
                onClick={() => window.open(extractedFile, "_blank")}
                className="text-white py-2 px-2 rounded-md"
                style={{ backgroundColor: "#06202B" }}
                whileHover={{ scale: 1.05 }}
              >
                Download Extracted PDF
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExtractImages;
