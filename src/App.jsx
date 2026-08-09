import React from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import Ambient3DScene from './scenes/Ambient3DScene';
import Landing from './pages/Landing';
import QuestionDatabase from './pages/QuestionDatabase';
import Quiz from './pages/Quiz';
import FinalResults from './pages/FinalResults';

function MainAppContent() {
  const { activePage, IS_PROJECTOR } = useQuiz();

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-cyan-500/30">
      {/* 3D Ambient Scene Canvas running in the background */}
      <Ambient3DScene />

      {/* Dynamic Page Router */}
      <div className="relative z-10 w-full min-h-screen">
        {activePage === 'landing' && <Landing />}
        {activePage === 'database' && !IS_PROJECTOR && <QuestionDatabase />}
        {activePage === 'database' && IS_PROJECTOR && (
          <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-4xl text-cyan-500 font-bold tracking-widest uppercase animate-pulse">SYSTEM STANDBY</h2>
          </div>
        )}
        {activePage === 'quiz' && <Quiz />}
        {activePage === 'final-results' && <FinalResults />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QuizProvider>
      <MainAppContent />
    </QuizProvider>
  );
}
