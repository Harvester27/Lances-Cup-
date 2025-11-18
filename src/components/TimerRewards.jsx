import React, { useState, useEffect } from 'react';
import { Trophy, X, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useGame } from './GameContext';

export default function TimerRewards({ onContinue, onCancel }) {
  const { playerData } = useGame();
  const [animatedValues, setAnimatedValues] = useState({});
  const [xpAnimations, setXpAnimations] = useState({});
  const [energyAnimationPhase, setEnergyAnimationPhase] = useState(0);
  const [animatedEnergy, setAnimatedEnergy] = useState(0);
  
  const dayStartSnapshot = playerData?.dayStartSnapshot;

  useEffect(() => {
    const startEnergy = dayStartSnapshot?.energy || 100;
    const afterSpending = startEnergy - (totalEnergyCost || 0);
    const finalEnergy = playerData?.energy || 100;
    
    // Nastavit počáteční hodnotu
    setAnimatedEnergy(startEnergy);
    
    setTimeout(() => {
      setAnimatedValues({
        energy: true,
        gains: true
      });
      setEnergyAnimationPhase(1);
      
      // Animace poklesu energie
      const dropDuration = 600; // ms
      const dropSteps = 30;
      const dropInterval = dropDuration / dropSteps;
      const dropPerStep = (startEnergy - afterSpending) / dropSteps;
      
      let currentStep = 0;
      const dropTimer = setInterval(() => {
        currentStep++;
        const newValue = startEnergy - (dropPerStep * currentStep);
        setAnimatedEnergy(Math.max(afterSpending, newValue));
        
        if (currentStep >= dropSteps) {
          clearInterval(dropTimer);
          setAnimatedEnergy(afterSpending);
        }
      }, dropInterval);
    }, 300);

    // Druhá fáze: regenerace energie
    setTimeout(() => {
      setEnergyAnimationPhase(2);
      
      const afterSpending = startEnergy - (totalEnergyCost || 0);
      const riseDuration = 600; // ms
      const riseSteps = 30;
      const riseInterval = riseDuration / riseSteps;
      const risePerStep = (finalEnergy - afterSpending) / riseSteps;
      
      let currentStep = 0;
      const riseTimer = setInterval(() => {
        currentStep++;
        const newValue = afterSpending + (risePerStep * currentStep);
        setAnimatedEnergy(Math.min(finalEnergy, newValue));
        
        if (currentStep >= riseSteps) {
          clearInterval(riseTimer);
          setAnimatedEnergy(finalEnergy);
        }
      }, riseInterval);
    }, 1200);

    // Spustit XP animace po 2000ms
    setTimeout(() => {
      const animations = {};
      Object.keys(calculateGainedXP().totalXP).forEach(skill => {
        animations[skill] = true;
      });
      setXpAnimations(animations);
    }, 2000);
  }, []);

  const getYesterdayDate = () => {
    const today = new Date(playerData.startDate);
    today.setDate(today.getDate() - 1);
    return today.toISOString().split('T')[0];
  };

  const calculateGainedXP = () => {
    const yesterdayDate = getYesterdayDate();
    const activityHistory = playerData?.activityHistory || [];
    
    const yesterdayActivities = activityHistory.filter(
      a => a.date === yesterdayDate && a.details && a.details.skillGains
    );
    
    const sleepActivities = activityHistory.filter(
      a => a.date === yesterdayDate && a.details && a.details.energyGained
    );
    
    const workActivities = activityHistory.filter(
      a => a.date === yesterdayDate && a.activity === 'work'
    );
    
    const totalXP = {};
    let totalEnergyCost = 0;
    let totalEnergyGained = 0;
    
    yesterdayActivities.forEach(activity => {
      const gains = activity.details.skillGains;
      Object.keys(gains).forEach(skill => {
        totalXP[skill] = (totalXP[skill] || 0) + (gains[skill] || 0);
      });
      
      totalEnergyCost += (activity.details.energyCost || 0);
    });
    
    // Práce: 5 energie za hodinu
    totalEnergyCost += workActivities.length * 5;
    
    sleepActivities.forEach(activity => {
      totalEnergyGained += (activity.details.energyGained || 0);
    });
    
    return { totalXP, totalEnergyCost, totalEnergyGained, activitiesCount: yesterdayActivities.length };
  };

  const { totalXP, totalEnergyCost, totalEnergyGained, activitiesCount } = calculateGainedXP();

  const skillNames = {
    strength: 'Síla',
    speed: 'Rychlost',
    acceleration: 'Zrychlení',
    stamina: 'Výdrž',
    shooting: 'Střelba',
    passing: 'Přihrávky',
    puckControl: 'Puk Control',
    stealing: 'Kradení',
    checking: 'Checking'
  };

  // Komponenta pro Energy bar
  const EnergyBar = () => {
    const startEnergy = dayStartSnapshot?.energy || 100;
    const afterSpending = startEnergy - totalEnergyCost;
    const currentEnergy = playerData?.energy || 100;
    
    const displayPercent = (animatedEnergy / 100) * 100;
    const displayValue = Math.round(animatedEnergy);
    
    let barColor = 'from-green-600 to-green-400';
    if (energyAnimationPhase === 1) {
      barColor = 'from-red-600 to-red-400';
    } else if (energyAnimationPhase === 2) {
      barColor = 'from-green-600 to-green-400';
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium flex items-center gap-2">
            <Zap size={20} className="text-green-400" />
            Energie
          </span>
          <div className="flex items-center gap-2">
            {energyAnimationPhase === 0 && (
              <span className="text-gray-300 text-sm">{startEnergy}</span>
            )}
            {energyAnimationPhase === 1 && totalEnergyCost > 0 && (
              <>
                <span className="text-gray-500 line-through text-sm">{startEnergy}</span>
                <span className="text-red-400 font-bold text-sm">-{totalEnergyCost}</span>
              </>
            )}
            {energyAnimationPhase === 2 && (
              <>
                <span className="text-gray-500 line-through text-sm">{afterSpending}</span>
                <span className="text-green-400 font-bold text-sm">+{totalEnergyGained}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Energy Bar */}
        <div className="relative h-6 bg-slate-900/50 rounded-full overflow-hidden border border-green-500/30">
          {/* Progress bar */}
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${barColor} transition-all duration-100 ease-linear`}
            style={{ 
              width: `${displayPercent}%`
            }}
          />
          
          {/* Shine effect */}
          {energyAnimationPhase > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
          
          {/* Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold drop-shadow-lg">
              {displayValue} / 100
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Komponenta pro XP bar
  const XPBar = ({ skill, gainedXP }) => {
    const skillData = playerData?.skills?.[skill] || { level: 1, xp: 0 };
    const currentLevel = skillData.level;
    const currentXP = skillData.xp;
    const xpNeeded = 10 + (currentLevel - 1) * 2;
    
    // Vypočítat předchozí XP (před získáním)
    const previousXP = currentXP - gainedXP;
    
    // Procenta
    const previousPercent = Math.max(0, (previousXP / xpNeeded) * 100);
    const currentPercent = Math.min(100, (currentXP / xpNeeded) * 100);
    
    const isAnimated = xpAnimations[skill];

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">{skillNames[skill]}</span>
          <div className="flex items-center gap-2">
            <span className="text-purple-300 text-sm">Level {currentLevel}</span>
            <span className={`text-green-400 font-bold text-sm transition-all duration-500 ${
              isAnimated ? 'scale-110' : 'scale-0'
            }`}>
              +{gainedXP} XP
            </span>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="relative h-6 bg-slate-900/50 rounded-full overflow-hidden border border-purple-500/30">
          {/* Progress bar */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
            style={{ 
              width: `${isAnimated ? currentPercent : previousPercent}%`
            }}
          />
          
          {/* Shine effect */}
          {isAnimated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
          
          {/* Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold drop-shadow-lg">
              {currentXP} / {xpNeeded} XP
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8">
      <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-2xl w-full p-6 relative overflow-hidden">
        
        {/* Sparkles effect */}
        <div className="absolute top-4 left-4 text-yellow-400 animate-pulse">
          <Sparkles size={24} />
        </div>
        <div className="absolute top-8 right-8 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }}>
          <Sparkles size={20} />
        </div>
        <div className="absolute bottom-8 left-8 text-yellow-400 animate-pulse" style={{ animationDelay: '0.6s' }}>
          <Sparkles size={16} />
        </div>

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Trophy size={40} className="text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Výsledky dne
          </h2>
          <p className="text-gray-400">
            {playerData?.name || 'Hráč'}
          </p>
        </div>

        {/* Level */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-purple-500/30">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={24} className="text-purple-400" />
            <span className="text-white text-xl">Level:</span>
            <span className="text-purple-300 text-2xl font-bold">{playerData?.level || 1}</span>
          </div>
        </div>

        {/* Energy bar */}
        {dayStartSnapshot && (totalEnergyCost > 0 || totalEnergyGained > 0) && (
          <div className={`bg-slate-800/50 rounded-lg p-4 mb-4 border border-green-500/30 transition-all duration-500 ${
            animatedValues.energy ? 'scale-105 border-green-500' : ''
          }`}>
            <EnergyBar />
          </div>
        )}

        {/* Získané zkušenosti s XP bary */}
        {Object.keys(totalXP).length > 0 && (
          <div className={`bg-slate-800/50 rounded-lg p-4 mb-4 border border-purple-500/30 transition-all duration-500 ${
            animatedValues.gains ? 'scale-105 border-purple-500' : ''
          }`}>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              Získané zkušenosti:
            </h3>
            
            {Object.keys(totalXP).map(skill => (
              <XPBar key={skill} skill={skill} gainedXP={totalXP[skill]} />
            ))}
            
            {activitiesCount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <span className="text-gray-500 text-sm">
                  {activitiesCount} {activitiesCount === 1 ? 'trénink' : activitiesCount < 5 ? 'tréninky' : 'tréninků'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pokud nebyly žádné aktivity */}
        {Object.keys(totalXP).length === 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
            <p className="text-gray-400 text-center">
              Včera jsi netrénoval
            </p>
          </div>
        )}

        {/* Tlačítko Pokračovat */}
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2
                   bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 
                   text-white transition-all hover:scale-105 shadow-lg"
        >
          <Trophy size={20} />
          <span>POKRAČOVAT</span>
        </button>
      </div>
    </div>
  );
}
