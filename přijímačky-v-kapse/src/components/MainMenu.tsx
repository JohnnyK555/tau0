import React from 'react';
import { BookOpen, Calculator, Clock, BookText, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

interface MainMenuProps {
  onSelectMode: (mode: 'practice' | 'exam' | 'theory') => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 flex flex-col items-center"
      >
        <div className="w-44 h-44 mb-6 flex items-center justify-center text-indigo-600 overflow-hidden rounded-3xl shadow-sm bg-white">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.3a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.832l8.57 3.698a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>';
          }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight drop-shadow-sm">
          Přijímačky v kapse
        </h1>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
          Tvůj osobní parťák na cestě na vysněnou školu. Kompletní příprava na přijímačky z češtiny a matematiky přímo na míru deváťákům. Trénuj podle témat, zkus si simulaci testu a měj všechny materiály v kapse.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => onSelectMode('practice')}
          className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 bg-indigo-100 p-5 rounded-2xl text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
            <BookOpen size={40} strokeWidth={1.5} />
          </div>
          <h2 className="relative z-10 text-xl font-semibold text-slate-900 mb-2">Trénink podle témat</h2>
          <p className="relative z-10 text-slate-500 text-center text-sm">
            Procvičujte konkrétní látku z češtiny a matematiky s okamžitou zpětnou vazbou.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelectMode('exam')}
          className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-rose-200 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 bg-rose-100 p-5 rounded-2xl text-rose-600 mb-6 group-hover:scale-110 transition-transform duration-300">
            <Clock size={40} strokeWidth={1.5} />
          </div>
          <h2 className="relative z-10 text-xl font-semibold text-slate-900 mb-2">Simulace zkoušky</h2>
          <p className="relative z-10 text-slate-500 text-center text-sm">
            Vyzkoušejte si kompletní test nanečisto s časovým limitem a závěrečným hodnocením.
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onSelectMode('theory')}
          className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-amber-200 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 bg-amber-100 p-5 rounded-2xl text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300">
            <GraduationCap size={40} strokeWidth={1.5} />
          </div>
          <h2 className="relative z-10 text-xl font-semibold text-slate-900 mb-2">Studijní materiály</h2>
          <p className="relative z-10 text-slate-500 text-center text-sm">
            Vysvětlení klíčových konceptů, vzorce, pravidla a tipy pro úspěšné zvládnutí.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
