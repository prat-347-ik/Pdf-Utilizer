import { useState } from "react";
import { splitPDF } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // Import Framer Motion

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState("");
  const [splitFile, setSplitFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleSplit = async () => {
    if (!file || !pages.trim()) {
      setMessage({ type: "error", text: "Please select a PDF and specify pages." });
      return;
    }
    setLoading(true);
    setMessage({ type: "info", text: "Splitting PDF... Please wait." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "pages",
      JSON.stringify(pages.split(",").map((num) => parseInt(num.trim())))
    );

    try {
      const response = await splitPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setSplitFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDF split successfully!" });
    } catch (error) {
      console.error("Splitting error:", error);
      setMessage({ type: "error", text: "Error splitting PDF. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-200 to-green-200">
      <Sidebar />

      <motion.div
        className="flex flex-1 justify-center items-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="p-6 w-full max-w-xl bg-white shadow-lg rounded-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Split PDF</h2>

          {/* Message Box with Fade-in Effect */}
          {message.text && (
            <motion.div
              className={`mb-4 p-3 rounded text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </motion.div>
          )}

          <motion.div className="mb-4" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <label className="block text-gray-700 font-semibold mb-1">Select PDF:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </motion.div>

          <motion.div className="mb-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="block text-gray-700 font-semibold mb-1">
              Enter Page Numbers (comma-separated):
            </label>
            <input
              type="text"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., 1,3,5"
            />
          </motion.div>

          {/* Split Button with Hover Effect */}
          <motion.button
            onClick={handleSplit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Splitting..." : "Split PDF"}
          </motion.button>

          {/* Download Split PDF */}
          {splitFile && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-700 font-semibold">Download Split PDF:</p>
              <motion.button
                onClick={() => window.open(splitFile, "_blank")}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Download
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplitPDF;
