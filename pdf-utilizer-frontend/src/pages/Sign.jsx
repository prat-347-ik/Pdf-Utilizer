import { useState } from "react";
import { signPDF } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const SignPDF = () => {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null); // ✅ Live Preview
  const [page, setPage] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [height, setHeight] = useState(50);
  const [width, setWidth] = useState(100);
  const [signedFile, setSignedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleSignatureChange = (event) => {
    const selectedSignature = event.target.files[0];
    setSignature(selectedSignature);

    // ✅ Live Preview
    if (selectedSignature) {
      const reader = new FileReader();
      reader.onload = () => setSignaturePreview(reader.result);
      reader.readAsDataURL(selectedSignature);
    }
  };

  const handleSign = async () => {
    if (!file || !signature) {
      setMessage({ type: "error", text: "Please select a PDF and a signature image." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Signing PDF... Please wait." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("page", page);
    formData.append("x", x);
    formData.append("y", y);
    formData.append("height", height);
    formData.append("width", width);

    try {
      const response = await signPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setSignedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDF signed successfully!" });
    } catch (error) {
      console.error("Signing error:", error);
      setMessage({ type: "error", text: "Error signing PDF. Please try again." });
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
            Sign PDF
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

          {/* Signature Upload with Preview */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-gray-700 font-semibold mb-1">Select Signature Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
            {signaturePreview && (
              <motion.img
                src={signaturePreview}
                alt="Signature Preview"
                className="mt-3 w-32 h-auto rounded-md border shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>

          {/* Positioning Inputs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Page Number", value: page, set: setPage },
              { label: "X Position", value: x, set: setX },
              { label: "Y Position", value: y, set: setY },
              { label: "Height", value: height, set: setHeight },
              { label: "Width", value: width, set: setWidth },
            ].map(({ label, value, set }) => (
              <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <label className="block text-gray-700 font-semibold">{label}:</label>
                <input
                  type="number"
                  value={value}
                  min={0}
                  onChange={(e) => set(Math.max(0, e.target.value))}
                  className="p-2 border rounded-md w-full"
                />
              </motion.div>
            ))}
          </div>

          {/* Sign Button */}
          <motion.button
            onClick={handleSign}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Signing..." : "Sign PDF"}
          </motion.button>

          {/* Download Signed PDF */}
          {signedFile && (
            <motion.div className="mt-4 p-3 bg-green-100 rounded text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <p className="text-green-700 font-semibold">Signed PDF is ready:</p>
              <motion.button
                onClick={() => window.open(signedFile, "_blank")}
                className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Download Signed PDF
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignPDF;
