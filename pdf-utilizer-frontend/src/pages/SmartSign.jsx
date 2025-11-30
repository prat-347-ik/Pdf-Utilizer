import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { signPDF } from "../api/apiService"; 
import ToolLayout from "../components/ToolLayout"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, PenTool, FileText, Image as ImageIcon, 
  CheckCircle, AlertCircle, Download, ChevronLeft, ChevronRight,
  Move, Maximize, Trash2, ZoomIn, ZoomOut
} from "lucide-react";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// ✅ FIX: Use CDN for worker to avoid deployment/build issues with Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SmartSign = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureImg, setSignatureImg] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [signAllPages, setSignAllPages] = useState(false);
  const [message, setMessage] = useState(null);
  const [scale, setScale] = useState(1);

  // Layout State
  const [containerWidth, setContainerWidth] = useState(null);
  const [pdfRenderedSize, setPdfRenderedSize] = useState({ width: 0, height: 0 }); 
  const [originalPdfSize, setOriginalPdfSize] = useState({ width: 0, height: 0 }); 

  // Signature State (Screen Coordinates relative to PDF container)
  const [sigPos, setSigPos] = useState({ x: 50, y: 50, width: 150, height: 80 });

  const containerRef = useRef(null);

  // ✅ FIX: Resize Observer to handle responsive PDF width
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setSignedPdfUrl(null);
      setMessage(null);
      setPageNumber(1);
      // Reset sizes to prevent stale data
      setPdfRenderedSize({ width: 0, height: 0 });
      setOriginalPdfSize({ width: 0, height: 0 });
    }
  };
  
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureImg(file);
      setMessage(null);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // ✅ FIX: Capture exact rendered dimensions for coordinate mapping
  const onPageLoadSuccess = (page) => {
    setOriginalPdfSize({ width: page.originalWidth, height: page.originalHeight });
    setPdfRenderedSize({ width: page.width, height: page.height });
  };

  const handleSign = async () => {
    if (!pdfFile || !signatureImg) {
      setMessage({ type: "error", text: "Please upload PDF and Signature first." });
      return;
    }

    // ✅ FIX: Safety check for dimensions to prevent division by zero (Infinity/NaN)
    if (pdfRenderedSize.width === 0 || pdfRenderedSize.height === 0 || originalPdfSize.width === 0) {
      setMessage({ type: "error", text: "PDF is still loading. Please wait a moment." });
      return;
    }

    setLoading(true);
    setMessage(null);

    // ✅ FIX: Accurate Coordinate Mapping
    // 1. Calculate ratio between Original PDF size and Rendered Screen size
    const ratioX = originalPdfSize.width / pdfRenderedSize.width;
    const ratioY = originalPdfSize.height / pdfRenderedSize.height;

    // 2. Map screen coordinates to PDF coordinates
    // We explicitly cast to integers as most backend PDF libraries expect points
    const finalX = Math.round(sigPos.x * ratioX);
    // PDF coordinate systems often start from bottom-left, but python libraries usually handle top-left.
    // Assuming backend handles top-left logic. If y is inverted in result, use (originalHeight - finalY - finalH).
    const finalY = Math.round(sigPos.y * ratioY); 
    const finalW = Math.round(sigPos.width * ratioX);
    const finalH = Math.round(sigPos.height * ratioY);

    // ✅ FIX: Verify calculations are finite numbers
    if (!Number.isFinite(finalX) || !Number.isFinite(finalY) || !Number.isFinite(finalW) || !Number.isFinite(finalH)) {
      setLoading(false);
      setMessage({ type: "error", text: "Calculation error. Please adjust signature position." });
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("signature", signatureImg);
    formData.append("page", pageNumber);
    formData.append("x", finalX);
    formData.append("y", finalY);
    formData.append("width", finalW);
    formData.append("height", finalH);
    // Explicitly convert boolean to string to avoid backend ambiguity
    formData.append("all_pages", signAllPages ? "true" : "false"); 

    try {
      const response = await signPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setSignedPdfUrl(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "Signed successfully!" });
    } catch (error) {
      console.error("Signing failed", error);
      setMessage({ type: "error", text: "Error signing PDF. Please try again." });
    }
    setLoading(false);
  };

  // Helper to determine if signing is allowed
  const isReadyToSign = !loading && signatureImg && pdfFile && pdfRenderedSize.width > 0;

  return (
    <ToolLayout
      title="Smart Sign"
      description="Interactive PDF signing. Drag, drop, and resize your signature directly on the document."
      theme="blue"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Controls */}
        <motion.div 
          className="w-full lg:w-1/3 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* 1. Upload Section */}
          <div className="bg-white/60 dark:bg-indigo-900/20 backdrop-blur-md p-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
            <h3 className="text-indigo-900 dark:text-indigo-200 font-bold mb-4 flex items-center gap-2">
              <UploadCloud size={20}/> Upload Assets
            </h3>
            
            <div className="space-y-4">
              {/* PDF Upload */}
              <div className="relative group">
                <input type="file" accept="application/pdf" onChange={handlePdfChange} id="pdf-upload" className="hidden" />
                <label
                  htmlFor="pdf-upload"
                  className={`flex items-center justify-between p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    pdfFile 
                      ? "border-green-500/50 bg-green-500/10" 
                      : "border-indigo-300 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${pdfFile ? "bg-green-500/20 text-green-600" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600"}`}>
                      <FileText size={20} />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                        {pdfFile ? pdfFile.name : "Select PDF"}
                      </p>
                      {!pdfFile && <p className="text-xs text-gray-500">Click to browse</p>}
                    </div>
                  </div>
                  {pdfFile && <CheckCircle size={18} className="text-green-500" />}
                </label>
              </div>

              {/* Signature Upload */}
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleSignatureChange} id="sig-upload" className="hidden" />
                <label
                  htmlFor="sig-upload"
                  className={`flex items-center justify-between p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    signatureImg 
                      ? "border-cyan-500/50 bg-cyan-500/10" 
                      : "border-indigo-300 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${signatureImg ? "bg-cyan-500/20 text-cyan-600" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600"}`}>
                      <ImageIcon size={20} />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                        {signatureImg ? signatureImg.name : "Upload Signature"}
                      </p>
                      {!signatureImg && <p className="text-xs text-gray-500">PNG/JPG (Transparent)</p>}
                    </div>
                  </div>
                  {signatureImg && <CheckCircle size={18} className="text-cyan-500" />}
                </label>
              </div>
            </div>
          </div>

          {/* 2. Page Controls */}
          {numPages && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white/60 dark:bg-indigo-900/20 backdrop-blur-md p-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Page Navigation</span>
                <span className="text-xs font-mono bg-indigo-100 dark:bg-black/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                  {pageNumber} / {numPages}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  disabled={pageNumber <= 1} 
                  onClick={() => setPageNumber(p => p - 1)} 
                  className="flex-1 p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition flex justify-center"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  disabled={pageNumber >= numPages} 
                  onClick={() => setPageNumber(p => p + 1)} 
                  className="flex-1 p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition flex justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-white/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${signAllPages ? "bg-indigo-600 border-indigo-600" : "border-gray-400"}`}>
                    {signAllPages && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={signAllPages} 
                    onChange={(e) => setSignAllPages(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-500 transition">
                    Apply signature to ALL pages?
                  </span>
                </label>
              </div>
            </motion.div>
          )}

          {/* 3. Action Buttons */}
          <div className="mt-auto space-y-3">
            {message && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                message.type === "error" ? "bg-red-500/20 text-red-700 dark:text-red-300" : "bg-green-500/20 text-green-700 dark:text-green-300"
              }`}>
                {message.type === "error" ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                {message.text}
              </div>
            )}

            <button 
              onClick={handleSign} 
              disabled={!isReadyToSign}
              className="w-full py-3 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : <><PenTool size={18} /> Sign Document</>}
            </button>

            {signedPdfUrl && (
              <motion.a 
                href={signedPdfUrl} 
                download="signed_document.pdf" 
                className="block text-center py-3 rounded-xl font-bold text-indigo-700 dark:text-indigo-200 border-2 border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Download size={18} /> Download Signed PDF
              </motion.a>
            )}
          </div>
        </motion.div>

        {/* RIGHT PANEL: The Canvas */}
        <motion.div 
          className="flex-1 bg-gray-200 dark:bg-black/40 rounded-2xl shadow-inner border border-gray-300 dark:border-white/10 overflow-auto relative flex justify-center p-8 custom-scrollbar"
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {pdfFile ? (
            // ✅ FIX: Main PDF Container relative to width of parent
            <div 
              className="relative shadow-2xl transition-all duration-300 select-none" 
              style={{ width: containerWidth ? containerWidth - 64 : 'auto' }} // Responsive width
            >
              {/* 1. The PDF Layer (Using react-pdf) */}
              <Document 
                file={pdfFile} 
                onLoadSuccess={onDocumentLoadSuccess}
                className="border border-gray-300 dark:border-gray-700"
                loading={<div className="p-10 text-center text-gray-500">Loading PDF...</div>}
                error={<div className="p-10 text-center text-red-500">Failed to load PDF</div>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={containerWidth ? containerWidth - 64 : 600} // Responsive width
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* 2. The Drag & Drop Layer (Using Rnd) */}
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
                  className="group border-2 border-dashed border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 cursor-move"
                >
                  <img 
                    src={URL.createObjectURL(signatureImg)} 
                    alt="Sig" 
                    className="w-full h-full object-contain pointer-events-none select-none" 
                  />
                  {/* Resize Handle Hints */}
                  <div className="absolute top-0 left-0 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                  
                  {/* Drag Handle Hint */}
                  <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition flex gap-1 items-center whitespace-nowrap">
                    <Move size={10} /> Drag
                  </div>
                </Rnd>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 h-full">
              <motion.div 
                className="text-6xl mb-4 opacity-50"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                📄
              </motion.div>
              <p className="text-xl font-semibold text-indigo-400">Upload a PDF to start signing</p>
              <p className="text-sm text-gray-500 mt-2">Your document will appear here</p>
            </div>
          )}
        </motion.div>

      </div>
    </ToolLayout>
  );
};

export default SmartSign;