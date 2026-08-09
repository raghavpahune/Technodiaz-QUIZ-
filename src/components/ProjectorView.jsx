import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import OptionButton from './OptionButton';
import TimerDisplay from './TimerDisplay';

/**
 * ProjectorView — audience-facing full-screen display.
 * 
 * CRITICAL: correctAnswer and explanation are NEVER rendered
 * unless quizPhase === 'ANSWER_REVEALED'.
 */
export default function ProjectorView() {
  const {
    activeRound, currentQuestionIndex, shuffledDbs,
    teams, quizPhase, currentQuestion, isAnswerRevealed,
    buzzerQueue, currentBuzzerIdx, currentTeamIdx, incorrectTeams,
    timerSeconds, timerDuration, activePage,
    connectedTeams
  } = useQuiz();

  const letters = ['A', 'B', 'C', 'D'];

  // If not in quiz mode, show a waiting screen
  if (activePage !== 'quiz' || !activeRound || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030008]">
        <div className="text-center">
          <h1 className="font-display font-black text-4xl text-white uppercase tracking-wider">
            COLLEGE QUIZ <span className="text-yellow-500 block mt-2">COMPETITION</span>
          </h1>
          <p className="text-gray-500 font-sans text-sm mt-4 tracking-wider uppercase">
            Waiting for quizmaster to start...
          </p>
        </div>
      </div>
    );
  }

  const round = roundConfig[activeRound];
  const questions = shuffledDbs[activeRound];
  const question = currentQuestion;
  const currentTeam = currentTeamIdx !== null ? teams[currentTeamIdx] : null;

  // ponytail: gate — only access correctAnswer when revealed
  const revealedCorrectIdx = isAnswerRevealed ? question.correctAnswer : -1;
  const revealedExplanation = isAnswerRevealed ? question.explanation : null;

  return (
    <div className="min-h-screen bg-[#030008] flex flex-col p-6 md:p-10 gap-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className={`absolute -top-20 -right-20 w-80 h-80 blur-3xl opacity-10 rounded-full ${
        round.palette === 'red' ? 'bg-red-500' :
        round.palette === 'teal' ? 'bg-teal-500' :
        round.palette === 'bronze' ? 'bg-amber-500' :
        round.palette === 'purple' ? 'bg-purple-500' :
        'bg-blue-500'
      }`} />

      {/* Header: Round + Timer + Question number */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-display font-bold text-xs tracking-widest text-gray-500 uppercase">{round.icon} {round.name}</span>
          <span className="font-display font-bold text-xs tracking-widest text-gray-600 uppercase ml-4">
            QUESTION {currentQuestionIndex + 1} OF {questions.length}
          </span>
        </div>
        <TimerDisplay seconds={timerSeconds} total={timerDuration} size="md" />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Question + Options */}
        <div className="flex-1 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* Question */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-sans text-white leading-snug">
                {question.question}
              </h2>

              {question.image && (
                <div className="w-full rounded-2xl overflow-hidden max-h-60 flex justify-center bg-black/30 border border-white/5">
                  <img src={question.image} alt="Question visual" className="object-contain max-h-full" loading="lazy" />
                </div>
              )}

              {/* Options — NEVER highlight correct unless ANSWER_REVEALED */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, idx) => (
                  <OptionButton
                    key={idx}
                    letter={letters[idx]}
                    text={option}
                    isCorrect={idx === revealedCorrectIdx}
                    revealCorrect={isAnswerRevealed}
                    showResult={isAnswerRevealed}
                    disabled={true}
                    neutral={!isAnswerRevealed}
                  />
                ))}
              </div>

              {/* Revealed answer + explanation — ONLY in ANSWER_REVEALED */}
              <AnimatePresence>
                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="glass-panel p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <div className="pl-4">
                      <h3 className="font-display font-black text-sm tracking-wider uppercase text-emerald-400">
                        ✓ Correct Answer: {letters[question.correctAnswer]}) {question.options[question.correctAnswer]}
                      </h3>
                      <p className="text-base text-gray-300 leading-relaxed mt-3 font-medium font-sans">
                        {revealedExplanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right sidebar: Team status + Scoreboard */}
        <div className="lg:w-72 flex flex-col gap-4">
          {/* Current phase status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={quizPhase + (currentTeamIdx ?? '')}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-5 rounded-2xl text-center"
            >
              {quizPhase === 'QUESTION_ACTIVE' && (
                <div>
                  <span className="font-display font-bold text-xs tracking-wider text-yellow-500 uppercase animate-pulse">
                    ⏳ Waiting for Buzz
                  </span>
                </div>
              )}

              {quizPhase === 'TEAM_ANSWERING' && currentTeam && (
                <div>
                  <span className="font-display font-bold text-[10px] tracking-wider text-gray-500 uppercase">Current Team</span>
                  <span className="block font-display font-black text-2xl text-yellow-400 mt-2 animate-pulse">
                    {currentTeam.name}
                  </span>
                </div>
              )}

              {quizPhase === 'TEAM_INCORRECT' && (
                <div>
                  <span className="font-display font-black text-lg text-red-400">
                    ✕ {teams[incorrectTeams[incorrectTeams.length - 1]]?.name}
                  </span>
                  <span className="block font-display font-bold text-xs text-red-400/70 mt-1">INCORRECT</span>
                  {/* Show next team if available */}
                  {buzzerQueue[currentBuzzerIdx + 1] !== undefined && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="font-display font-bold text-[10px] tracking-wider text-gray-500 uppercase">Next Chance</span>
                      <span className="block font-display font-black text-lg text-yellow-400 mt-1">
                        {teams[buzzerQueue[currentBuzzerIdx + 1]]?.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {quizPhase === 'ANSWER_REVEALED' && (
                <div>
                  {incorrectTeams.length === 0 || currentTeamIdx !== null ? (
                    <>
                      <span className="font-display font-black text-lg text-emerald-400">
                        ✓ {currentTeam?.name ?? 'Revealed'}
                      </span>
                      <span className="block font-display font-bold text-xs text-emerald-400/70 mt-1">CORRECT!</span>
                    </>
                  ) : (
                    <span className="font-display font-bold text-sm text-purple-400">Answer Revealed</span>
                  )}
                </div>
              )}

              {quizPhase === 'TIME_UP' && (
                <div>
                  <span className="font-display font-black text-lg text-red-400">⏰ TIME UP</span>
                  <span className="block font-display font-bold text-xs text-gray-500 mt-1">
                    Waiting for quizmaster...
                  </span>
                </div>
              )}

              {quizPhase === 'IDLE' && (
                <div>
                  <span className="font-display font-bold text-xs text-gray-500 tracking-wider uppercase">
                    Ready
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Scoreboard */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col gap-2">
            <span className="font-display font-bold text-[10px] tracking-wider text-gray-500 uppercase">Scoreboard</span>
            {[...teams]
              .map((t, i) => ({ ...t, idx: i }))
              .sort((a, b) => b.score - a.score)
              .map((team, rank) => (
                <div key={team.idx} className={`flex justify-between items-center px-3 py-2 rounded-lg border text-sm font-sans transition-all ${
                  rank === 0 && team.score > 0
                    ? 'border-yellow-500/30 bg-yellow-950/10'
                    : 'border-white/5'
                }`}>
                  <div className="flex items-center gap-2">
                    {rank === 0 && team.score > 0 && <span className="text-yellow-500">🏆</span>}
                    <span className={`w-2 h-2 rounded-full shrink-0 ${connectedTeams[team.idx] ? 'bg-emerald-400 shadow-[0_0_4px_#10b981]' : 'bg-gray-700'}`} />
                    <span className={`font-bold ${
                      incorrectTeams.includes(team.idx) && quizPhase !== 'ANSWER_REVEALED' && quizPhase !== 'IDLE'
                        ? 'text-red-400/50 line-through'
                        : team.idx === currentTeamIdx && quizPhase === 'TEAM_ANSWERING'
                          ? 'text-yellow-300'
                          : 'text-gray-300'
                    }`}>
                      {team.name}
                    </span>
                  </div>
                  <span className="font-display font-black text-emerald-400">{team.score}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
