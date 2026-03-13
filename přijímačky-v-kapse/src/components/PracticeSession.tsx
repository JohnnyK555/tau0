import React, { useState, useEffect, useRef } from 'react';
import { generateQuestions, Question } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, RefreshCw, StickyNote, Pencil, ChevronRight } from 'lucide-react';
import { Notes } from './Notes';
import { DrawingCanvas } from './DrawingCanvas';

interface PracticeSessionProps {
  subject: 'cesky_jazyk' | 'matematika';
  topic?: string;
  onBack: () => void;
}

export function PracticeSession({ subject, topic, onBack }: PracticeSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

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

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const newQuestions = await generateQuestions(subject, 3, topic);
      if (newQuestions.length === 0) {
        throw new Error('Nepodařilo se načíst otázky.');
      }
      setQuestions(newQuestions);
      setCurrentIndex(0);
      setUserAnswer('');
      setIsSubmitted(false);
    } catch (err) {
      setError('Došlo k chybě při načítání otázek. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [subject, topic]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || isSubmitted) return;

    setIsSubmitted(true);
    
    // Basic evaluation logic
    const isCorrect = 
      currentQuestion.type === 'multiple_choice' 
        ? userAnswer === currentQuestion.correctAnswer
        : userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    if (isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    }
    setScore(s => ({ ...s, total: s.total + 1 }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setUserAnswer('');
      setIsSubmitted(false);
    } else {
      loadQuestions();
    }
  };

  const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
  const isCzech = subject === 'cesky_jazyk';
  const themeColor = isCzech ? 'indigo' : 'emerald';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className={`w-12 h-12 animate-spin mb-4 ${isCzech ? 'text-indigo-600' : 'text-emerald-600'}`} />
        <p className="text-slate-600 text-lg">Generuji otázky na míru...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl text-slate-800 mb-6">{error}</p>
        <button 
          onClick={loadQuestions}
          className={`px-6 py-3 text-white rounded-xl font-medium flex items-center gap-2 transition-colors ${
            isCzech ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          <RefreshCw size={20} />
          Zkusit znovu
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isCorrect = isSubmitted && (
    currentQuestion.type === 'multiple_choice' 
      ? userAnswer === currentQuestion.correctAnswer
      : userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
  );

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
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-xl transition-colors ${showNotes ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Poznámky"
            >
              <StickyNote size={24} />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-${themeColor}-100 text-${themeColor}-800`}>
              {subjectName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-slate-600 font-medium">
              Skóre: <span className={score.correct > 0 ? "text-emerald-600" : ""}>{score.correct}</span> / {score.total}
            </div>
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

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                      {currentIndex + 1}
                    </span>
                    <h3 className="text-lg font-medium text-slate-500">
                      {currentQuestion.type === 'multiple_choice' ? 'Vyberte správnou odpověď' : 'Doplňte odpověď'}
                    </h3>
                  </div>
                  
                  <p className="text-xl md:text-2xl text-slate-900 mb-8 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.text}
                  </p>

                  {currentQuestion.type === 'multiple_choice' ? (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = userAnswer === option;
                        const isCorrectOption = option === currentQuestion.correctAnswer;
                        
                        let optionClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";
                        
                        if (!isSubmitted) {
                          if (isSelected) {
                            optionClass += isCzech 
                              ? "border-indigo-500 bg-indigo-50 text-indigo-900" 
                              : "border-emerald-500 bg-emerald-50 text-emerald-900";
                          } else {
                            optionClass += "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50";
                          }
                        } else {
                          if (isCorrectOption) {
                            optionClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                          } else if (isSelected && !isCorrectOption) {
                            optionClass += "border-red-500 bg-red-50 text-red-900";
                          } else {
                            optionClass += "border-slate-200 text-slate-400 opacity-50";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isSubmitted}
                            onClick={() => setUserAnswer(option)}
                            className={optionClass}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option}</span>
                              {isSubmitted && isCorrectOption && <CheckCircle2 className="text-emerald-500" size={20} />}
                              {isSubmitted && isSelected && !isCorrectOption && <XCircle className="text-red-500" size={20} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-6">
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Zadejte vaši odpověď..."
                        className={`w-full p-4 text-lg rounded-xl border-2 outline-none transition-all duration-200 ${
                          isSubmitted 
                            ? isCorrect 
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900" 
                              : "border-red-500 bg-red-50 text-red-900"
                            : isCzech
                              ? "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                              : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        }`}
                      />
                    </form>
                  )}

                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!userAnswer.trim()}
                      className={`mt-8 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        userAnswer.trim()
                          ? isCzech
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Zkontrolovat odpověď
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <div className={`p-6 rounded-2xl mb-6 ${isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {isCorrect ? (
                              <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                            ) : (
                              <XCircle className="text-red-600 w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-semibold text-lg mb-2 ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                              {isCorrect ? 'Správně!' : 'Chyba!'}
                            </h4>
                            {!isCorrect && currentQuestion.type === 'open_ended' && (
                              <p className="text-red-800 mb-3 font-medium">
                                Správná odpověď: {currentQuestion.correctAnswer}
                              </p>
                            )}
                            <p className={isCorrect ? 'text-emerald-800' : 'text-red-800'}>
                              {currentQuestion.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleNext}
                        className={`w-full py-4 rounded-xl font-semibold text-lg text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
                          isCzech ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {currentIndex < questions.length - 1 ? 'Další otázka' : 'Vygenerovat další sadu'}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
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

