import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">PDF Utilizer</h2>
      <ul>
        <li className="mb-2"><Link to="/" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link></li>
        <li className="mb-2"><Link to="/merge" className="block p-2 hover:bg-gray-700 rounded">Merge PDFs</Link></li>
        <li className="mb-2"><Link to="/split" className="block p-2 hover:bg-gray-700 rounded">Split PDF</Link></li>
        <li className="mb-2"><Link to="/extract-text" className="block p-2 hover:bg-gray-700 rounded">Extract Text</Link></li>
        <li className="mb-2"><Link to="/extract-images" className="block p-2 hover:bg-gray-700 rounded">Extract Images</Link></li>
        <li className="mb-2"><Link to="/sign" className="block p-2 hover:bg-gray-700 rounded">Sign PDF</Link></li>
        <li className="mb-2"><Link to="/protect" className="block p-2 hover:bg-gray-700 rounded">Protect PDF</Link></li>
        <li className="mb-2"><Link to="/rotate" className="block p-2 hover:bg-gray-700 rounded">Rotate PDF</Link></li>
        <li className="mb-2"><Link to="/text-to-speech" className="block p-2 hover:bg-gray-700 rounded">Text to Speech</Link></li>
        <li className="mb-2"><Link to="/speech-to-text" className="block p-2 hover:bg-gray-700 rounded">Speech to Text</Link></li>
        <li className="mb-2"><Link to="/translate" className="block p-2 hover:bg-gray-700 rounded">Translate PDF</Link></li>
        <li className="mb-2"><Link to="/login" className="block p-2 hover:bg-gray-700 rounded">Login</Link></li>
        <li className="mb-2"><Link to="/register" className="block p-2 hover:bg-gray-700 rounded">Register</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
