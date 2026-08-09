import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import OptionButton from './OptionButton';
import ProgressBar from './ProgressBar';

/**
 * QuestionCard — display-only question card.
 * Used by the projector view and legacy single-player mode.
 * Does NOT handle answer selection directly — that's done via quizmaster.
 * 
 * ponytail: kept for backward compat, but quiz page now uses QuizmasterPanel instead.
 */
export default function QuestionCard() {
  const ctx = useQuiz();
  const {
    activeRound,
    currentQuestionIndex,
    nextQuestion,
    shuffledDbs,
    isAnswerRevealed
  } = ctx;

  // ponytail: selectOption/selectedOption removed from live quiz flow, safe fallbacks
  const selectedOption = ctx.selectedOption ?? null;
  const selectOption = ctx.selectOption ?? (() => {});

  const round = roundConfig[activeRound];
  const questions = shuffledDbs[activeRound];
  const question = questions[currentQuestionIndex];
  const isAnswered = selectedOption !== null;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5 select-text">
      {/* Smooth Progress Bar */}
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
        color={round.palette}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-5 relative overflow-hidden"
        >
          {/* Background Ambient Aura */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 blur-3xl opacity-15 rounded-full ${
            round.palette === 'red' ? 'bg-red-500' :
            round.palette === 'teal' ? 'bg-teal-500' :
            round.palette === 'bronze' ? 'bg-amber-500' :
            round.palette === 'purple' ? 'bg-purple-500' :
            'bg-blue-500'
          }`} />

          {/* Heading Metadata */}
          <div className="flex justify-between items-center text-xs font-display tracking-widest text-gray-400 font-bold">
            <span className="uppercase text-yellow-500">{round.name}</span>
            <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
          </div>

          {/* Question Sentence */}
          <h2 className="text-lg md:text-xl font-bold font-sans text-gray-100 leading-snug text-left mt-1">
            {question.question}
          </h2>

          {/* Image Slot (Only loads if exists) */}
          {question.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full rounded-xl overflow-hidden max-h-48 md:max-h-60 flex justify-center bg-black/30 border border-white/5"
            >
              <img
                src={question.image}
                alt="Question visual clue"
                className="object-contain max-h-full"
                loading="lazy"
              />
            </motion.div>
          )}

          {/* Options Grid */}
          <div className="flex flex-col gap-3 mt-2">
            {question.options.map((option, idx) => (
              <OptionButton
                key={idx}
                letter={letters[idx]}
                text={option}
                isSelected={selectedOption === idx}
                isCorrect={idx === question.correctAnswer}
                showResult={isAnswered}
                revealCorrect={isAnswerRevealed}
                onClick={() => selectOption(idx)}
                disabled={isAnswered}
                neutral={!isAnswerRevealed}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer Verification & Explanation Card — only when answer is revealed */}
      <AnimatePresence>
        {isAnswerRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 130 }}
            className="glass-panel p-5 md:p-6 rounded-2xl border border-white/10 flex flex-col gap-4 text-left relative overflow-hidden"
          >
            {/* Result Accent Bar */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-500 shadow-[0_0_10px_#10b981]" />

            <div className="pl-3">
              <h3 className="font-display font-black text-xs md:text-sm tracking-wider uppercase text-yellow-500">
                ✨ Correct Answer
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mt-2 font-medium">
                {question.explanation}
              </p>

              <div className="flex justify-end mt-4">
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2.5 rounded-xl font-display font-extrabold text-sm tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.35)] pointer-events-auto flex items-center gap-2 group"
                >
                  <span>NEXT QUESTION</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
