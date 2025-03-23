import { useState } from "react";

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [mergedFile, setMergedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least two PDF files.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("http://localhost:5000/pdf/merge", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to merge PDFs");
      const blob = await response.blob();
      setMergedFile(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert("Error merging PDFs");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-[#FED2E2] shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#8F87F1]">Merge PDFs</h2>
      <div className="mb-4">
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#C68EFD] file:text-white hover:file:bg-[#E9A5F1] cursor-pointer"
        />
      </div>
      {files.length > 0 && (
        <div className="mb-4 p-3 bg-[#E9A5F1] rounded">
          <h3 className="text-lg font-semibold text-[#8F87F1]">Selected Files:</h3>
          <ul className="list-disc pl-5 text-gray-800">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="w-full bg-[#C68EFD] text-white py-2 px-4 rounded-md hover:bg-[#8F87F1] transition disabled:bg-gray-400"
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
            className="mt-2 bg-[#C68EFD] text-white py-2 px-4 rounded-md hover:bg-[#8F87F1] transition"
          >
            Download Merged PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default MergePDF;
