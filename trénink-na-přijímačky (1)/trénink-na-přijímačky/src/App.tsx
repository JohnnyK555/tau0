/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { SubjectSelection } from './components/SubjectSelection';
import { PracticeSession } from './components/PracticeSession';
import { ExamSimulation } from './components/ExamSimulation';
import { TheorySection } from './components/TheorySection';

export default function App() {
  const [mode, setMode] = useState<'menu' | 'practice' | 'exam' | 'theory'>('menu');
  const [selectedSubject, setSelectedSubject] = useState<'cesky_jazyk' | 'matematika' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);

  const handleSubjectSelect = (subject: 'cesky_jazyk' | 'matematika', topic?: string) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
  };

  const handleBackToMenu = () => {
    setMode('menu');
    setSelectedSubject(null);
    setSelectedTopic(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <main className="container mx-auto max-w-7xl">
        {mode === 'menu' && (
          <MainMenu onSelectMode={setMode} />
        )}

        {mode === 'practice' && !selectedSubject && (
          <SubjectSelection 
            onSelect={handleSubjectSelect} 
            onBack={handleBackToMenu}
          />
        )}

        {mode === 'practice' && selectedSubject && (
          <PracticeSession 
            subject={selectedSubject} 
            topic={selectedTopic}
            onBack={() => {
              setSelectedSubject(null);
              setSelectedTopic(undefined);
            }} 
          />
        )}

        {mode === 'exam' && (
          <ExamSimulation onBack={handleBackToMenu} />
        )}

        {mode === 'theory' && (
          <TheorySection onBack={handleBackToMenu} />
        )}
      </main>
    </div>
  );
}
