import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Sparkles } from 'lucide-react';

export default function PlayerSetup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (firstName.trim() && lastName.trim()) {
      const playerData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        startDate: '2024-07-01',
        money: 20000
      };
      
      sessionStorage.setItem('playerData', JSON.stringify(playerData));
      navigate('/game');
    } else {
      alert('⚠️ Vyplň prosím jméno i příjmení!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Neonové pozadí */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Diagonální pruhy */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          rgba(100, 200, 255, 0.1) 40px,
          rgba(100, 200, 255, 0.1) 42px
        )`
      }}></div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Glassmorphism karta */}
        <div className="relative">
          {/* Neonový okraj */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-30"></div>
          
          {/* Hlavní obsah */}
          <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-10 border border-cyan-500/30 shadow-2xl">
            {/* Avatar sekce */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                  <User size={36} className="text-white" />
                </div>
                <Sparkles size={20} className="absolute -top-1 -right-1 text-cyan-400 animate-pulse" />
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                NOVÁ HRA
              </h1>
              <p className="text-slate-400 text-center">
                Pojmenuj svou legendu
              </p>
            </div>

            {/* Formulář */}
            <div className="space-y-6">
              {/* Jméno */}
              <div>
                <label className="block text-cyan-400 font-bold mb-2 text-xs uppercase tracking-wider">
                  Křestní jméno
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="např. Oldřich"
                    className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl
                             text-white placeholder-slate-500 text-lg
                             focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20
                             transition-all duration-200"
                    maxLength={30}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 pointer-events-none"></div>
                </div>
              </div>

              {/* Příjmení */}
              <div>
                <label className="block text-blue-400 font-bold mb-2 text-xs uppercase tracking-wider">
                  Příjmení
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="např. Stepanovský"
                    className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl
                             text-white placeholder-slate-500 text-lg
                             focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20
                             transition-all duration-200"
                    maxLength={30}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 pointer-events-none"></div>
                </div>
              </div>

              {/* Statistiky */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">📅 Start</span>
                  <span className="text-white font-bold">1. července 2024</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">💰 Kapitál</span>
                  <span className="text-cyan-400 font-bold text-lg">20 000 Kč</span>
                </div>
              </div>

              {/* Tlačítka */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStart}
                  disabled={!firstName.trim() || !lastName.trim()}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wide
                    flex items-center justify-center gap-3
                    transition-all duration-300 relative overflow-hidden
                    ${firstName.trim() && lastName.trim()
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border-2 border-slate-700'
                    }
                  `}
                >
                  {firstName.trim() && lastName.trim() && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  )}
                  <span className="relative">Začít hru</span>
                  <ArrowRight size={24} className="relative" />
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-xl font-medium
                           bg-transparent border-2 border-slate-700 text-slate-400
                           hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/50
                           transition-all duration-200"
                >
                  ← Návrat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center mt-8">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">
            Tvá kariéra začíná právě teď
          </p>
        </div>
      </div>
    </div>
  );
}