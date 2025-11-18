import React, { useState } from 'react';
import { Moon, X, Clock, Brain } from 'lucide-react';
import { useGame } from './GameContext';

export default function Sleep({ onSleep, onCancel, currentTime, currentHour, playerData, onDateAdvance }) {
  const { changeEnergy, addActivityToHistory } = useGame();
  const [alarmTime, setAlarmTime] = useState(8);
  const [sleepingHour, setSleepingHour] = useState(0);
  const [showSleepAnimation, setShowSleepAnimation] = useState(false);

  // Vypočítat kvalitu spánku podle psychiky
  const getSleepQuality = (psyche) => {
    if (psyche >= 80) {
      return {
        name: 'Výborný',
        color: 'green',
        regenPerHour: 12,
        emoji: '😴',
        description: 'Tvá mysl je v klidu, spíš jako miminko'
      };
    } else if (psyche >= 50) {
      return {
        name: 'Dobrý',
        color: 'blue',
        regenPerHour: 10,
        emoji: '😊',
        description: 'Klidný spánek, nic tě netrápí'
      };
    } else if (psyche >= 20) {
      return {
        name: 'Špatný',
        color: 'yellow',
        regenPerHour: 7,
        emoji: '😐',
        description: 'Neklidný spánek, točíš se v posteli'
      };
    } else {
      return {
        name: 'Mizerný',
        color: 'red',
        regenPerHour: 4,
        emoji: '😫',
        description: 'Skoro nespíš, mysl tě trápí'
      };
    }
  };

  const sleepQuality = getSleepQuality(playerData.psyche || 100);

  const startSleep = (wakeUpHour, useAlarm) => {
    setShowSleepAnimation(true);
    setSleepingHour(currentHour);
    
    let hour = currentHour;
    let newDate = new Date(playerData.startDate);
    let currentDateStr = playerData.startDate;
    let passedMidnight = false;
    
    const interval = setInterval(() => {
      // Uložit aktivitu pro aktuální hodinu před posunem
      addActivityToHistory(hour, 'sleep', currentDateStr);
      
      hour++;
      
      // Každou hodinu regenerovat energii podle kvality spánku
      changeEnergy(sleepQuality.regenPerHour);
      
      // Pokud přesáhne půlnoc, posunout den
      if (hour >= 24) {
        hour = 0;
        passedMidnight = true;
        newDate.setDate(newDate.getDate() + 1);
        currentDateStr = newDate.toISOString().split('T')[0];
        // Aktualizovat datum hned při přechodu
        if (onDateAdvance) {
          onDateAdvance(currentDateStr);
        }
      }
      
      setSleepingHour(hour);
      
      // Probudit se až po půlnoci a když je správný čas
      if (hour >= wakeUpHour && (currentHour < wakeUpHour || passedMidnight)) {
        clearInterval(interval);
        
        const hoursSlept = passedMidnight 
          ? (24 - currentHour) + hour 
          : hour - currentHour;
        
        setTimeout(() => {
          const finalTime = `${hour.toString().padStart(2, '0')}:00`;
          const finalDate = newDate.toISOString().split('T')[0];
          
          // Ukázat shrnutí spánku
          showSleepSummary(hoursSlept, sleepQuality);
          
          setTimeout(() => {
            onSleep(finalTime, finalDate, {
              duration: hoursSlept,
              quality: sleepQuality.name,
              energyGained: hoursSlept * sleepQuality.regenPerHour
            });
            setShowSleepAnimation(false);
          }, 3000);
        }, 500);
      }
    }, 300);
  };

  const showSleepSummary = (hoursSlept, quality) => {
    // Tato funkce jen změní stav animace na "summary"
    // Shrnutí se ukáže v animaci
  };

  const handleSleepWithAlarm = () => {
    startSleep(alarmTime, true);
  };

  const handleSleepWithoutAlarm = () => {
    startSleep(8, false);
  };

  return (
    <>
      {/* DIALOG NASTAVENÍ SPÁNKU */}
      {!showSleepAnimation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Moon size={40} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Jít spát
              </h2>
              <p className="text-gray-400">
                Aktuální čas: <span className="text-purple-300 font-bold">{currentTime}</span>
              </p>
            </div>

            {/* Kvalita spánku */}
            <div className={`mb-6 p-4 rounded-lg border-2 border-${sleepQuality.color}-500/50 bg-${sleepQuality.color}-500/10`}>
              <div className="flex items-center gap-3 mb-2">
                <Brain size={24} className={`text-${sleepQuality.color}-400`} />
                <div>
                  <div className="text-white font-bold">Kvalita spánku: {sleepQuality.name}</div>
                  <div className="text-gray-400 text-sm">
                    Psychika: <span className={`text-${sleepQuality.color}-300 font-bold`}>{playerData.psyche || 100}</span>
                  </div>
                </div>
                <div className="text-3xl ml-auto">{sleepQuality.emoji}</div>
              </div>
              <div className="text-gray-300 text-sm">{sleepQuality.description}</div>
              <div className={`text-${sleepQuality.color}-300 text-sm font-bold mt-2`}>
                +{sleepQuality.regenPerHour} energie za hodinu spánku
              </div>
            </div>

            {/* Nastavení budíku */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Nastavit budík na:
              </label>
              <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-4 border border-purple-500/30">
                <Clock size={24} className="text-purple-400" />
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(parseInt(e.target.value))}
                  className="flex-1 bg-transparent text-white text-2xl font-bold text-center outline-none"
                />
                <span className="text-white text-2xl font-bold">:00</span>
              </div>
            </div>

            {/* Tlačítka */}
            <div className="space-y-3">
              <button
                onClick={handleSleepWithAlarm}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500
                         text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2
                         transition-all hover:scale-105 shadow-lg"
              >
                <Clock size={20} />
                <span>S BUDÍKEM ({alarmTime.toString().padStart(2, '0')}:00)</span>
              </button>

              <button
                onClick={handleSleepWithoutAlarm}
                className="w-full bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600
                         text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2
                         transition-all"
              >
                <Moon size={20} />
                <span>BEZ BUDÍKU (do 08:00)</span>
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
      )}

      {/* SPACÍ ANIMACE */}
      {showSleepAnimation && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-3xl border-4 border-purple-500 shadow-2xl p-12 text-center">
            <div className="mb-8">
              <div className="w-32 h-32 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Moon size={64} className="text-purple-400" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                {sleepQuality.emoji} Dobrou noc
              </h1>
              <p className="text-gray-300 text-xl mb-2">
                Kvalita spánku: <span className={`text-${sleepQuality.color}-300 font-bold`}>{sleepQuality.name}</span>
              </p>
              <p className="text-gray-400">
                {sleepQuality.description}
              </p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/30">
              <div className="text-purple-300 text-6xl font-bold mb-2">
                {sleepingHour.toString().padStart(2, '0')}:00
              </div>
              <div className="text-gray-400 text-sm">
                Spíš...
              </div>
              <div className={`text-${sleepQuality.color}-300 text-sm font-bold mt-2`}>
                +{sleepQuality.regenPerHour} energie/hod
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
