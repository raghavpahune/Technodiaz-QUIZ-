import React from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import Ambient3DScene from './scenes/Ambient3DScene';
import Landing from './pages/Landing';
import RoundSelect from './pages/RoundSelect';
import Quiz from './pages/Quiz';
import RoundComplete from './pages/RoundComplete';
import FinalResults from './pages/FinalResults';
import ProjectorView from './components/ProjectorView';
import TeamBuzzerView from './components/TeamBuzzerView';

// ponytail: detect mode via URL param
const urlParams = new URLSearchParams(window.location.search);
const isProjectorMode = urlParams.get('mode') === 'projector';
const isBuzzerMode = urlParams.get('mode') === 'buzzer';

function MainAppContent() {
  const { activePage, activeRound } = useQuiz();

  // Projector mode: full-screen audience view, no navigation
  if (isProjectorMode) {
    return (
      <div className="relative min-h-screen w-full">
        <ProjectorView />
      </div>
    );
  }

  // Buzzer mode: mobile team buzzer view
  if (isBuzzerMode) {
    return (
      <div className="relative min-[100dvh] w-full">
        <TeamBuzzerView />
      </div>
    );
  }

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
