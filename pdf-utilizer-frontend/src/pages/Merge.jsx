import { useState } from "react";
import { mergePDFs } from "../api/apiService"; // Import API function
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [mergedFile, setMergedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setMessage({ type: "info", text: `${selectedFiles.length} file(s) selected` });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage({ type: "error", text: "Please select at least two PDF files." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Merging PDFs... Please wait." });

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await mergePDFs(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setMergedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDFs merged successfully!" });
    } catch (error) {
      console.error("Merge error:", error);
      setMessage({ type: "error", text: "Error merging PDFs. Please try again." });
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
            Merge PDFs
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
          <div className="mb-4">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <motion.div
              className="mb-4 p-3 bg-purple-100 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-purple-700">Selected Files:</h3>
              <ul className="list-disc pl-5 text-gray-800">
                {files.map((file, index) => (
                  <motion.li key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
                    {file.name}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Merge Button */}
          <motion.button
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:bg-gray-400"
            onClick={handleMerge}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Merging..." : "Merge PDFs"}
          </motion.button>

          {/* Download Button */}
          {mergedFile && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-700 font-semibold">Merged PDF is ready:</p>
              <motion.button
                onClick={() => window.open(mergedFile, "_blank")}
                className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Download Merged PDF
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MergePDF;
