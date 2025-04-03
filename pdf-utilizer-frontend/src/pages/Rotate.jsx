import { useState } from "react";
import { rotatePDF } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const RotatePDF = () => {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState(90);
  const [allPages, setAllPages] = useState(true);
  const [selectedPages, setSelectedPages] = useState("");
  const [rotatedFile, setRotatedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setMessage({ type: "info", text: selectedFile ? "File selected: " + selectedFile.name : "" });
  };

  const handleRotate = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file." });
      return;
    }

    if (!allPages && !selectedPages.trim()) {
      setMessage({ type: "error", text: "Please specify pages to rotate or select 'All Pages'." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing... Please wait." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("angle", angle);
    formData.append("all_pages", allPages);
    if (!allPages) {
      formData.append("pages", selectedPages);
    }

    try {
      const response = await rotatePDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setRotatedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDF rotated successfully!" });
    } catch (error) {
      console.error("Rotate error:", error);
      setMessage({ type: "error", text: "Error rotating PDF. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-200 to-purple-200">
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
            className="text-2xl font-bold mb-4 text-center text-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Rotate PDF
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
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </motion.div>

          {/* Rotation Angle */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-gray-700 font-semibold mb-1">Rotation Angle (°)</label>
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </motion.div>

          {/* Rotate All Pages Option */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-gray-700 font-semibold mb-1">Rotate All Pages?</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="allPages"
                  checked={allPages}
                  onChange={() => setAllPages(true)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="allPages"
                  checked={!allPages}
                  onChange={() => setAllPages(false)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </motion.div>

          {/* Selected Pages Input */}
          {!allPages && (
            <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <label className="block text-gray-700 font-semibold mb-1">Specify Pages (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., 1,3,5"
                value={selectedPages}
                onChange={(e) => setSelectedPages(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
          )}

          {/* Rotate Button */}
          <motion.button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
            onClick={handleRotate}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Rotating..." : "Rotate PDF"}
          </motion.button>

          {/* Download Button */}
          {rotatedFile && (
            <motion.div className="mt-4 p-3 bg-green-100 rounded text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <p className="text-green-700 font-semibold">Rotated PDF is ready:</p>
              <motion.button
                onClick={() => window.open(rotatedFile, "_blank")}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Download Rotated PDF
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RotatePDF;
