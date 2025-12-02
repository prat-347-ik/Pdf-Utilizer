import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Award, Lightbulb } from 'lucide-react';

export default function QuizGame({ questions, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Safely get current question
  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option) => {
    if (selectedOption) return; // Prevent changing answer

    setSelectedOption(option);
    
    // Check if correct (assuming format "A) Text" - we compare full string or generic)
    const isCorrect = option === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setGameFinished(true);
    }
  };

  // --- RESULT SCREEN ---
  if (gameFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Keep studying!";
    if (percentage >= 80) message = "Excellent Work!";
    else if (percentage >= 60) message = "Good Job!";

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center"
      >
        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{message}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">You scored {score} out of {questions.length}</p>

        {/* Score Bar */}
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${percentage >= 60 ? 'bg-green-500' : 'bg-orange-500'}`}
          />
        </div>

        <button 
          onClick={onExit}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 mx-auto transition-all"
        >
          <RotateCcw size={20} /> Generate Another Quiz
        </button>
      </motion.div>
    );
  }

  // --- GAMEPLAY SCREEN ---
  return (
    <div className="w-full max-w-3xl">
      
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="h-full bg-indigo-500"
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              // Determine visual state of this option
              let statusClass = "border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20";
              let icon = null;

              if (selectedOption) {
                if (option === currentQuestion.correctAnswer) {
                  statusClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                  icon = <CheckCircle size={20} />;
                } else if (option === selectedOption) {
                  statusClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                  icon = <XCircle size={20} />;
                } else {
                  statusClass = "opacity-50 cursor-not-allowed border-gray-200";
                }
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={!!selectedOption}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex items-center justify-between ${statusClass}`}
                  whileTap={!selectedOption ? { scale: 0.98 } : {}}
                >
                  <span>{option}</span>
                  {icon}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation & Next Button Area */}
      <div className="mt-8 min-h-[120px]">
        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-1">
              <Lightbulb size={18} /> Explanation
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {currentQuestion.explanation}
            </p>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}