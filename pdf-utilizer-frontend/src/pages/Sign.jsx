import { useState } from "react";
import { signPDF } from "../api/apiService";
import ToolLayout from "../components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PenTool, UploadCloud, FileText, CheckCircle, 
  AlertCircle, Download, X, Image as ImageIcon, 
  Move, Maximize, FileDigit, Layers
} from "lucide-react";

const SignPDF = () => {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [page, setPage] = useState(1);
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const [height, setHeight] = useState(50);
  const [width, setWidth] = useState(100);
  const [signedFile, setSignedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setSignedFile(null);
    }
  };

  const handleSignatureChange = (event) => {
    const selectedSignature = event.target.files[0];
    if (selectedSignature) {
      setSignature(selectedSignature);
      const reader = new FileReader();
      reader.onload = () => setSignaturePreview(reader.result);
      reader.readAsDataURL(selectedSignature);
    }
  };

  const handleSign = async () => {
    if (!file || !signature) {
      setMessage({ type: "error", text: "Please provide both a PDF and a signature." });
      return;
    }

    setLoading(true);
    setMessage(null);

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
      setMessage({ type: "success", text: "Document signed successfully!" });
    } catch (error) {
      console.error("Signing error:", error);
      setMessage({ type: "error", text: "Signing failed. Please try again." });
    }

    setLoading(false);
  };

  return (
    <ToolLayout
      title="Sign PDF"
      description="Digitally sign your documents. Upload your signature image and place it precisely where it needs to go."
      theme="purple"
    >
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        
        {/* 1. Dual Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* PDF Upload Card */}
          <div className="relative group">
            {!file ? (
              <>
                <input type="file" accept="application/pdf" onChange={handleFileChange} id="pdf-upload" className="hidden" />
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-purple-500/40 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-purple-200 font-medium">Select Document</p>
                  <p className="text-xs text-purple-400/60 mt-1">PDF Files Only</p>
                </label>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-48 p-5 bg-white/10 border border-purple-500/30 rounded-2xl flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FileText className="text-purple-300" size={24} />
                  </div>
                  <button onClick={() => setFile(null)} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <h3 className="text-white font-bold truncate">{file.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Ready for signature</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Signature Upload Card */}
          <div className="relative group">
            {!signature ? (
              <>
                <input type="file" accept="image/*" onChange={handleSignatureChange} id="sig-upload" className="hidden" />
                <label
                  htmlFor="sig-upload"
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-pink-500/40 rounded-2xl bg-pink-500/5 hover:bg-pink-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-pink-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-pink-400" />
                  </div>
                  <p className="text-pink-200 font-medium">Upload Signature</p>
                  <p className="text-xs text-pink-400/60 mt-1">PNG, JPG, Transparent</p>
                </label>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-48 p-4 bg-white/10 border border-pink-500/30 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 z-10">
                   <button onClick={() => { setSignature(null); setSignaturePreview(null); }} className="p-1.5 bg-black/40 hover:bg-red-500/80 rounded-full text-white transition">
                    <X size={16} />
                  </button>
                </div>
                {signaturePreview && (
                  <img src={signaturePreview} alt="Preview" className="max-h-32 max-w-full object-contain filter drop-shadow-lg" />
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 bg-black/40 px-2 py-1 rounded-full">
                  Preview
                </div>
              </motion.div>
            )}
          </div>

        </div>

        {/* 2. Configuration Deck */}
        <AnimatePresence>
          {file && signature && !signedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Layers className="text-purple-400" size={20} />
                <h3 className="text-white font-bold">Position & Scale</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Page #", val: page, set: setPage, icon: <FileDigit size={14} />, min: 1 },
                  { label: "X Pos", val: x, set: setX, icon: <Move size={14} />, min: 0 },
                  { label: "Y Pos", val: y, set: setY, icon: <Move size={14} className="rotate-90" />, min: 0 },
                  { label: "Width", val: width, set: setWidth, icon: <Maximize size={14} />, min: 10 },
                  { label: "Height", val: height, set: setHeight, icon: <Maximize size={14} className="rotate-90" />, min: 10 },
                ].map((item, idx) => (
                   <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10 focus-within:border-purple-500/50 transition-colors">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1 uppercase tracking-wider">
                        {item.icon} {item.label}
                      </div>
                      <input 
                        type="number" 
                        value={item.val} 
                        onChange={(e) => item.set(Number(e.target.value))}
                        min={item.min}
                        className="w-full bg-transparent text-white font-mono font-bold outline-none"
                      />
                   </div>
                ))}
              </div>

              {/* Status Message */}
              {message && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                  message.type === "error" ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"
                }`}>
                  {message.type === "error" ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                  {message.text}
                </div>
              )}

              {/* Sign Action */}
              <button
                onClick={handleSign}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                  ${loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                  }`}
              >
                {loading ? "Applying Signature..." : (
                  <>Sign Document <PenTool size={18} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Success State */}
        <AnimatePresence>
          {signedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-8 bg-green-500/10 border border-green-500/30 rounded-3xl text-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <CheckCircle className="text-green-400 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Signed & Sealed!</h3>
              <p className="text-gray-400 mb-8">Your document has been successfully signed.</p>
              
              <div className="flex gap-4 justify-center">
                 <button
                  onClick={() => { setSignedFile(null); setFile(null); setSignature(null); setSignaturePreview(null); }}
                  className="px-6 py-3 rounded-xl font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition"
                >
                  Start Over
                </button>
                <button
                  onClick={() => window.open(signedFile, "_blank")}
                  className="px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={20} /> Download PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolLayout>
  );
};

export default SignPDF;