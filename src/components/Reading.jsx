import React, { useState } from 'react';
import { Book, X, Clock, TrendingUp } from 'lucide-react';
import { useGame } from './GameContext';

export default function Reading({ onComplete, onCancel, currentTime }) {
  const { playerData, updatePlayerData } = useGame();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1);

  const books = [
    { 
      id: 'bodybuilding', 
      name: 'Kulturistika pro začátečníky', 
      emoji: '💪',
      color: 'red',
      attribute: 'fitness',
      totalPages: 100,
      description: 'Zlepší tvou znalost fitness'
    },
    { 
      id: 'history', 
      name: 'Historie hokeje', 
      emoji: '🏒',
      color: 'blue',
      attribute: 'tactics',
      totalPages: 120,
      description: 'Poučí tě o historii hokeje'
    },
    { 
      id: 'leadership', 
      name: 'Umění vůdcovství', 
      emoji: '👔',
      color: 'yellow',
      attribute: 'leadership',
      totalPages: 150,
      description: 'Zlepší tvé leadership schopnosti'
    },
    { 
      id: 'psychology', 
      name: 'Sportovní psychologie', 
      emoji: '🧠',
      color: 'purple',
      attribute: 'motivation',
      totalPages: 130,
      description: 'Zvýší tvou motivaci'
    }
  ];

  const durations = [1, 2, 3];

  // Získat progress knihy z playerData
  const getBookProgress = (bookId) => {
    if (!playerData.bookProgress) return 0;
    return playerData.bookProgress[bookId] || 0;
  };

  const handleStartReading = () => {
    if (!selectedBook) return;

    const book = books.find(b => b.id === selectedBook);
    const currentProgress = getBookProgress(selectedBook);
    const pagesPerHour = 20;
    const pagesRead = selectedDuration * pagesPerHour;
    const newProgress = Math.min(currentProgress + pagesRead, book.totalPages);

    // Uložit progress
    const bookProgress = playerData.bookProgress || {};
    bookProgress[selectedBook] = newProgress;
    updatePlayerData({ bookProgress });

    // Vrátit výsledek Timeru
    onComplete({
      duration: selectedDuration,
      bookId: selectedBook,
      pagesRead: pagesRead,
      totalProgress: newProgress,
      totalPages: book.totalPages
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl border-2 border-blue-500/50 shadow-2xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book size={40} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Čtení knih
          </h2>
          <p className="text-gray-400">
            Aktuální čas: <span className="text-blue-300 font-bold">{currentTime}</span>
          </p>
        </div>

        {/* Výběr knihy */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Book size={20} className="text-blue-400" />
            Vyber knihu:
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {books.map((book) => {
              const progress = getBookProgress(book.id);
              const percentage = Math.round((progress / book.totalPages) * 100);
              const isFinished = progress >= book.totalPages;

              return (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book.id)}
                  disabled={isFinished}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left
                    ${selectedBook === book.id 
                      ? `border-${book.color}-500 bg-${book.color}-500/30` 
                      : isFinished 
                      ? 'border-green-600 bg-green-900/30 cursor-not-allowed' 
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-3xl">{book.emoji}</div>
                    {isFinished && (
                      <div className="text-green-400 text-xs font-bold">✓ PŘEČTENO</div>
                    )}
                  </div>
                  <div className="text-white font-bold mb-1">{book.name}</div>
                  <div className="text-gray-400 text-xs mb-2">{book.description}</div>
                  
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress: {percentage}%</span>
                      <span>{progress}/{book.totalPages} stran</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`bg-${book.color}-500 h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Výběr délky čtení */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Jak dlouho budeš číst?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105
                  ${selectedDuration === duration 
                    ? 'border-blue-500 bg-blue-500/30' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}
              >
                <div className="text-white font-bold text-xl mb-1">{duration}h</div>
                <div className="text-gray-400 text-xs">~{duration * 20} stran</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tlačítka */}
        <div className="space-y-3">
          <button
            onClick={handleStartReading}
            disabled={!selectedBook}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2
              transition-all ${selectedBook
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white hover:scale-105'
                : 'bg-slate-700/50 text-gray-500 cursor-not-allowed'}`}
          >
            <Book size={20} />
            <span>ZAČÍT ČÍST</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg
                     text-gray-400 hover:text-white font-medium transition-all"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
