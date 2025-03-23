import { useState } from "react";
import { mergePDFs } from "../api/apiService"; // Import API function
import Sidebar from "../components/Sidebar";

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [mergedFile, setMergedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" }); // Message state

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

      <div className="flex flex-1 justify-center items-center">
        <div className="p-6 w-full max-w-xl bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">Merge PDFs</h2>

          {/* Message Box */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-4">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
          </div>

          {files.length > 0 && (
            <div className="mb-4 p-3 bg-purple-100 rounded">
              <h3 className="text-lg font-semibold text-purple-700">Selected Files:</h3>
              <ul className="list-disc pl-5 text-gray-800">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:bg-gray-400"
            onClick={handleMerge}
            disabled={loading}
          >
            {loading ? "Merging..." : "Merge PDFs"}
          </button>

          {mergedFile && (
            <div className="mt-4 p-3 bg-green-100 rounded text-center">
              <p className="text-green-700 font-semibold">Merged PDF is ready:</p>
              <button
                onClick={() => window.open(mergedFile, "_blank")}
                className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
              >
                Download Merged PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergePDF;
