import { useState } from "react";
import { protectPDF } from "../api/apiService"; // API function
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // Import motion

const ProtectPDF = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [protectedFile, setProtectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setMessage({ type: "info", text: `Selected file: ${selectedFile.name}` });
  };

  const handleProtect = async () => {
    if (!file || !password) {
      setMessage({ type: "error", text: "Please select a PDF and enter a password." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Protecting PDF... Please wait." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await protectPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setProtectedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDF protected successfully!" });
    } catch (error) {
      console.error("Protection error:", error);
      setMessage({ type: "error", text: "Error protecting PDF. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-200 to-indigo-200">
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
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">Protect PDF</h2>

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

          <motion.div
            className="mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </motion.div>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full mb-4 p-2 border rounded-md"
          />

          {/* Protect Button with Hover Effect */}
          <motion.button
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProtect}
            disabled={loading}
          >
            {loading ? "Protecting..." : "Protect PDF"}
          </motion.button>

          {/* Protected File Download */}
          {protectedFile && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-700 font-semibold">Protected PDF is ready:</p>
              <motion.button
                onClick={() => window.open(protectedFile, "_blank")}
                className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Download Protected PDF
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProtectPDF;
