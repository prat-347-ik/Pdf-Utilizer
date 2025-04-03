import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ToolCard = ({ name, description, icon, path }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Link
        to={path}
        className="w-48 h-48 flex flex-col items-center justify-center bg-white text-black rounded-lg shadow-lg p-4 
        hover:shadow-2xl hover:ring-2 hover:ring-[#8F87F1] transition-transform duration-300 ease-in-out"
      >
        <div className="text-5xl text-[#8F87F1] mb-2">{icon}</div>
        <h3 className="text-lg font-semibold text-center">{name}</h3>
        <p className="text-gray-600 text-sm text-center">{description}</p>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
