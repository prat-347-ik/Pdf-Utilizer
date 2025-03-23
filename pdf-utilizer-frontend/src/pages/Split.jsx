import { useState } from "react";

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [pageNumbers, setPageNumbers] = useState("");
  const [splitFile, setSplitFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSplit = async () => {
    if (!file || !pageNumbers.trim()) {
      alert("Please select a PDF file and enter page numbers.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", JSON.stringify(pageNumbers.split(",").map(num => parseInt(num.trim()))));

    try {
      const response = await fetch("http://localhost:5713/pdf/split", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to split PDF");
      const blob = await response.blob();
      setSplitFile(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert("Error splitting PDF");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-[#FED2E2] shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#8F87F1]">Split PDF</h2>
      <div className="mb-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#C68EFD] file:text-white hover:file:bg-[#E9A5F1] cursor-pointer"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter page numbers (e.g., 1,3,5)"
          value={pageNumbers}
          onChange={(e) => setPageNumbers(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <button
        className="w-full bg-[#C68EFD] text-white py-2 px-4 rounded-md hover:bg-[#8F87F1] transition disabled:bg-gray-400"
        onClick={handleSplit}
        disabled={loading}
      >
        {loading ? "Splitting..." : "Split PDF"}
      </button>
      {splitFile && (
        <div className="mt-4 p-3 bg-green-100 rounded text-center">
          <p className="text-green-700 font-semibold">Split PDF is ready:</p>
          <button
            onClick={() => window.open(splitFile, "_blank")}
            className="mt-2 bg-[#C68EFD] text-white py-2 px-4 rounded-md hover:bg-[#8F87F1] transition"
          >
            Download Split PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default SplitPDF;
