import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import Rink from './Rink'; // Import 3D hřiště

export default function MatchPage() {
  const navigate = useNavigate();
  const [matchStarted, setMatchStarted] = useState(false);

  const handleStartMatch = () => {
    setMatchStarted(true);
  };

  if (!matchStarted) {
    // Obrazovka před začátkem zápasu
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white hover:text-blue-300 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Zpět na dashboard</span>
          </button>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl border-2 border-blue-500/30 p-12 text-center">
            <div className="text-6xl mb-6">🏒</div>
            <h1 className="text-4xl font-bold text-white mb-4">Připraven na zápas?</h1>
            <p className="text-gray-300 mb-8 text-lg">
              Tvůj tým je připraven nastoupit na led!
            </p>

            <button
              onClick={handleStartMatch}
              className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600
                       px-12 py-6 rounded-xl text-white font-bold text-2xl
                       transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
                       flex items-center justify-center gap-4 mx-auto"
            >
              <Play size={32} />
              <span>ZAČÍT ZÁPAS!</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Obrazovka se 3D hřištěm během zápasu - FULLSCREEN!
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Horní lišta s tlačítkem zpět */}
      <div className="p-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Zpět na dashboard</span>
        </button>
      </div>

      {/* 3D HŘIŠTĚ - FULLSCREEN! */}
      <div className="flex-1 flex items-center justify-center">
        {/* Zde se zobrazí 3D hřiště přes celou obrazovku */}
        <Rink 
          width={window.innerWidth - 40} 
          height={window.innerHeight - 100} 
          cameraAngle={-25}
        />
      </div>
      
      {/* Info overlay v rohu obrazovky */}
      <div className="absolute top-20 right-4 bg-slate-800/80 backdrop-blur rounded-xl border-2 border-blue-500/30 p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Domácí</div>
            <div className="text-3xl font-bold text-white">0</div>
          </div>
          
          <div className="text-gray-400 text-xl">:</div>
          
          <div className="text-center">
            <div className="text-gray-400 text-sm">Hosté</div>
            <div className="text-3xl font-bold text-white">0</div>
          </div>
        </div>
        
        <div className="mt-3 text-center border-t border-slate-600 pt-3">
          <div className="text-blue-400 font-bold">1. třetina</div>
          <div className="text-gray-400 text-sm">20:00</div>
        </div>
      </div>
    </div>
  );
}
