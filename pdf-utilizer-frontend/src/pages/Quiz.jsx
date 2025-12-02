import { useState, useEffect } from "react";
import { generateQuiz } from "../api/apiService.jsx"; 
import ToolLayout from "../components/ToolLayout.jsx";
import QuizGame from "../components/QuizGame.jsx"; // Import the Game Engine
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, UploadCloud, AlertCircle, 
  BrainCircuit, Sparkles, BookOpen, X 
} from "lucide-react";

// Animation stages
const steps = [
  "Reading document structure...",
  "Extracting key concepts...",
  "Generating questions...",
  "Drafting explanations...",
  "Finalizing quiz data..."
];

const PdfToQuiz = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // New State: Holds the JSON data for the game
  const [quizData, setQuizData] = useState(null);
  
  const [stepIndex, setStepIndex] = useState(0);

  // --- NEW: Drag & Drop Logic ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setMessage(null);
        setQuizData(null);
        setStepIndex(0);
      } else {
        setMessage({ type: "error", text: "Please upload a valid PDF file." });
      }
    }
  };
  // -----------------------------

  // Cycle "Thinking" steps
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setQuizData(null);
      setStepIndex(0);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF first." });
      return;
    }

    setLoading(true);
    setMessage(null);
    setQuizData(null);
    setStepIndex(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Expecting JSON response: { success: true, quiz: [...] }
      const response = await generateQuiz(formData);
      
      if (response.data && response.data.quiz) {
        setQuizData(response.data.quiz);
        setMessage(null);
      } else {
        throw new Error("Invalid server response");
      }
      
    } catch (error) {
      console.error("Quiz generation error:", error);
      setMessage({ type: "error", text: "Failed to generate quiz. Try a clearer PDF." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Interactive Study Quiz"
      description="Turn your notes into an active learning game. Upload a PDF, and our AI will challenge you with questions and explanations."
      theme="purple"
    >
      {/* LAYOUT LOGIC:
         1. If we have 'quizData', we render the GAME view (Full Width).
         2. If not, we render the UPLOAD view (Split Panel).
      */}

      <AnimatePresence mode="wait">
        
        {/* --- GAME MODE --- */}
        {quizData ? (
          <motion.div 
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex justify-center h-full items-start pt-10"
          >
            <QuizGame 
              questions={quizData} 
              onExit={() => {
                setQuizData(null);
                setFile(null);
              }} 
            />
          </motion.div>
        ) : (
          
          /* --- UPLOAD MODE --- */
          <motion.div 
            key="upload"
            className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            
            {/* LEFT PANEL: Upload Controls */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className="bg-white/60 dark:bg-purple-900/20 backdrop-blur-md p-6 rounded-3xl border border-purple-200 dark:border-purple-500/30 shadow-sm">
                <h3 className="text-purple-900 dark:text-purple-200 font-bold mb-4 flex items-center gap-2">
                  <UploadCloud size={20}/> Upload Material
                </h3>

                {!file ? (
                  <div className="relative group">
                    <input type="file" accept="application/pdf" onChange={handleFileChange} id="quiz-upload" className="hidden" />
                    <label
                      htmlFor="quiz-upload"
                      // --- ADDED DRAG & DROP HANDLERS ---
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      // ----------------------------------
                      className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-purple-400/50 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer"
                    >
                      <div className="p-3 rounded-full bg-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-purple-800 dark:text-purple-200 font-medium">Select Study PDF</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400/60 mt-1">Notes, Chapters, Papers</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                        <FileText className="text-purple-700 dark:text-purple-300" size={24} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-gray-900 dark:text-white font-bold truncate text-sm">{file.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ready</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="p-1 text-gray-400 hover:text-red-500">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
                  message.type === "error" 
                    ? "bg-red-50 text-red-600 border border-red-200" 
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}>
                  <AlertCircle size={18}/>
                  {message.text}
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={handleGenerate} 
                disabled={loading || !file}
                className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
              >
                {loading ? "Initializing AI..." : <><Sparkles size={20} /> Start Quiz Game</>}
              </button>
            </div>

            {/* RIGHT PANEL: Hero / Loading Animation */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 relative p-8">
              
              {!loading ? (
                <div className="text-center text-gray-400 dark:text-white/20">
                  <div className="w-32 h-32 border-4 border-dashed border-gray-200 dark:border-white/10 rounded-full mx-auto flex items-center justify-center mb-4">
                    <BrainCircuit size={48} className="opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Ready to play?</p>
                  <p className="text-sm">Upload a document to challenge yourself.</p>
                </div>
              ) : (
                <div className="text-center w-full max-w-sm z-10">
                   <div className="relative w-24 h-24 mx-auto mb-8">
                      <div className="absolute inset-0 border-4 border-purple-100 dark:border-purple-900 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                      <BrainCircuit className="absolute inset-0 m-auto text-purple-600 w-8 h-8 animate-pulse" />
                   </div>
                   
                   <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Analyzing Content</h3>
                   
                   <div className="h-8 relative overflow-hidden">
                     <AnimatePresence mode='wait'>
                        <motion.p
                          key={stepIndex}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="text-purple-600 dark:text-purple-300 font-medium absolute w-full"
                        >
                          {steps[stepIndex]}
                        </motion.p>
                     </AnimatePresence>
                   </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </ToolLayout>
  );
};

export default PdfToQuiz;