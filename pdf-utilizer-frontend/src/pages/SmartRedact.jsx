import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileUploader from '../components/FileUploader';
import { FiShield, FiCheck, FiDownload } from 'react-icons/fi';
import axios from 'axios';

const SmartRedact = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  // Configuration State
  const [config, setConfig] = useState({
    EMAIL_ADDRESS: true,
    PHONE_NUMBER: true,
    US_SSN: true,
    PERSON: false, // Names often cause false positives, so off by default
  });

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    
    // Create comma-separated string of active keys
    const activeTypes = Object.keys(config).filter(key => config[key]).join(',');
    formData.append('redactionTypes', activeTypes);

    try {
      // Adjust URL to your actual backend port
      const response = await axios.post('http://localhost:5000/api/pdf/redact', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setDownloadUrl(response.data.downloadUrl);
    } catch (error) {
      console.error("Redaction failed", error);
      alert("Failed to redact document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FiShield className="text-blue-600" /> Smart Redaction Shield
          </h1>
          <p className="text-gray-600 mt-2">
            Automatically detect and permanently black out sensitive PII.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Uploader */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <FileUploader onFileSelect={setFile} />
            
            {file && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center gap-2">
                <FiCheck /> Selected: <span className="font-semibold">{file.name}</span>
              </div>
            )}
          </div>

          {/* Right: Configuration */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-semibold text-gray-700 mb-4">What to Redact?</h3>
            <div className="space-y-3">
              {Object.entries(config).map(([key, isActive]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm capitalize">
                    {key.replace(/_/g, ' ').toLowerCase()}
                  </span>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                      isActive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                        isActive ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className={`mt-8 w-full py-3 rounded-lg font-medium text-white transition-all ${
                !file || isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
              }`}
            >
              {isProcessing ? 'Analyzing & Redacting...' : 'Start Redaction'}
            </button>
          </div>
        </div>

        {/* Result Area */}
        {downloadUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl flex items-center justify-between"
          >
            <div>
              <h4 className="text-lg font-bold text-green-800">Document Secure!</h4>
              <p className="text-green-700 text-sm">Your file has been processed and PII removed.</p>
            </div>
            <a 
              href={`http://localhost:5000${downloadUrl}`} 
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload /> Download Redacted PDF
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartRedact;