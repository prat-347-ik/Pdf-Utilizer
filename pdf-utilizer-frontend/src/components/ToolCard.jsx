import { Link } from "react-router-dom";

const ToolCard = ({ name, description, icon, path }) => {
  return (
    <Link
      to={path}
      className="w-48 h-48 flex flex-col items-center justify-center bg-white text-black rounded-lg shadow-lg p-4 hover:shadow-xl transition"
    >
      <div className="text-5xl text-[#8F87F1] mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-center">{name}</h3>
      <p className="text-gray-600 text-sm text-center">{description}</p>
    </Link>
  );
};

export default ToolCard;
