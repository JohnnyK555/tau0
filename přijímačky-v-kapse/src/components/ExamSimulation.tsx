import React, { useState, useEffect, useRef } from 'react';
import { generateExam, Question } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle, StickyNote, Pencil, ChevronRight, ChevronLeft } from 'lucide-react';
import { Notes } from './Notes';
import { DrawingCanvas } from './DrawingCanvas';

interface ExamSimulationProps {
  onBack: () => void;
}

export function ExamSimulation({ onBack }: ExamSimulationProps) {
  const [subject, setSubject] = useState<'cesky_jazyk' | 'matematika' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Sidebars state
  const [showNotes, setShowNotes] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const drawingContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });

  useEffect(() => {
    if (showDrawing && drawingContainerRef.current) {
      setCanvasSize({
        width: drawingContainerRef.current.offsetWidth,
        height: drawingContainerRef.current.offsetHeight - 50
      });
    }
  }, [showDrawing]);

  const startExam = async (selectedSubject: 'cesky_jazyk' | 'matematika') => {
    setSubject(selectedSubject);
    setLoading(true);
    setError(null);
    try {
      // "Plnohodnotná" zkouška - 25 otázek
      const newQuestions = await generateExam(selectedSubject);
      if (newQuestions.length === 0) {
        throw new Error('Nepodařilo se načíst test.');
      }
      setQuestions(newQuestions);
      setAnswers({});
      setIsStarted(true);
      setIsFinished(false);
      // Czech: 60 mins, Math: 70 mins (in seconds)
      setTimeLeft(selectedSubject === 'cesky_jazyk' ? 60 * 60 : 70 * 60);
    } catch (err) {
      setError('Došlo k chybě při generování testu. Zkuste to prosím znovu.');
      setSubject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: number;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    if (isFinished) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const finishExam = () => {
    if (window.confirm('Opravdu chcete ukončit test a zobrazit výsledky?')) {
      setIsFinished(true);
    }
  };

  if (!subject && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Zpět do hlavního menu</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Plnohodnotná simulace zkoušky</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Vyzkoušejte si test nanečisto se všemi nástroji. K dispozici máte poznámkový blok a rýsovací prkno s geometrií.
            Test obsahuje 25 úloh a odpovídá reálné časové dotaci.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-8 text-center flex items-center justify-center gap-2">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => startExam('cesky_jazyk')}
            className="p-8 bg-white rounded-3xl shadow-sm border-2 border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-slate-900">Český jazyk</h3>
              <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium">
                <Clock size={16} /> 60 min
              </span>
            </div>
            <p className="text-slate-500">Kompletní test s 25 úlohami pokrývajícími všechna témata.</p>
          </button>

          <button
            onClick={() => startExam('matematika')}
            className="p-8 bg-white rounded-3xl shadow-sm border-2 border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-slate-900">Matematika</h3>
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
                <Clock size={16} /> 70 min
              </span>
            </div>
            <p className="text-slate-500">Kompletní test s 25 úlohami včetně rýsování a složitých výpočtů.</p>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className={`w-12 h-12 animate-spin mb-4 ${subject === 'cesky_jazyk' ? 'text-indigo-600' : 'text-emerald-600'}`} />
        <p className="text-slate-600 text-lg">Generuji plnohodnotný test...</p>
        <p className="text-slate-400 text-sm mt-2">Příprava 25 úloh může trvat až 30 sekund.</p>
      </div>
    );
  }

  const isCzech = subject === 'cesky_jazyk';
  const themeColor = isCzech ? 'indigo' : 'emerald';

  if (isFinished) {
    let correctCount = 0;
    questions.forEach(q => {
      const userAns = answers[q.id] || '';
      const isCorrect = q.type === 'multiple_choice' 
        ? userAns === q.correctAnswer
        : userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (isCorrect) correctCount++;
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Výsledky testu</h2>
          <p className="text-slate-500 mb-8">{isCzech ? 'Český jazyk' : 'Matematika'}</p>
          
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${percentage >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {percentage}%
              </div>
              <div className="text-slate-500 font-medium">Úspěšnost</div>
            </div>
            <div className="w-px h-16 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900 mb-2">
                {correctCount}<span className="text-2xl text-slate-400">/{questions.length}</span>
              </div>
              <div className="text-slate-500 font-medium">Správných odpovědí</div>
            </div>
          </div>

          <button
            onClick={() => {
              setSubject(null);
              setIsStarted(false);
            }}
            className={`px-8 py-3 rounded-xl font-semibold text-white bg-${themeColor}-600 hover:bg-${themeColor}-700 transition-colors`}
          >
            Zpět na výběr testu
          </button>
        </motion.div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 px-2">Detailní přehled</h3>
          {questions.map((q, idx) => {
            const userAns = answers[q.id] || '';
            const isCorrect = q.type === 'multiple_choice' 
              ? userAns === q.correctAnswer
              : userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

            return (
              <div key={q.id} className={`bg-white rounded-2xl border-2 p-6 ${isCorrect ? 'border-emerald-100' : 'border-red-100'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-400">Úloha {idx + 1}</span>
                    </div>
                    <p className="text-lg text-slate-900 mb-4">{q.text}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <span className="text-sm text-slate-500 block mb-1">Vaše odpověď:</span>
                        <span className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {userAns || '(nevyplněno)'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="bg-emerald-50 p-4 rounded-xl">
                          <span className="text-sm text-emerald-600 block mb-1">Správná odpověď:</span>
                          <span className="font-medium text-emerald-800">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl">
                      <span className="text-sm text-blue-600 font-semibold block mb-1">Vysvětlení:</span>
                      <p className="text-blue-900 text-sm">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Sidebar: Notes */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 h-full p-4 border-r border-slate-200 bg-white z-40"
          >
            <Notes />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-xl transition-colors ${showNotes ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Poznámky"
            >
              <StickyNote size={24} />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-${themeColor}-100 text-${themeColor}-800`}>
              {isCzech ? 'Český jazyk' : 'Matematika'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              <Clock size={28} />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={finishExam}
              className={`px-8 py-2.5 rounded-xl font-bold text-white bg-${themeColor}-600 hover:bg-${themeColor}-700 shadow-md transition-all transform hover:-translate-y-0.5`}
            >
              Odevzdat test
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-6 w-px bg-slate-200" />
            <button
              onClick={() => setShowDrawing(!showDrawing)}
              className={`p-2 rounded-xl transition-colors ${showDrawing ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Rýsování"
            >
              <Pencil size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                    {idx + 1}
                  </span>
                  <h3 className="text-lg font-medium text-slate-500">
                    {q.type === 'multiple_choice' ? 'Vyberte správnou odpověď' : 'Doplňte odpověď'}
                  </h3>
                </div>
                
                <p className="text-xl text-slate-900 mb-8 leading-relaxed whitespace-pre-wrap">
                  {q.text}
                </p>

                {q.type === 'multiple_choice' ? (
                  <div className="space-y-3">
                    {q.options.map((option, optIdx) => {
                      const isSelected = answers[q.id] === option;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswer(q.id, option)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? `border-${themeColor}-500 bg-${themeColor}-50 text-${themeColor}-900` 
                              : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-medium">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    placeholder="Zadejte vaši odpověď..."
                    className={`w-full p-4 text-lg rounded-xl border-2 outline-none transition-all duration-200 border-slate-200 focus:border-${themeColor}-500 focus:ring-4 focus:ring-${themeColor}-500/10`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Drawing */}
      <AnimatePresence>
        {showDrawing && (
          <motion.div
            initial={{ x: 500 }}
            animate={{ x: 0 }}
            exit={{ x: 500 }}
            className="w-[500px] h-full p-4 border-l border-slate-200 bg-white z-40 flex flex-col"
            ref={drawingContainerRef}
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" />
                Rýsovací prkno
              </h3>
              <button 
                onClick={() => setShowDrawing(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex-1">
              <DrawingCanvas width={canvasSize.width - 32} height={canvasSize.height} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggles when sidebars are hidden */}
      {!showNotes && (
        <button
          onClick={() => setShowNotes(true)}
          className="fixed left-4 bottom-4 p-4 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-all z-50"
          title="Otevřít poznámky"
        >
          <StickyNote size={24} />
        </button>
      )}
      {!showDrawing && (
        <button
          onClick={() => setShowDrawing(true)}
          className="fixed right-4 bottom-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-50"
          title="Otevřít rýsování"
        >
          <Pencil size={24} />
        </button>
      )}
    </div>
  );
}

