import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SignPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50, width: 100, height: 50 });
  const canvasRef = useRef(null);

  const handleFileChange = (event) => setPdfFile(event.target.files[0]);
  const handleSignatureChange = (event) => setSignature(event.target.files[0]);

  const handleUpload = async () => {
    if (!pdfFile || !signature) {
      alert("Please upload both PDF and signature.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("signature", signature);
    formData.append("page", 1);
    formData.append("x", position.x);
    formData.append("y", position.y);
    formData.append("width", position.width);
    formData.append("height", position.height);

    try {
      const response = await fetch("http://localhost:5000/pdf/sign", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to sign PDF");
      alert("PDF signed successfully!");
    } catch (error) {
      console.error(error);
      alert("Error signing PDF");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-[#FED2E2] shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#8F87F1]">Sign PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 w-full" />
      <input type="file" accept="image/*" onChange={handleSignatureChange} className="mb-4 w-full" />
      <button
        className="w-full bg-[#C68EFD] text-white py-2 px-4 rounded-md hover:bg-[#8F87F1] transition"
        onClick={handleUpload}
      >
        Upload & Sign PDF
      </button>
      <div className="mt-4 relative">
        {pdfFile && (
          <Document file={URL.createObjectURL(pdfFile)}>
            <Page pageNumber={1} canvasRef={canvasRef} />
          </Document>
        )}
        {signature && (
          <Draggable
            defaultPosition={{ x: position.x, y: position.y }}
            onStop={(e, data) => setPosition({ ...position, x: data.x, y: data.y })}
          >
            <Resizable
              size={{ width: position.width, height: position.height }}
              minWidth={50}
              minHeight={30}
              maxWidth={200}
              maxHeight={100}
              onResizeStop={(e, direction, ref, d) =>
                setPosition({
                  ...position,
                  width: position.width + d.width,
                  height: position.height + d.height,
                })
              }
            >
              <img src={URL.createObjectURL(signature)} alt="Signature" className="border border-gray-500" />
            </Resizable>
          </Draggable>
        )}
      </div>
    </div>
  );
};

export default SignPDF;
