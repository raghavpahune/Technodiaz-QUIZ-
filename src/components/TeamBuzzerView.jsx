import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { syncSend } from '../utils/sync';

/**
 * TeamBuzzerView — phone-only buzzer for one team.
 * Shows ONLY: team name, score, phase status, and a giant BUZZ button.
 * No questions, no options, no explanations — teams look at the projector.
 *
 * ponytail: stripped to bare minimum for phone screen real estate.
 */
export default function TeamBuzzerView() {
  const {
    teams, quizPhase, activePage,
    buzzerQueue, currentTeamIdx, incorrectTeams
  } = useQuiz();

  // ponytail: get team index from URL
  const urlParams = new URLSearchParams(window.location.search);
  const myTeamIdx = parseInt(urlParams.get('team') || '0', 10);
  const myTeam = teams[myTeamIdx];

  // Handle buzzing
  const handleBuzz = () => {
    if (quizPhase === 'QUESTION_ACTIVE' && !buzzerQueue.includes(myTeamIdx)) {
      syncSend({ type: 'buzz', teamIdx: myTeamIdx });
    }
  };

  // Determine state
  const hasBuzzed = buzzerQueue.includes(myTeamIdx);
  const isMyTurn = quizPhase === 'TEAM_ANSWERING' && currentTeamIdx === myTeamIdx;
  const isIncorrect = incorrectTeams.includes(myTeamIdx);

  // Status text + color
  let statusText = 'WAITING FOR HOST';
  let statusColor = 'text-gray-500';
  let buzzerActive = false;
  let buzzerText = 'WAIT';
  let buzzerClass = 'bg-gray-800/80 text-gray-600 border-gray-700';

  if (activePage !== 'quiz') {
    statusText = 'WAITING FOR QUIZ TO START';
  } else if (quizPhase === 'IDLE') {
    statusText = 'GET READY...';
  } else if (quizPhase === 'QUESTION_ACTIVE') {
    if (!hasBuzzed && !isIncorrect) {
      statusText = 'QUESTION IS LIVE!';
      statusColor = 'text-yellow-400 animate-pulse';
      buzzerActive = true;
      buzzerText = '🔔 BUZZ!';
      buzzerClass = 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.6)] active:bg-yellow-300 active:scale-95';
    } else if (hasBuzzed) {
      statusText = 'BUZZED — WAITING';
      statusColor = 'text-blue-400';
      buzzerText = 'BUZZED ✓';
      buzzerClass = 'bg-blue-900/60 text-blue-400 border-blue-700';
    } else if (isIncorrect) {
      statusText = 'LOCKED OUT';
      statusColor = 'text-red-400';
      buzzerText = '✕';
      buzzerClass = 'bg-red-900/40 text-red-500 border-red-800';
    }
  } else if (quizPhase === 'TEAM_ANSWERING') {
    if (isMyTurn) {
      statusText = 'YOUR TURN — ANSWER NOW!';
      statusColor = 'text-emerald-400 animate-pulse';
      buzzerText = 'ANSWERING';
      buzzerClass = 'bg-emerald-600 text-white border-emerald-500 animate-pulse';
    } else {
      statusText = hasBuzzed ? 'IN QUEUE' : 'WAITING';
      buzzerText = 'LOCKED';
    }
  } else if (quizPhase === 'TEAM_INCORRECT') {
    if (isIncorrect) {
      statusText = 'INCORRECT';
      statusColor = 'text-red-400';
      buzzerText = '✕';
      buzzerClass = 'bg-red-900/40 text-red-500 border-red-800';
    } else {
      statusText = 'PASSING...';
      statusColor = 'text-yellow-400';
    }
  } else if (quizPhase === 'ANSWER_REVEALED') {
    if (isMyTurn && !isIncorrect) {
      statusText = 'CORRECT! 🎉';
      statusColor = 'text-emerald-400';
      buzzerText = '✓';
      buzzerClass = 'bg-emerald-600 text-white border-emerald-500';
    } else {
      statusText = 'NEXT QUESTION SOON';
    }
  } else if (quizPhase === 'TIME_UP') {
    statusText = 'TIME UP';
    statusColor = 'text-red-400';
    buzzerText = '⏰';
  }

  return (
    <div className="min-h-[100dvh] bg-[#030008] flex flex-col items-center justify-between p-6 relative overflow-hidden select-none">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-yellow-500 pointer-events-none" />

      {/* Team name + score */}
      <div className="text-center z-10 mt-8">
        <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-wider uppercase">
          {myTeam?.name || `Team ${myTeamIdx + 1}`}
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="font-display font-black text-5xl text-emerald-400">
            {myTeam?.score || 0}
          </span>
          <span className="font-display font-bold text-xs text-gray-500 uppercase tracking-widest">
            pts
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="z-10 text-center">
        <span className={`font-display font-bold text-sm tracking-widest uppercase ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Giant BUZZ button */}
      <div className="w-full z-10 mb-8">
        <motion.button
          whileTap={buzzerActive ? { scale: 0.9 } : {}}
          onClick={handleBuzz}
          disabled={!buzzerActive}
          className={`w-full aspect-[2/1] max-h-56 rounded-3xl font-display font-black text-5xl md:text-6xl tracking-widest border-4 transition-all duration-150 ${buzzerClass} ${!buzzerActive ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {buzzerText}
        </motion.button>
      </div>
    </div>
  );
}
