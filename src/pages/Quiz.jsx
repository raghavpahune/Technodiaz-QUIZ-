import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import OptionButton from '../components/OptionButton';
import TimerCountdown from '../components/TimerCountdown';
import HostControls from '../components/HostControls';

export default function Quiz() {
  const {
    currentQuestion,
    revealState,
    selectedOptionIdx,
    selectOption,
    timerSeconds,
    timerDuration,
    IS_PROJECTOR,
    returnToDatabase
  } = useQuiz();

  const [loadingPhase, setLoadingPhase] = useState(0); // 0: Init, 1: Loading, 2: Loaded

  useEffect(() => {
    // Cinematic load sequence
    setLoadingPhase(0);
    const t1 = setTimeout(() => setLoadingPhase(1), 500);
    const t2 = setTimeout(() => setLoadingPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentQuestion?.globalId]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-mono text-xl">
        ERROR: NO QUESTION SELECTED
        <button onClick={returnToDatabase} className="ml-4 border border-red-500 px-4 py-1">RETURN</button>
      </div>
    );
  }

  const isRevealed = revealState === 'REVEALED';
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-sans flex flex-col relative overflow-hidden pb-24">
      {/* Cinematic Load Overlay */}
      <AnimatePresence>
        {loadingPhase < 2 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono"
          >
             <div className="text-cyan-600 tracking-[0.2em] mb-4">// SYSTEM QUERY ACTIVE</div>
             <div className="text-cyan-400 text-xl tracking-widest uppercase mb-8">
               {loadingPhase === 0 ? 'INITIALIZING QUERY...' : 'QUESTION DATA RECEIVING...'}
             </div>
             {loadingPhase === 1 && (
               <div className="w-64 h-2 bg-cyan-900/50 rounded overflow-hidden">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.3, ease: 'linear' }}
                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                  />
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col p-6 md:p-12 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <div className="text-xs tracking-[0.2em] text-cyan-600 mb-1">// TECHNODIAZ SYSTEM V1.0</div>
            <div className="text-sm font-bold tracking-widest text-cyan-500/70 uppercase">
              {currentQuestion.category}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white uppercase mt-2">
              QUESTION {currentQuestion.globalId}
            </h2>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 font-bold tracking-widest text-sm text-center">
              <span className="text-[10px] text-cyan-600 block leading-tight">REWARD</span>
              {currentQuestion.points} PTS
            </div>
          </div>
        </header>

        {/* Main Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 mt-4">
          
          {/* Question Text */}
          <div className="flex-1 flex flex-col gap-8">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={loadingPhase === 2 ? { opacity: 1, x: 0 } : {}}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md"
            >
              "{currentQuestion.question}"
            </motion.h1>

            {/* Options / Riddle Input */}
            <div className="mt-auto">
               {currentQuestion.type === 'mcq' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((opt, idx) => (
                      <OptionButton
                        key={idx}
                        letter={letters[idx]}
                        text={opt}
                        isSelected={selectedOptionIdx === idx}
                        isCorrect={idx === currentQuestion.correctAnswer}
                        revealState={revealState}
                        onClick={() => selectOption(idx)}
                        disabled={!IS_PROJECTOR && selectedOptionIdx !== null && selectedOptionIdx !== idx && revealState !== 'REVEALED'} // Host can change mind? Prompt says lock selection. Actually, let's allow change until reveal. Wait, "Lock the option selection" at 0s. Let's just disable if revealed or timeout.
                      />
                    ))}
                 </div>
               ) : (
                 <div className="p-8 border-2 border-dashed border-cyan-900/50 bg-cyan-950/20 text-center rounded-xl">
                   <div className="text-cyan-600 tracking-widest text-sm mb-4">// RIDDLE PROTOCOL ACTIVE</div>
                   {isRevealed ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                      >
                        {currentQuestion.answer}
                      </motion.div>
                   ) : (
                      <div className="text-3xl text-cyan-900 font-mono tracking-widest">
                        [ ______________________ ]
                      </div>
                   )}
                 </div>
               )}
            </div>
          </div>

          {/* Sidebar: Timer & Explanation */}
          <div className="lg:w-80 flex flex-col gap-8">
             <div className="flex justify-center lg:justify-end">
               <TimerCountdown seconds={timerSeconds} total={timerDuration} />
             </div>

             {/* Verification / Decryption Animation */}
             <AnimatePresence>
               {revealState === 'REVEALED' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                     <div className="font-mono text-xs text-green-500 mb-4 flex flex-col gap-1">
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.2}}>{`> RESPONSE RECEIVED`}</motion.div>
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.5}}>{`> ANALYZING RESPONSE...`}</motion.div>
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.8}}>{`> VERIFYING DATABASE...`}</motion.div>
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 1.1}}>{`> DECRYPTION COMPLETE`}</motion.div>
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 1.4}} className="text-white font-bold">{`> ANSWER VALIDATED`}</motion.div>
                     </div>

                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: 2.0 }} // Wait for validation text
                       className="p-5 border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md rounded"
                     >
                       <div className="text-[10px] tracking-[0.2em] text-cyan-500 mb-2">// DATA LOG ENTRY: EXPLANATION</div>
                       <p className="text-sm md:text-base text-gray-200 leading-relaxed font-medium">
                         {currentQuestion.explanation}
                       </p>
                     </motion.div>
                  </motion.div>
               )}
             </AnimatePresence>
          </div>
          
        </div>
      </div>

      {/* Host Controls */}
      {!IS_PROJECTOR && <HostControls />}
    </div>
  );
}
