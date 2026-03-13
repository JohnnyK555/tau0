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
    <div 
      className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative flex flex-col"
      style={{
        backgroundImage: "url('/pozadi.png')",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[1px] pointer-events-none z-0"></div>
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleBackToMenu}
          >
            <div className="w-14 h-14 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform overflow-hidden rounded-2xl shadow-sm bg-white">
              <img src="/logopanel.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.3a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.832l8.57 3.698a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>';
              }} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">Přijímačky v kapse</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">Beta</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={handleBackToMenu}
              className={`text-sm font-medium transition-colors ${mode === 'menu' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Domů
            </button>
            <button 
              onClick={() => { setMode('practice'); setSelectedSubject(null); setSelectedTopic(undefined); }}
              className={`text-sm font-medium transition-colors ${mode === 'practice' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Trénink
            </button>
            <button 
              onClick={() => setMode('exam')}
              className={`text-sm font-medium transition-colors ${mode === 'exam' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Simulace zkoušky
            </button>
            <button 
              onClick={() => setMode('theory')}
              className={`text-sm font-medium transition-colors ${mode === 'theory' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Studijní materiály
            </button>
            <button 
              onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Kontakt
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl relative z-10 flex-1 py-8">
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

      <footer id="footer" className="relative z-10 bg-white/80 backdrop-blur-md border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <div className="mb-4 flex justify-center">
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200">
              Beta Verze
            </span>
          </div>
          <p className="mb-2 font-medium">
            © 2026 Jan Kubeš <a href="mailto:prijimackyvkapse@email.cz" className="text-indigo-600 hover:underline mx-2">prijimackyvkapse@email.cz</a> +420 722 415 315
          </p>
          <p>
            Jakýkoliv dotaz nebo návrh na vylepšení pošlete na email <a href="mailto:prijimackyvkapse@email.cz" className="text-indigo-600 hover:underline">prijimackyvkapse@email.cz</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
