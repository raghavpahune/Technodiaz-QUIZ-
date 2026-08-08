import React from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import Ambient3DScene from './scenes/Ambient3DScene';
import Landing from './pages/Landing';
import RoundSelect from './pages/RoundSelect';
import Quiz from './pages/Quiz';
import RoundComplete from './pages/RoundComplete';
import FinalResults from './pages/FinalResults';

function MainAppContent() {
  const { activePage, activeRound } = useQuiz();

  return (
    <div className="relative min-h-screen w-full">
      {/* 3D Ambient Scene Canvas running in the background */}
      <Ambient3DScene currentRound={activePage === 'landing' ? 'landing' : activeRound} />

      {/* Dynamic Page Router */}
      <div className="relative z-10 w-full min-h-screen">
        {activePage === 'landing' && <Landing />}
        {activePage === 'round-select' && <RoundSelect />}
        {activePage === 'quiz' && <Quiz />}
        {activePage === 'round-complete' && <RoundComplete />}
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
