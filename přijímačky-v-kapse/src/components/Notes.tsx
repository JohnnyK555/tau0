import React, { useState, useEffect } from 'react';
import { StickyNote, Trash2, Plus, Save } from 'lucide-react';

export function Notes() {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('prijimacky_notes') || '';
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('prijimacky_notes', note);
  }, [note]);

  const handleDelete = () => {
    if (showConfirm) {
      setNote('');
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-amber-50 rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="p-3 bg-amber-100 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800 font-semibold">
          <StickyNote size={18} />
          <span>Poznámky</span>
        </div>
        <button
          onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 ${
            showConfirm ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-amber-200 text-amber-700'
          }`}
          title="Smazat vše"
        >
          <Trash2 size={16} />
          {showConfirm && <span>Opravdu?</span>}
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Sem si pište své výpočty nebo poznámky..."
        className="flex-1 p-4 bg-transparent outline-none resize-none text-amber-900 placeholder-amber-400 font-medium leading-relaxed"
      />
      <div className="p-2 bg-amber-100/50 text-[10px] text-amber-600 text-center uppercase tracking-wider font-bold">
        Automaticky uloženo
      </div>
    </div>
  );
}
