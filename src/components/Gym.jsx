import React, { useState } from 'react';
import { Dumbbell, X, Zap, Activity } from 'lucide-react';
import { useGame } from './GameContext';

export default function Gym({ onComplete, onCancel, currentTime }) {
  const { changeEnergy, addSkillXP, playerData } = useGame();
  const [selectedIntensity, setSelectedIntensity] = useState(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  const intensities = [
    { 
      id: 'light', 
      name: 'Lehká', 
      energyCost: 20,
      color: 'green',
      description: 'Rozcvičení a lehké cviky'
    },
    { 
      id: 'medium', 
      name: 'Střední', 
      energyCost: 30,
      color: 'yellow',
      description: 'Standardní trénink'
    },
    { 
      id: 'intense', 
      name: 'Intenzivní', 
      energyCost: 40,
      color: 'red',
      description: 'Tvrdý trénink na maximum'
    }
  ];

  const bodyParts = [
    { id: 'legs', name: 'Nohy', emoji: '🦵' },
    { id: 'chest', name: 'Hruď', emoji: '💪' },
    { id: 'back', name: 'Záda', emoji: '🏋️' },
    { id: 'shoulders', name: 'Ramena', emoji: '🤸' },
    { id: 'arms', name: 'Ruce', emoji: '💪' }
  ];

  const handleStart = () => {
    if (!selectedIntensity || !selectedBodyPart) return;

    const intensity = intensities.find(i => i.id === selectedIntensity);
    
    // Určit skill gain podle intenzity
    const skillGain = selectedIntensity === 'light' ? 1 : selectedIntensity === 'medium' ? 2 : 3;
    
    // Odečíst energii
    changeEnergy(-intensity.energyCost);
    
    // Zvýšit strength XP
    addSkillXP('strength', skillGain);

    // Vrátit výsledek Timeru
    onComplete({
      duration: 1,
      intensity: selectedIntensity,
      bodyPart: selectedBodyPart,
      energyCost: intensity.energyCost,
      skillGains: { strength: skillGain }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-gradient-to-br from-red-900 to-slate-900 rounded-2xl border-2 border-red-500/50 shadow-2xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Posilovna
          </h2>
          <p className="text-gray-400">
            Aktuální čas: <span className="text-red-300 font-bold">{currentTime}</span>
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Zap size={16} className="text-green-400" />
            <span className="text-white">Energie: <span className="font-bold text-green-300">{playerData.energy}</span></span>
          </div>
        </div>

        {/* Výběr intenzity */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Activity size={20} className="text-red-400" />
            Vyber intenzitu tréninku:
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {intensities.map((intensity) => (
              <button
                key={intensity.id}
                onClick={() => setSelectedIntensity(intensity.id)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105
                  ${selectedIntensity === intensity.id 
                    ? `border-${intensity.color}-500 bg-${intensity.color}-500/30` 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}
              >
                <div className="text-white font-bold mb-1">{intensity.name}</div>
                <div className="text-gray-400 text-sm mb-2">{intensity.description}</div>
                <div className="text-red-300 text-xs font-bold">-{intensity.energyCost} energie</div>
              </button>
            ))}
          </div>
        </div>

        {/* Výběr části těla */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Vyber část těla:</h3>
          <div className="grid grid-cols-5 gap-2">
            {bodyParts.map((part) => (
              <button
                key={part.id}
                onClick={() => setSelectedBodyPart(part.id)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105
                  ${selectedBodyPart === part.id 
                    ? 'border-red-500 bg-red-500/30' 
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}
              >
                <div className="text-3xl mb-1">{part.emoji}</div>
                <div className="text-white text-sm font-medium">{part.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tlačítka */}
        <div className="space-y-3">
          <button
            onClick={handleStart}
            disabled={!selectedIntensity || !selectedBodyPart}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2
              transition-all ${selectedIntensity && selectedBodyPart
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white hover:scale-105'
                : 'bg-slate-700/50 text-gray-500 cursor-not-allowed'}`}
          >
            <Dumbbell size={20} />
            <span>ZAČÍT TRÉNINK</span>
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
