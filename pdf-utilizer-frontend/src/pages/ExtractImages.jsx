import { useState } from "react";
import { extractImages } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const ExtractImages = () => {
  const [file, setFile] = useState(null);
  const [extractedImages, setExtractedImages] = useState([]);
  const [extractedPdf, setExtractedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleExtract = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF to extract images." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Extracting images... Please wait." });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractImages(formData);
      setExtractedImages(response.data.images);
      setExtractedPdf(response.data.pdf_path);
      setMessage({ type: "success", text: "Images extracted successfully!" });
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Error extracting images. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-200 to-gray-200">
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
            Extract Images from PDF
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
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </motion.div>

          {/* Extract Button */}
          <motion.button
            onClick={handleExtract}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Extracting..." : "Extract Images"}
          </motion.button>

          {/* Extracted Images Grid */}
          {extractedImages.length > 0 && (
            <motion.div
              className="mt-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 },
                },
              }}
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Extracted Images:</h3>
              <div className="grid grid-cols-2 gap-2">
                {extractedImages.map((img, index) => (
                  <motion.img
                    key={index}
                    src={img}
                    alt={`Extracted ${index + 1}`}
                    className="w-full h-auto rounded"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Download PDF Button */}
          {extractedPdf && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-600 font-semibold">Download all extracted images as a PDF:</p>
              <motion.a
                href={extractedPdf}
                download="Extracted_Images.pdf"
                className="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
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

export default ExtractImages;
