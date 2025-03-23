import { useState } from "react";
import UploadModal from "./UploadModal";

const FileUploader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} className="p-2 bg-green-500 text-white rounded">
        Upload PDF
      </button>
      
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FileUploader;
