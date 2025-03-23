import { useState } from "react";

const UploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    console.log("Uploading file:", file);
    onClose(); // Close the modal after upload
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
        <input type="file" onChange={handleFileChange} className="mb-4 w-full p-2 border" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">Upload</button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
