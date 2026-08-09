import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';

export default function Landing() {
  const { startQuiz, IS_PROJECTOR } = useQuiz();
  const [bootText, setBootText] = useState([]);
  
  const bootSequence = [
    "> INITIALIZING SYSTEM...",
    "> LOADING QUESTION DATABASE...",
    "> ESTABLISHING QUIZ CONNECTION...",
    "> SYSTEM ONLINE",
    "> QUIZ ARENA READY"
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setBootText(prev => [...prev, bootSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 400); // Fast cinematic typing
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-cyan-500 font-mono">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <main className="z-10 w-full max-w-4xl p-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="text-xs tracking-[0.3em] text-cyan-500/70 mb-4">// TECHNODIAZ SYSTEM V1.0</div>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] uppercase mb-2">
            TECHNODIAZ
          </h1>
          <h2 className="text-2xl md:text-4xl text-white font-bold tracking-widest uppercase shadow-cyan-500/50">
            QUIZ COMPETITION
          </h2>
          <div className="mt-6 text-sm md:text-base text-gray-400 uppercase tracking-widest leading-relaxed">
            Department of Computer Science & Engineering <br/>
            Priyadarshini Bhagwati College of Engineering, Nagpur
          </div>
        </motion.div>

        {/* Boot Sequence Terminal */}
        <div className="w-full max-w-lg bg-black/60 border border-cyan-900/50 rounded p-6 text-left font-mono text-sm h-48 flex flex-col justify-end overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.1)] mb-12 relative backdrop-blur-sm">
           <div className="absolute top-2 left-2 flex gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
             <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
             <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
           </div>
           <div className="flex flex-col gap-2 mt-4 text-cyan-400">
             {bootText.map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {text}
                </motion.div>
             ))}
             {bootText.length === bootSequence.length && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: [0, 1, 0] }} 
                 transition={{ repeat: Infinity, duration: 0.8 }}
                 className="w-3 h-4 bg-cyan-400 mt-1" 
               />
             )}
           </div>
        </div>

        {bootText.length === bootSequence.length && !IS_PROJECTOR && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgb(0,255,255)" }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz}
            className="group relative px-8 py-4 bg-cyan-950/40 border border-cyan-500 text-cyan-400 uppercase tracking-[0.2em] font-bold overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">
              ENTER QUIZ ARENA 
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </motion.button>
        )}

        {/* Info tags */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-xs text-cyan-600/70 tracking-[0.2em]">
          <span>QUIZ ARENA</span>
          <span>•</span>
          <span>MULTIPLE CATEGORIES</span>
          <span>•</span>
          <span>30 SEC / QUESTION</span>
          <span>•</span>
          <span>10 PTS</span>
          <span>•</span>
          <span className="text-cyan-400">SYSTEM ONLINE</span>
        </div>
      </main>
    </div>
  );
}
