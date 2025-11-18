import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [playerData, setPlayerData] = useState(null);

  // Načíst data při inicializaci
  useEffect(() => {
    loadFromSession();
  }, []);

  // Načíst data ze sessionStorage
  const loadFromSession = () => {
    const data = sessionStorage.getItem('playerData');
    if (data) {
      const parsedData = JSON.parse(data);
      
      // Inicializovat chybějící hodnoty
      if (!parsedData.level) {
        parsedData.level = 1;
        parsedData.xp = 0;
      }
      
      if (!parsedData.energy) {
        parsedData.energy = 100;
      }
      
      if (!parsedData.psyche) {
        parsedData.psyche = 100;
      }
      
      if (!parsedData.currentTime) {
        parsedData.currentTime = '08:00';
      }
      
      if (!parsedData.team) {
        parsedData.team = 'lancers';
      }
      
      if (!parsedData.attributes) {
        parsedData.attributes = {
          leadership: { level: 1, xp: 0 },
          tactics: { level: 1, xp: 0 },
          motivation: { level: 1, xp: 0 },
          negotiation: { level: 1, xp: 0 },
          fitness: { level: 1, xp: 0 },
          prestige: { level: 1, xp: 0 }
        };
      } else {
        // Konverze staré struktury na novou
        Object.keys(parsedData.attributes).forEach(key => {
          if (typeof parsedData.attributes[key] === 'number') {
            parsedData.attributes[key] = { level: parsedData.attributes[key], xp: 0 };
          }
        });
      }
      
      if (!parsedData.skills) {
        parsedData.skills = {
          speed: { level: 1, xp: 0 },
          acceleration: { level: 1, xp: 0 },
          stamina: { level: 1, xp: 0 },
          strength: { level: 1, xp: 0 },
          shooting: { level: 1, xp: 0 },
          passing: { level: 1, xp: 0 },
          puckControl: { level: 1, xp: 0 },
          stealing: { level: 1, xp: 0 },
          checking: { level: 1, xp: 0 },
          skatingTechnique: { level: 1, xp: 0 },
          braking: { level: 1, xp: 0 },
          stability: { level: 1, xp: 0 }
        };
      } else {
        // Konverze staré struktury na novou
        Object.keys(parsedData.skills).forEach(key => {
          if (typeof parsedData.skills[key] === 'number') {
            parsedData.skills[key] = { level: parsedData.skills[key], xp: 0 };
          }
        });
      }
      
      if (!parsedData.stats) {
        parsedData.stats = {
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          tournaments: 0
        };
      }
      
      if (!parsedData.activityHistory) {
        parsedData.activityHistory = [];
      }
      
      sessionStorage.setItem('playerData', JSON.stringify(parsedData));
      setPlayerData(parsedData);
    }
  };

  // Uložit data do sessionStorage
  const saveToSession = (data) => {
    sessionStorage.setItem('playerData', JSON.stringify(data));
  };

  // Aktualizovat playerData
  const updatePlayerData = (updates) => {
    setPlayerData(prev => {
      const updated = { ...prev, ...updates };
      saveToSession(updated);
      return updated;
    });
  };

  // Změnit energii
  const changeEnergy = (amount) => {
    setPlayerData(prev => {
      const newEnergy = Math.max(0, Math.min(100, (prev.energy || 100) + amount));
      const updated = { ...prev, energy: newEnergy };
      saveToSession(updated);
      return updated;
    });
  };

  // Změnit psychiku
  const changePsyche = (amount) => {
    setPlayerData(prev => {
      const newPsyche = Math.max(0, Math.min(100, (prev.psyche || 100) + amount));
      const updated = { ...prev, psyche: newPsyche };
      saveToSession(updated);
      return updated;
    });
  };

  // Aktualizovat skills
  const updateSkills = (skillUpdates) => {
    setPlayerData(prev => {
      const currentSkills = prev.skills || {};
      const updatedSkills = { ...currentSkills };
      
      Object.keys(skillUpdates).forEach(skill => {
        updatedSkills[skill] = (currentSkills[skill] || 1) + skillUpdates[skill];
      });
      
      const updated = { ...prev, skills: updatedSkills };
      saveToSession(updated);
      return updated;
    });
  };

  // Přidat XP k atributu
  const addAttributeXP = (attributeName, xpAmount) => {
    setPlayerData(prev => {
      const currentAttr = prev.attributes[attributeName] || { level: 1, xp: 0 };
      let newLevel = currentAttr.level;
      let newXP = currentAttr.xp + xpAmount;
      
      // Výpočet XP pro další level: 10 + (level - 1) * 2
      let xpNeeded = 10 + (newLevel - 1) * 2;
      
      // Level up pokud máme dost XP
      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel++;
        xpNeeded = 10 + (newLevel - 1) * 2;
      }
      
      const updated = {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeName]: { level: newLevel, xp: newXP }
        }
      };
      saveToSession(updated);
      return updated;
    });
  };

  // Přidat XP k skillu
  const addSkillXP = (skillName, xpAmount) => {
    setPlayerData(prev => {
      const currentSkill = prev.skills[skillName] || { level: 1, xp: 0 };
      let newLevel = currentSkill.level;
      let newXP = currentSkill.xp + xpAmount;
      
      // Výpočet XP pro další level: 10 + (level - 1) * 2
      let xpNeeded = 10 + (newLevel - 1) * 2;
      
      // Level up pokud máme dost XP
      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel++;
        xpNeeded = 10 + (newLevel - 1) * 2;
      }
      
      const updated = {
        ...prev,
        skills: {
          ...prev.skills,
          [skillName]: { level: newLevel, xp: newXP }
        }
      };
      saveToSession(updated);
      return updated;
    });
  };

  // Nastavit čas
  const setTime = (newTime, newDate = null) => {
    setPlayerData(prev => {
      const updated = { ...prev, currentTime: newTime };
      if (newDate) {
        updated.startDate = newDate;
      }
      saveToSession(updated);
      return updated;
    });
  };

  // Přidat aktivitu do historie
  const addActivityToHistory = (hour, activity, date, details = null) => {
    setPlayerData(prev => {
      const history = prev.activityHistory || [];
      const updated = { 
        ...prev, 
        activityHistory: [...history, { hour, activity, date, details }]
      };
      saveToSession(updated);
      return updated;
    });
  };

  // Uložit snapshot na začátku dne
  const saveDayStartSnapshot = () => {
    setPlayerData(prev => {
      const updated = {
        ...prev,
        dayStartSnapshot: {
          energy: prev.energy || 100,
          psyche: prev.psyche || 100,
          level: prev.level || 1,
          xp: prev.xp || 0
        }
      };
      saveToSession(updated);
      return updated;
    });
  };

  const value = {
    playerData,
    updatePlayerData,
    changeEnergy,
    changePsyche,
    updateSkills,
    addAttributeXP,
    addSkillXP,
    setTime,
    loadFromSession,
    addActivityToHistory,
    saveDayStartSnapshot
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
