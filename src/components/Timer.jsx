import React, { useState } from 'react';
import { Plus, Play, Book, Dumbbell, X, Moon, Briefcase, Clock } from 'lucide-react';
import { useGame } from './GameContext';
import Gym from './Gym';
import Reading from './Reading';
import Sleep from './Sleep';
import TimerRewards from './TimerRewards';

// Konstanty pro aktivity
const GYM_ENERGY_COST = 30;
const WORK_ENERGY_COST_PER_HOUR = 5;
const SLEEP_ENERGY_REGEN_PER_HOUR = 10;

export default function Timer({ currentTime, onTimeAdvance, playerData, onDateAdvance }) {
  const { changeEnergy, addActivityToHistory, saveDayStartSnapshot } = useGame();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showWorkAnimation, setShowWorkAnimation] = useState(false);
  const [showGymDialog, setShowGymDialog] = useState(false);
  const [showReadingDialog, setShowReadingDialog] = useState(false);
  const [showSleepDialog, setShowSleepDialog] = useState(false);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);
  const [rewardsData, setRewardsData] = useState(null);
  const [workingHour, setWorkingHour] = useState(13);

  const currentHour = parseInt(currentTime.split(':')[0]);
  const isWorkTime = currentHour >= 13 && currentHour < 22;

  const handlePlusClick = () => {
    // Pokud je pracovní doba, rovnou nastav aktivitu na "work"
    if (isWorkTime) {
      setSelectedActivity('work');
    } else {
      setShowActivityDialog(true);
    }
  };

  const handleActivitySelect = (activity) => {
    setShowActivityDialog(false);
    
    if (activity === 'sleep') {
      setShowSleepDialog(true);
    } else if (activity === 'gym') {
      setShowGymDialog(true);
    } else if (activity === 'read') {
      setShowReadingDialog(true);
    } else {
      setSelectedActivity(activity);
    }
  };

  const handlePlay = () => {
    // Pokud je práce, zobraz pracovní animaci
    if (selectedActivity === 'work' || isWorkTime) {
      setShowWorkAnimation(true);
      setWorkingHour(currentHour);
      
      // Animace postupného přetáčení času
      let hour = currentHour;
      const currentDate = playerData.startDate;
      const interval = setInterval(() => {
        hour++;
        setWorkingHour(hour);
        
        // Každou hodinu sebrat energii podle konfigurace
        changeEnergy(-WORK_ENERGY_COST_PER_HOUR);
        
        // Uložit aktivitu pro tuto hodinu
        addActivityToHistory(hour - 1, 'work', currentDate);
        
        if (hour >= 22) {
          clearInterval(interval);
          // Po dokončení práce nastav čas na 22:00
          setTimeout(() => {
            onTimeAdvance('22:00', 'work');
            setShowWorkAnimation(false);
            setSelectedActivity(null);
          }, 500);
        }
      }, 300); // Každých 300ms se posune o hodinu
    } else {
      // Uložit aktivitu pokud existuje
      if (selectedActivity) {
        addActivityToHistory(currentHour, selectedActivity, playerData.startDate);
      }
      
      // Normální posun o 1 hodinu
      const newHour = (currentHour + 1) % 24;
      const newTime = `${newHour.toString().padStart(2, '0')}:00`;
      
      // Pokud přejde přes půlnoc, posunout datum
      if (newHour === 0) {
        const newDate = new Date(playerData.startDate);
        newDate.setDate(newDate.getDate() + 1);
        onTimeAdvance(newTime, selectedActivity, newDate.toISOString().split('T')[0]);
      } else {
        onTimeAdvance(newTime, selectedActivity);
      }
      
      setSelectedActivity(null);
    }
  };

  // Handler pro dokončení posilovny
  const handleGymComplete = (result) => {
    setShowGymDialog(false);
    
    // Uložit aktivitu s detaily
    addActivityToHistory(currentHour, 'gym', playerData.startDate, result);
    
    // Posunout čas o 1 hodinu
    const newHour = (currentHour + 1) % 24;
    const newTime = `${newHour.toString().padStart(2, '0')}:00`;
    
    if (newHour === 0) {
      const newDate = new Date(playerData.startDate);
      newDate.setDate(newDate.getDate() + 1);
      onTimeAdvance(newTime, 'gym', newDate.toISOString().split('T')[0]);
    } else {
      onTimeAdvance(newTime, 'gym');
    }
  };

  // Handler pro dokončení čtení
  const handleReadingComplete = (result) => {
    setShowReadingDialog(false);
    
    // Uložit aktivity pro každou hodinu čtení
    for (let i = 0; i < result.duration; i++) {
      const hourToSave = (currentHour + i) % 24;
      let dateToSave = playerData.startDate;
      
      // Pokud přejdeme přes půlnoc, posunout datum
      if (currentHour + i >= 24) {
        const newDate = new Date(playerData.startDate);
        newDate.setDate(newDate.getDate() + 1);
        dateToSave = newDate.toISOString().split('T')[0];
      }
      
      addActivityToHistory(hourToSave, 'read', dateToSave);
    }
    
    // Posunout čas o vybranou délku
    const newHour = (currentHour + result.duration) % 24;
    const newTime = `${newHour.toString().padStart(2, '0')}:00`;
    
    if (currentHour + result.duration >= 24) {
      const newDate = new Date(playerData.startDate);
      newDate.setDate(newDate.getDate() + 1);
      onTimeAdvance(newTime, 'read', newDate.toISOString().split('T')[0]);
    } else {
      onTimeAdvance(newTime, 'read');
    }
  };

  // Handler pro dokončení spánku
  const handleSleepComplete = (finalTime, finalDate, result) => {
    setShowSleepDialog(false);
    
    // Zkontrolovat, jestli je nový den (přes půlnoc)
    const isNewDay = finalDate !== playerData.startDate;
    
    if (isNewDay) {
      // Uložit data pro rewards dialog
      setRewardsData({ finalTime, finalDate, result });
      
      // Zobrazit rewards dialog
      setShowRewardsDialog(true);
    } else {
      // Není nový den, jen normálně pokračovat
      onTimeAdvance(finalTime, 'sleep', finalDate);
    }
  };

  // Handler pro pokračování z rewards dialogu
  const handleRewardsContinue = () => {
    setShowRewardsDialog(false);
    
    // Spánek ukládá aktivity sám během animace v Sleep.jsx
    // Stačí jen posunout čas
    if (rewardsData) {
      onTimeAdvance(rewardsData.finalTime, 'sleep', rewardsData.finalDate);
      setRewardsData(null);
      
      // Uložit nový snapshot pro nový den
      saveDayStartSnapshot();
    }
  };

  const activities = [
    { id: 'read', name: 'Číst knihu', icon: Book, color: 'blue' },
    { id: 'gym', name: 'Jít do posilovny', icon: Dumbbell, color: 'red' },
    { id: 'sleep', name: 'Jít spát', icon: Moon, color: 'purple' }
  ];

  return (
    <>
      {/* VERTIKÁLNÍ TIME BAR */}
      <div className="w-16 bg-slate-950/80 border-r border-slate-700 flex flex-col">
        {Array.from({ length: 24 }, (_, i) => {
          const hour = i;
          const isCurrentHour = hour === currentHour;
          const isFreeTime = hour >= 8 && hour < 13;
          const isWorkTime = hour >= 13 && hour < 22;
          const isSleep = hour >= 0 && hour < 8;
          
          // Zkontrolovat historii aktivit
          const activityHistory = playerData?.activityHistory || [];
          const activityForThisHour = activityHistory.find(
            a => a.hour === hour && a.date === playerData.startDate
          );
          const hasActivity = !!activityForThisHour;
          
          return (
            <div
              key={hour}
              className={`flex-1 border-b border-slate-800/50 flex items-center justify-center relative
                ${isCurrentHour ? 'bg-blue-500/40 border-blue-400' : ''}
                ${isFreeTime && !isCurrentHour && !hasActivity ? 'bg-green-500/10' : ''}
                ${isWorkTime && !isCurrentHour && !hasActivity ? 'bg-orange-500/20' : ''}
                ${hasActivity && !isCurrentHour ? 'bg-gray-800/50' : ''}
              `}
            >
              <span className={`text-xs font-bold
                ${isCurrentHour ? 'text-blue-300' : ''}
                ${isFreeTime && !isCurrentHour && !hasActivity ? 'text-green-400' : ''}
                ${isWorkTime && !isCurrentHour && !hasActivity ? 'text-orange-400' : ''}
                ${hasActivity && !isCurrentHour ? 'text-gray-500' : ''}
                ${!isFreeTime && !isWorkTime && !isCurrentHour && !hasActivity ? 'text-gray-600' : ''}
              `}>
                {hour.toString().padStart(2, '0')}
              </span>
              {isCurrentHour && (
                <>
                  <div className="absolute left-0 w-1 h-full bg-blue-400"></div>
                  
                  {/* Pokud není vybraná aktivita, zobrazit plus */}
                  {!selectedActivity && (
                    <button
                      onClick={handlePlusClick}
                      className="absolute right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center
                               hover:bg-green-400 transition-all hover:scale-110 animate-pulse"
                    >
                      <Plus size={14} className="text-white" />
                    </button>
                  )}
                  
                  {/* Pokud je vybraná aktivita, zobrazit ikonu + play */}
                  {selectedActivity && (
                    <div className="absolute right-0 flex flex-col gap-1">
                      {selectedActivity === 'read' && (
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                          <Book size={12} className="text-white" />
                        </div>
                      )}
                      {selectedActivity === 'gym' && (
                        <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                          <Dumbbell size={12} className="text-white" />
                        </div>
                      )}
                      {selectedActivity === 'work' && (
                        <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                          <Briefcase size={12} className="text-white" />
                        </div>
                      )}
                      {selectedActivity === 'sleep' && (
                        <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                          <Moon size={12} className="text-white" />
                        </div>
                      )}
                      <button
                        onClick={handlePlay}
                        className="w-5 h-5 bg-green-500 rounded flex items-center justify-center
                                 hover:bg-green-400 transition-all hover:scale-110 animate-pulse"
                      >
                        <Play size={12} className="text-white" />
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {/* Ikony pro dokončené aktivity */}
              {!isCurrentHour && hasActivity && activityForThisHour && (
                <div className="absolute left-1">
                  {activityForThisHour.activity === 'work' && (
                    <Briefcase size={10} className="text-orange-400 opacity-60" />
                  )}
                  {activityForThisHour.activity === 'gym' && (
                    <Dumbbell size={10} className="text-red-400 opacity-60" />
                  )}
                  {activityForThisHour.activity === 'read' && (
                    <Book size={10} className="text-blue-400 opacity-60" />
                  )}
                  {activityForThisHour.activity === 'sleep' && (
                    <Moon size={10} className="text-purple-400 opacity-60" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DIALOG VÝBĚRU AKTIVITY */}
      {showActivityDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-blue-500/50 shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowActivityDialog(false);
                setSelectedActivity(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Co chceš dělat?
              </h2>
              <p className="text-gray-400">
                Aktuální čas: <span className="text-blue-300 font-bold">{currentTime}</span>
              </p>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activity.icon;
                
                return (
                  <button
                    key={activity.id}
                    onClick={() => handleActivitySelect(activity.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                      bg-slate-700/30 border-slate-600 hover:border-${activity.color}-500 hover:bg-slate-700/50 hover:scale-105`}
                  >
                    <div className={`w-12 h-12 bg-${activity.color}-500/30 rounded-full flex items-center justify-center`}>
                      <Icon size={24} className={`text-${activity.color}-400`} />
                    </div>
                    <span className="text-white font-medium text-lg">{activity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* NOVÉ KOMPONENTY PRO AKTIVITY */}
      {showGymDialog && (
        <Gym 
          onComplete={handleGymComplete}
          onCancel={() => setShowGymDialog(false)}
          currentTime={currentTime}
        />
      )}

      {showReadingDialog && (
        <Reading 
          onComplete={handleReadingComplete}
          onCancel={() => setShowReadingDialog(false)}
          currentTime={currentTime}
        />
      )}

      {showSleepDialog && (
        <Sleep 
          onSleep={handleSleepComplete}
          onCancel={() => setShowSleepDialog(false)}
          currentTime={currentTime}
          currentHour={currentHour}
          playerData={playerData}
          onDateAdvance={onDateAdvance}
        />
      )}

      {/* PRACOVNÍ OKNO S ANIMACÍ */}
      {showWorkAnimation && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-orange-900 to-slate-900 rounded-3xl border-4 border-orange-500 shadow-2xl p-12 text-center">
            <div className="mb-8">
              <div className="w-32 h-32 bg-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Briefcase size={64} className="text-orange-400" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Mákáš o 100% 💪
              </h1>
              <p className="text-gray-300 text-xl">
                Pracovní doba probíhá...
              </p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6 border border-orange-500/30">
              <div className="text-orange-300 text-6xl font-bold mb-2">
                {workingHour.toString().padStart(2, '0')}:00
              </div>
              <div className="text-gray-400 text-sm">
                {22 - workingHour} hodin do konce směny
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REWARDS DIALOG */}
      {showRewardsDialog && rewardsData && (
        <TimerRewards 
          onContinue={handleRewardsContinue}
          onCancel={handleRewardsContinue}
        />
      )}
    </>
  );
}
