import React, { useState } from 'react';
import { BookOpen, Calculator, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SubjectSelectionProps {
  onSelect: (subject: 'cesky_jazyk' | 'matematika', topic?: string) => void;
  onBack: () => void;
}

const CZECH_TOPICS = [
  'Pravopis (i/y, s/z, velká písmena)',
  'Tvarosloví (slovní druhy, mluvnické kategorie)',
  'Skladba (větné členy, druhy vět)',
  'Porozumění textu a slovní zásoba',
  'Literární teorie a historie'
];

const MATH_TOPICS = [
  'Zlomky, desetinná čísla a procenta',
  'Rovnice a nerovnice',
  'Geometrie v rovině a prostoru',
  'Slovní úlohy',
  'Závislosti, vztahy a práce s daty'
];

export function SubjectSelection({ onSelect, onBack }: SubjectSelectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<'cesky_jazyk' | 'matematika' | null>(null);

  if (selectedSubject) {
    const topics = selectedSubject === 'cesky_jazyk' ? CZECH_TOPICS : MATH_TOPICS;
    const themeColor = selectedSubject === 'cesky_jazyk' ? 'indigo' : 'emerald';
    const subjectName = selectedSubject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button 
          onClick={() => setSelectedSubject(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Zpět na výběr předmětu</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{subjectName}</h2>
          <p className="text-slate-600 mb-8">Vyberte si konkrétní téma k procvičení, nebo zvolte náhodný mix.</p>

          <div className="space-y-3">
            <button
              onClick={() => onSelect(selectedSubject)}
              className={`w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:border-${themeColor}-400 hover:shadow-md transition-all group`}
            >
              <span className="font-semibold text-slate-800 group-hover:text-slate-900">Náhodný mix všech témat</span>
              <ChevronRight className={`text-slate-400 group-hover:text-${themeColor}-500 transition-colors`} />
            </button>

            {topics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(selectedSubject, topic)}
                className={`w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-${themeColor}-300 hover:shadow-md transition-all group`}
              >
                <span className="text-slate-700 group-hover:text-slate-900">{topic}</span>
                <ChevronRight className={`text-slate-400 group-hover:text-${themeColor}-500 transition-colors`} />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-4xl mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Zpět do hlavního menu</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Trénink podle témat
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Vyberte si předmět a následně konkrétní okruh, který chcete procvičovat.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setSelectedSubject('cesky_jazyk')}
          className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 bg-indigo-100 p-5 rounded-2xl text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
            <BookOpen size={48} strokeWidth={1.5} />
          </div>
          <h2 className="relative z-10 text-2xl font-semibold text-slate-900 mb-2">Český jazyk a literatura</h2>
          <p className="relative z-10 text-slate-500 text-center">
            Pravopis, skladba, porozumění textu a literární teorie.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setSelectedSubject('matematika')}
          className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 bg-emerald-100 p-5 rounded-2xl text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
            <Calculator size={48} strokeWidth={1.5} />
          </div>
          <h2 className="relative z-10 text-2xl font-semibold text-slate-900 mb-2">Matematika a její aplikace</h2>
          <p className="relative z-10 text-slate-500 text-center">
            Zlomky, rovnice, geometrie, procenta a slovní úlohy.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
