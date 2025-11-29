import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { signPDF } from "../api/apiService"; 
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Import worker using Vite's '?url' syntax
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Apply the worker source
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const SmartSign = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureImg, setSignatureImg] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [signAllPages, setSignAllPages] = useState(false);

  // Layout State
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 }); 
  const [originalPdfSize, setOriginalPdfSize] = useState({ width: 0, height: 0 }); 

  // Signature State (Screen Coordinates)
  const [sigPos, setSigPos] = useState({ x: 100, y: 100, width: 200, height: 100 });

  const containerRef = useRef(null);

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files[0]);
    setSignedPdfUrl(null);
  };
  
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) setSignatureImg(file);
  };

  const onPageLoadSuccess = ({ width, height, originalWidth, originalHeight }) => {
    setOriginalPdfSize({ width: originalWidth, height: originalHeight });
    setPdfDimensions({ width: width, height: height });
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleSign = async () => {
    if (!pdfFile || !signatureImg) return alert("Please upload PDF and Signature");

    setLoading(true);

    const scaleX = originalPdfSize.width / pdfDimensions.width;
    const scaleY = originalPdfSize.height / pdfDimensions.height;

    const finalX = Math.round(sigPos.x * scaleX);
    const finalY = Math.round(sigPos.y * scaleY);
    const finalW = Math.round(sigPos.width * scaleX);
    const finalH = Math.round(sigPos.height * scaleY);

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("signature", signatureImg);
    formData.append("page", pageNumber);
    formData.append("x", finalX);
    formData.append("y", finalY);
    formData.append("width", finalW);
    formData.append("height", finalH);
    formData.append("all_pages", signAllPages);

    try {
      const response = await signPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setSignedPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Signing failed", error);
      alert("Error signing PDF");
    }
    setLoading(false);
  };

  return (
    <div 
      className="flex h-screen" 
      style={{ background: "linear-gradient(135deg, #F0E491 0%, #BBC863 100%)" }}
    >
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <motion.h2 
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: "#31694E" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Interactive PDF Signer
        </motion.h2>

        <div className="flex gap-6 h-full items-start justify-center">
            
          {/* LEFT PANEL: Controls */}
          <motion.div 
            className="w-1/4 bg-white p-6 shadow-xl rounded-2xl flex flex-col gap-5"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 1. Upload PDF */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#31694E" }}>
                1. Upload PDF
              </label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handlePdfChange} 
                // ✅ CHANGED: file:rounded-full -> file:rounded-md
                className="w-full text-sm p-2 rounded border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:text-white hover:file:bg-[#527049] transition cursor-pointer"
              />
            </div>
            
            {/* 2. Upload Signature */}
            <div>
               <label className="block text-sm font-bold mb-2" style={{ color: "#31694E" }}>
                 2. Upload Signature
               </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleSignatureChange} 
                // ✅ ADDED: Same consistent styling for the signature button
                className="w-full text-sm p-2 rounded border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:text-white hover:file:bg-[#527049] transition cursor-pointer"
              />
            </div>
            
            {/* Inject Custom CSS for the file input button background */}
            <style>{`
              input[type="file"]::file-selector-button {
                background-color: #658C58;
                color: white;
              }
            `}</style>

            {/* Checkbox: Sign All Pages */}
            <div 
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ backgroundColor: "#F0E491", borderColor: "#BBC863" }}
            >
                <input 
                    type="checkbox" 
                    id="signAll" 
                    checked={signAllPages} 
                    onChange={(e) => setSignAllPages(e.target.checked)}
                    className="w-5 h-5 cursor-pointer accent-[#31694E]"
                />
                <label htmlFor="signAll" className="text-sm font-bold cursor-pointer select-none" style={{ color: "#31694E" }}>
                    Sign All Pages?
                </label>
            </div>

            {/* Page Navigation */}
            {numPages && (
              <div 
                className={`flex items-center justify-between p-2 rounded-lg ${signAllPages ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ backgroundColor: "#BBC863" }}
              >
                <button 
                  disabled={pageNumber <= 1} 
                  onClick={() => setPageNumber(p => p - 1)} 
                  className="px-3 py-1 font-bold text-white bg-[#658C58] rounded hover:bg-[#31694E] transition"
                >
                  &lt;
                </button>
                <span className="font-semibold text-[#31694E]">Page {pageNumber} of {numPages}</span>
                <button 
                  disabled={pageNumber >= numPages} 
                  onClick={() => setPageNumber(p => p + 1)} 
                  className="px-3 py-1 font-bold text-white bg-[#658C58] rounded hover:bg-[#31694E] transition"
                >
                  &gt;
                </button>
              </div>
            )}

            {/* Sign Button */}
            <motion.button 
                onClick={handleSign} 
                disabled={loading || !signatureImg || !pdfFile}
                className="w-full py-3 rounded-lg shadow-md text-white font-bold tracking-wide mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#31694E" }}
                whileHover={{ scale: 1.03, backgroundColor: "#26523B" }}
                whileTap={{ scale: 0.97 }}
            >
                {loading ? "Processing..." : (signAllPages ? "Sign ALL Pages" : "Sign Current Page")}
            </motion.button>

            {/* Download Link */}
            {signedPdfUrl && (
                <motion.a 
                  href={signedPdfUrl} 
                  download="signed_document.pdf" 
                  className="block text-center py-2 rounded-lg font-bold text-[#31694E] border-2 border-[#31694E]"
                  style={{ backgroundColor: "#F0E491" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03, backgroundColor: "#BBC863" }}
                >
                    Download Signed PDF
                </motion.a>
            )}
          </motion.div>

          {/* RIGHT PANEL: The Canvas */}
          <motion.div 
            className="flex-1 overflow-auto flex justify-center p-6 rounded-2xl relative shadow-inner"
            ref={containerRef}
            style={{ backgroundColor: "#E8E8E8" }} 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
             {pdfFile ? (
                <div className="relative shadow-2xl transition-all duration-300" style={{ width: pdfDimensions.width, height: pdfDimensions.height }}>
                   {/* 1. The PDF Layer */}
                   <Document 
                      file={pdfFile} 
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="border-2"
                      style={{ borderColor: "#658C58" }}
                   >
                      <Page 
                        pageNumber={pageNumber} 
                        width={600} 
                        onLoadSuccess={onPageLoadSuccess}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                   </Document>

                   {/* 2. The Drag & Drop Layer */}
                   {signatureImg && (
                       <Rnd
                         size={{ width: sigPos.width, height: sigPos.height }}
                         position={{ x: sigPos.x, y: sigPos.y }}
                         onDragStop={(e, d) => setSigPos(prev => ({ ...prev, x: d.x, y: d.y }))}
                         onResizeStop={(e, direction, ref, delta, position) => {
                           setSigPos({
                             width: parseInt(ref.style.width),
                             height: parseInt(ref.style.height),
                             ...position,
                           });
                         }}
                         bounds="parent" 
                         className="cursor-move border-2 border-dashed"
                         style={{ borderColor: "#31694E", backgroundColor: "rgba(187, 200, 99, 0.3)" }} 
                       >
                         <img 
                           src={URL.createObjectURL(signatureImg)} 
                           alt="Sig" 
                           className="w-full h-full object-contain pointer-events-none" 
                         />
                       </Rnd>
                   )}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <motion.div 
                      className="text-6xl mb-4"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      📄
                    </motion.div>
                    <p className="text-xl font-semibold" style={{ color: "#658C58" }}>Upload a PDF to start signing</p>
                </div>
             )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default SmartSign;