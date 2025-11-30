import React, { useState } from 'react';
import { Upload, Send, FileText, Loader2, Bot, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ModernSidebar from '../components/ModernSidebar';
import ModernHeader from '../components/ModernHeader';

const ChatWithPdf = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/chat/init', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setMessages([{ role: 'system', text: `Ready to chat with ${selectedFile.name}!` }]);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  // Handle Sending Message
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question: userMsg.text }),
      });
      const data = await response.json();
      
      const botMsg = { 
        role: 'bot', 
        text: data.answer || "I couldn't find an answer.", 
        context: data.context 
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', text: "Error fetching answer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* 1. Sidebar (Fixed) */}
      <ModernSidebar />

      {/* 2. Main Content Wrapper */}
      {/* ✅ ADDED pl-20 (80px) to prevent sidebar overlap */}
      <div className="flex-1 flex flex-col min-w-0 pl-20 relative h-screen">
        
        {/* Dynamic Header */}
        <ModernHeader title="Chat with PDF" />

        {/* 3. Tool Workspace */}
        {/* Height calculation ensures it fills exactly the remaining space */}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden h-full">
          
          {/* Left Panel: File Manager */}
          <div className="w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 flex flex-col border border-gray-100 dark:border-white/10 shrink-0">
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back
            </button>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                  <Bot size={40} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">AI Assistant</h2>
                <p className="text-sm text-gray-500 text-center mb-8 px-4">
                    Upload a PDF to unlock intelligent Q&A capabilities.
                </p>
                
                <label className="w-full relative group">
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                    <div className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl cursor-pointer flex items-center justify-center gap-3 shadow-lg group-hover:scale-[1.02] transition-all">
                        {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                        <span className="font-semibold">{uploading ? "Analyzing..." : "Upload PDF"}</span>
                    </div>
                </label>
                
                {file && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-sm w-full flex items-center gap-3 border border-green-200 dark:border-green-800">
                        <FileText size={18} />
                        <span className="truncate">{file.name}</span>
                    </div>
                )}
            </div>
          </div>

          {/* Right Panel: Chat Interface */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col overflow-hidden border border-gray-100 dark:border-white/10 relative">
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-60">
                        <Bot size={80} className="mb-6" />
                        <p className="text-lg">No messages yet. Ask me anything about your document!</p>
                    </div>
                )}
                
                {messages.map((msg, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm
                            ${msg.role === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        
                        <div className={`p-5 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user' 
                                ? 'bg-purple-600 text-white rounded-tr-none' 
                                : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none'}`}>
                            
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    strong: ({node, ...props}) => <span className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>

                        </div>
                    </motion.div>
                ))}
                
                {loading && (
                    <div className="flex gap-4">
                         <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Bot size={20} className="text-indigo-600" />
                         </div>
                         <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <span className="text-gray-500 text-sm">Thinking</span>
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            </span>
                         </div>
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-4 max-w-4xl mx-auto">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!sessionId || loading}
                        placeholder={sessionId ? "Ask a question about your PDF..." : "Please upload a PDF first"}
                        className="flex-1 bg-white dark:bg-gray-800 border-none outline-none rounded-2xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!sessionId || loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center aspect-square"
                    >
                        <Send size={24} />
                    </button>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatWithPdf;