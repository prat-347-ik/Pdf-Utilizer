import { useState } from "react";
import { protectPDF } from "../api/apiService"; // Import API function
import Sidebar from "../components/Sidebar";

const ProtectPDF = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [protectedFile, setProtectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" }); // Message state

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage({ type: "info", text: `Selected file: ${event.target.files[0].name}` });
  };

  const handleProtect = async () => {
    if (!file || !password) {
      setMessage({ type: "error", text: "Please select a PDF and enter a password." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing... Please wait." });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await protectPDF(formData);
      
      // Convert response to a downloadable blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadURL = URL.createObjectURL(blob);

      // Use correct filename (Backend prefixes with 'protected_')
      setProtectedFile({
        url: downloadURL,
        name: `protected_${file.name}`
      });

      setMessage({ type: "success", text: "PDF protected successfully!" });

    } catch (error) {
      console.error("Protection error:", error);
      setMessage({ type: "error", text: "Error protecting PDF. Please try again." });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-200 to-green-200">
      <Sidebar />

      <div className="flex flex-1 justify-center items-center">
        <div className="p-6 w-full max-w-xl bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Protect PDF</h2>

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

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full mt-4 p-2 border rounded-md"
          />

          <button
            onClick={handleProtect}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 mt-4"
          >
            {loading ? "Processing..." : "Protect PDF"}
          </button>

          {protectedFile && (
            <div className="mt-4 p-3 bg-green-100 rounded text-center">
              <p className="text-green-700 font-semibold">Protected PDF is ready:</p>
              <a
                href={protectedFile.url}
                download={protectedFile.name}
                className="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Download Protected PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtectPDF;
