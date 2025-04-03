import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF1E6] flex flex-col items-center justify-center text-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-6xl font-bold text-[#89AC46]"
      >
        Welcome to PDF Utilizer
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-4 text-lg text-[#FF8989] max-w-2xl"
      >
        The ultimate tool for merging, splitting, extracting, and securing your PDFs with ease.
      </motion.p>

      <motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 1, duration: 1 }}
  className="mt-6 flex gap-4"
>
  <Link to="/login">
    <button className="bg-[#D3E671] text-black px-6 py-3 text-lg rounded-lg shadow-md hover:bg-[#89AC46] transition">
      Login
    </button>
  </Link>

  <Link to="/register">
    <button className="bg-[#F8ED8C] text-black px-6 py-3 text-lg rounded-lg shadow-md hover:bg-[#FF8989] transition">
      Register
    </button>
  </Link>
</motion.div>

    </div>
  );
};

export default LandingPage;
