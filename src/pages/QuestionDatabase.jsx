import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';

export default function QuestionDatabase() {
  const { allQuestions, questionStatus, selectQuestion, IS_PROJECTOR } = useQuiz();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'MOVIES, WEB SERIES & ANIME', 'GENERAL KNOWLEDGE', 'HISTORY & MONUMENTS', 'TECH TRIVIA', 'RIDDLES'];

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchCategory = filter === 'ALL' || q.category === filter;
      const matchSearch = q.question.toLowerCase().includes(search.toLowerCase()) || q.globalId.toString().includes(search);
      return matchCategory && matchSearch;
    });
  }, [allQuestions, filter, search]);

  if (IS_PROJECTOR) return null;

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-sans p-6 md:p-12 relative overflow-hidden">
       {/* Ambient grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

       <div className="relative z-10 max-w-6xl mx-auto flex flex-col h-[90vh]">
         {/* Header */}
         <header className="flex justify-between items-end mb-8 border-b border-cyan-900/50 pb-4">
            <div>
              <div className="text-xs tracking-[0.2em] text-cyan-600 mb-1">// SYSTEM QUERY ACTIVE</div>
              <h1 className="text-3xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                QUESTION DATABASE
              </h1>
            </div>
            <div className="text-right text-sm font-mono text-cyan-500/80">
              HOST CONTROLS<br/>
              TOTAL: {allQuestions.length}
            </div>
         </header>

         {/* Controls */}
         <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 whitespace-nowrap text-xs font-bold tracking-wider uppercase border transition-colors ${filter === cat ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-transparent border-cyan-900/50 text-cyan-700 hover:border-cyan-500/50 hover:text-cyan-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="w-full md:w-64">
               <input 
                 type="text" 
                 placeholder="SEARCH..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-black border border-cyan-900/50 px-4 py-2 text-sm text-cyan-400 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 transition-colors"
               />
            </div>
         </div>

         {/* Grid */}
         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {filteredQuestions.map(q => {
               const status = questionStatus[q.globalId];
               const isCompleted = status === 'COMPLETED';
               return (
                 <motion.button
                   key={q.globalId}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => selectQuestion(q.globalId)}
                   className={`relative p-4 border flex flex-col justify-between h-32 text-left transition-all ${
                     isCompleted 
                     ? 'border-green-900/50 bg-green-900/10 hover:border-green-500/50' 
                     : 'border-cyan-900/50 bg-cyan-950/20 hover:border-cyan-400/80 hover:bg-cyan-900/40 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                   }`}
                 >
                   <div className="flex justify-between items-start">
                     <span className="text-xs font-mono opacity-60">#{q.globalId}</span>
                     <span className={`text-[10px] tracking-widest ${isCompleted ? 'text-green-500' : 'text-cyan-600'}`}>
                       {status}
                     </span>
                   </div>
                   
                   <div>
                     <div className={`text-[10px] font-bold tracking-widest truncate mt-2 ${isCompleted ? 'text-green-600/70' : 'text-cyan-500/70'}`}>
                       {q.category.split(',')[0]}
                     </div>
                     <div className={`text-sm font-bold mt-1 line-clamp-2 ${isCompleted ? 'text-green-400/80' : 'text-white'}`}>
                       {q.type === 'riddle' ? '[ RIDDLE ]' : q.points + ' PTS'}
                     </div>
                   </div>
                 </motion.button>
               );
             })}
           </div>
         </div>
       </div>
    </div>
  );
}
