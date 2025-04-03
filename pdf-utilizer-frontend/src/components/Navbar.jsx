import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">PDF Utilizer</h1>
      <div className="flex gap-4">
        <Link to="/login" className="text-gray-600 hover:text-blue-500">
          Change Account
        </Link>
        
      </div>
    </nav>
  );
}

export default Navbar;
