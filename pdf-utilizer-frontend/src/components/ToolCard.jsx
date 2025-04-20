import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ToolCard = ({ name, description, icon, path, index }) => {
  const rotation = index % 2 === 0 ? 1.5 : -1.5;

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: rotation }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Link
        to={path}
        className="w-48 h-48 flex flex-col items-center justify-center bg-white dark:bg-[#1f1f1f] text-black dark:text-white rounded-lg shadow-lg p-4 
        hover:shadow-2xl hover:ring-2 hover:ring-[#8F87F1] transition-transform duration-300 ease-in-out"
      >
        <div className="text-5xl text-[#8F87F1] mb-2">{icon}</div>
        <h3 className="text-lg font-semibold text-center">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm text-center">{description}</p>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
