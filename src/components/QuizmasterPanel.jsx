import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz, roundConfig } from '../context/QuizContext';
import OptionButton from './OptionButton';
import ProgressBar from './ProgressBar';
import TimerDisplay from './TimerDisplay';
import BuzzerOverlay from './BuzzerOverlay';
import AnimatedButton from './AnimatedButton';

function TeamScoreEditor({ team, idx, isOnline, updateTeamScore, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempScore, setTempScore] = useState(team.score);

  const handleSave = () => {
    const val = parseInt(tempScore, 10);
    if (!isNaN(val) && val !== team.score) {
      updateTeamScore(idx, val);
      showToast(`${team.name} score updated to ${val}`);
    }
    setIsEditing(false);
  };

  const adjustScore = (delta) => {
    const newVal = team.score + delta;
    updateTeamScore(idx, newVal);
    showToast(`${team.name} score adjusted to ${newVal}`);
  };

  return (
    <div className="flex justify-between items-center px-2 py-1.5 rounded-lg border border-white/5 text-xs font-sans group">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 shadow-[0_0_4px_#10b981]' : 'bg-gray-600'}`} title={isOnline ? 'Phone connected' : 'Phone not connected'} />
        <span className="text-gray-300 font-bold max-w-[90px] truncate">{team.name}</span>
      </div>
      
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            value={tempScore} 
            onChange={e => setTempScore(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onBlur={handleSave}
            autoFocus
            className="w-12 px-1 py-0.5 bg-black/50 border border-yellow-500/50 rounded text-right text-emerald-400 font-display font-black outline-none"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Quick nudge buttons (visible on hover) */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <AnimatedButton onClick={() => adjustScore(-1)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">-</AnimatedButton>
            <AnimatedButton onClick={() => adjustScore(1)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">+</AnimatedButton>
          </div>
          <AnimatedButton 
            onClick={() => { setIsEditing(true); setTempScore(team.score); }} 
            className="font-display font-black text-emerald-400 hover:text-emerald-300 px-1 hover:bg-white/5 rounded cursor-pointer transition-colors min-w-[30px] text-right"
            title="Click to edit score"
          >
            {team.score}
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}

/**
 * QuizmasterPanel — the main control dashboard.
 * Shows in the primary browser window during quiz mode.
 * The quizmaster can see the correct answer, control the flow, and manage teams.
 */
export default function QuizmasterPanel() {
  const {
    activeRound, currentQuestionIndex, shuffledDbs,
    teams, quizPhase, currentQuestion, isAnswerRevealed,
    buzzerQueue, currentTeamIdx, incorrectTeams,
    startQuestion, markCorrect, markIncorrect, revealAnswer, nextQuestion,
    timerSeconds, timerDuration, setTimerDuration, openProjector, pointsPerCorrect,
    connectedTeams, lanAddress, updateTeamScore
  } = useQuiz();

  const [showQR, setShowQR] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const round = roundConfig[activeRound];
  const questions = shuffledDbs[activeRound];
  const question = currentQuestion;
  const letters = ['A', 'B', 'C', 'D'];

  if (!question) return null;

  const currentTeam = currentTeamIdx !== null ? teams[currentTeamIdx] : null;

  // ponytail: use LAN IP for buzzer URLs when on localhost (so phones on same WiFi can reach it)
  // In production, window.location.origin is the deployed domain — already correct.
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const buzzerOrigin = (isLocalhost && lanAddress) ? lanAddress : window.location.origin;
  const buzzerBase = `${buzzerOrigin}${window.location.pathname}`;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4 select-text">
      {/* Top bar: round info + projector button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{round.icon}</span>
          <div>
            <span className="font-display font-black text-xs tracking-wider text-yellow-500 uppercase">{round.name}</span>
            <span className="text-gray-500 text-xs ml-3">Q{currentQuestionIndex + 1} / {questions.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton
            onClick={() => setShowQR(v => !v)}
            className="px-3 py-2 rounded-xl border border-white/10 font-display font-bold text-xs tracking-wider text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            title="Show team QR codes"
          >
            📱 QR
          </AnimatedButton>
          <AnimatedButton
            onClick={openProjector}
            className="px-4 py-2 rounded-xl border border-white/10 font-display font-bold text-xs tracking-wider text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            PROJECTOR
          </AnimatedButton>
        </div>
      </div>

      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} color={round.palette} />

      {/* QR Code overlay */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-[10px] tracking-wider text-gray-500 uppercase">Team Buzzer QR Codes</span>
                <AnimatedButton onClick={() => setShowQR(false)} className="text-gray-500 hover:text-white text-xs p-1">✕</AnimatedButton>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {teams.map((team, idx) => {
                  const url = `${buzzerBase}?mode=buzzer&team=${idx}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=120x120&bgcolor=0a0a0a&color=ffffff`;
                  const isOnline = !!connectedTeams[idx];
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-slate-950/30">
                      <img src={qrUrl} alt={`QR for ${team.name}`} className="w-24 h-24 rounded-lg" loading="lazy" />
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-gray-600'}`} />
                        <span className="text-xs font-sans font-bold text-gray-300 truncate max-w-20">{team.name}</span>
                      </div>
                      <AnimatedButton
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="text-[10px] text-gray-500 hover:text-white px-2 py-1 bg-white/5 rounded transition-colors font-display font-bold tracking-wider"
                      >
                        COPY LINK
                      </AnimatedButton>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAN mode warning — only shown when running on localhost */}
      {isLocalhost && lanAddress && (
        <div className="px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-950/10 flex items-start gap-2 text-xs font-sans">
          <span className="text-yellow-500 shrink-0 mt-0.5">⚠</span>
          <div>
            <span className="text-yellow-400 font-bold">LAN Mode</span>
            <span className="text-gray-400"> — Buzzer links use </span>
            <span className="text-yellow-300 font-mono text-[11px]">{lanAddress}</span>
            <span className="text-gray-400">. Team phones must be on the <strong className="text-gray-300">same WiFi network</strong> as this laptop.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Question + Options (quizmaster can see correct answer) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Question card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
            <h2 className="text-lg font-bold font-sans text-gray-100 leading-snug text-left">
              {question.question}
            </h2>

            {question.image && (
              <div className="w-full rounded-xl overflow-hidden max-h-48 flex justify-center bg-black/30 border border-white/5">
                <img src={question.image} alt="Question visual" className="object-contain max-h-full" loading="lazy" />
              </div>
            )}

            {/* Options — quizmaster ALWAYS sees correct answer highlighted */}
            <div className="flex flex-col gap-2">
              {question.options.map((option, idx) => (
                <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-sans font-semibold transition-all ${
                  idx === question.correctAnswer
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-white/5 bg-slate-950/30 text-gray-300'
                }`}>
                  <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                    idx === question.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className="leading-tight">{option}</span>
                  {idx === question.correctAnswer && (
                    <span className="ml-auto text-emerald-400 text-xs font-display font-bold">✓ CORRECT</span>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation (always visible to quizmaster) */}
            <div className="mt-2 p-3 rounded-xl border border-white/5 bg-slate-950/30">
              <span className="font-display font-bold text-[10px] tracking-wider text-yellow-500 uppercase">Explanation</span>
              <p className="text-sm text-gray-400 mt-1 font-sans">{question.explanation}</p>
            </div>
          </div>
        </div>

        {/* Right column: Controls */}
        <div className="flex flex-col gap-4">
          {/* Timer + Duration Config */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3">
            <TimerDisplay seconds={timerSeconds} total={timerDuration} size="md" />
            <span className="text-[10px] text-gray-500 font-display font-bold tracking-wider uppercase">
              {quizPhase === 'TIME_UP' ? 'TIME UP' : quizPhase === 'QUESTION_ACTIVE' ? 'WAITING FOR BUZZ' : quizPhase}
            </span>
            {quizPhase === 'IDLE' && (
              <div className="flex items-center gap-2 w-full">
                <span className="text-[10px] text-gray-500 font-display font-bold tracking-wider shrink-0">TIMER</span>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="flex-1 accent-yellow-500 h-1"
                />
                <span className="text-xs text-gray-300 font-display font-bold w-8 text-right">{timerDuration}s</span>
              </div>
            )}
          </div>

          {/* Buzzer Queue */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
            <span className="font-display font-bold text-[10px] tracking-wider text-gray-500 uppercase">Buzzer Queue</span>
            <BuzzerOverlay />

            {/* Buzz order display */}
            {buzzerQueue.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {buzzerQueue.map((teamIdx, order) => {
                  const isCurrently = teamIdx === currentTeamIdx;
                  const wasWrong = incorrectTeams.includes(teamIdx);
                  return (
                    <div key={teamIdx} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all ${
                      isCurrently ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
                      wasWrong ? 'bg-red-500/10 border border-red-500/20 text-red-400 line-through' :
                      'border border-white/5 text-gray-500'
                    }`}>
                      <span>#{order + 1} {teams[teamIdx]?.name}</span>
                      {wasWrong && <span className="text-red-400 text-[10px]">✕</span>}
                      {isCurrently && !wasWrong && <span className="text-yellow-400 text-[10px] animate-pulse">ANSWERING</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col gap-2">
            {quizPhase === 'IDLE' && (
              <AnimatedButton onClick={startQuestion}
                className="w-full py-3 rounded-xl font-display font-black text-sm tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.35)]">
                ▶ START QUESTION
              </AnimatedButton>
            )}

            {quizPhase === 'TEAM_ANSWERING' && (
              <>
                <div className="text-center mb-2">
                  <span className="font-display font-bold text-xs text-gray-400 tracking-wider">ANSWERING:</span>
                  <span className="block font-display font-black text-lg text-yellow-400 mt-1">{currentTeam?.name}</span>
                </div>
                <AnimatedButton onClick={markCorrect}
                  className="w-full py-3 rounded-xl font-display font-black text-sm tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                  ✓ CORRECT (+{pointsPerCorrect} pts)
                </AnimatedButton>
                <AnimatedButton onClick={markIncorrect}
                  className="w-full py-3 rounded-xl font-display font-black text-sm tracking-wider bg-red-600 text-white hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.35)]">
                  ✕ INCORRECT
                </AnimatedButton>
              </>
            )}

            {quizPhase === 'TEAM_INCORRECT' && (
              <div className="text-center py-3">
                <span className="font-display font-bold text-sm text-red-400 animate-pulse">Passing to next team...</span>
              </div>
            )}

            {/* Manual reveal — available in TIME_UP and not yet revealed */}
            {quizPhase === 'TIME_UP' && !isAnswerRevealed && (
              <AnimatedButton onClick={revealAnswer}
                className="w-full py-3 rounded-xl font-display font-black text-sm tracking-wider border-2 border-purple-500/50 text-purple-300 hover:bg-purple-950/30 transition-colors">
                👁 REVEAL ANSWER
              </AnimatedButton>
            )}

            {isAnswerRevealed && (
              <AnimatedButton onClick={nextQuestion}
                className="w-full py-3 rounded-xl font-display font-black text-sm tracking-wider bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.35)] flex items-center justify-center gap-2 group">
                <span>NEXT QUESTION</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </AnimatedButton>
            )}
          </div>

          {/* Scoreboard with connection status */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col gap-2 relative">
            <span className="font-display font-bold text-[10px] tracking-wider text-gray-500 uppercase">Scores (Click to edit)</span>
            
            {/* Toast overlay */}
            <AnimatePresence>
              {toastMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-bold font-sans tracking-wider whitespace-nowrap z-20 shadow-lg"
                >
                  {toastMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {teams.map((team, idx) => (
              <TeamScoreEditor 
                key={idx} 
                team={team} 
                idx={idx} 
                isOnline={!!connectedTeams[idx]} 
                updateTeamScore={updateTeamScore}
                showToast={showToast}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
