// scheduleHelpers.js - Helper funkce pro práci s rozlosováním

import { allMatches, teams } from './scheduleData';

// Parsování českého data do Date objektu
export const parseCzechDate = (dateStr) => {
  const months = {
    'ledna': 0, 'února': 1, 'března': 2, 'dubna': 3, 'května': 4, 'června': 5,
    'července': 6, 'srpna': 7, 'září': 8, 'října': 9, 'listopadu': 10, 'prosince': 11
  };
  
  const parts = dateStr.split(' ');
  const day = parseInt(parts[0].replace('.', ''));
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  
  return new Date(year, month, day);
};

// Najít příští zápas pro daný tým
export const getNextMatch = (teamId, currentDateStr) => {
  const currentDate = new Date(currentDateStr);
  currentDate.setHours(0, 0, 0, 0);
  
  // Získat zápasy týmu
  const teamMatches = allMatches.filter(match => 
    match.home === teamId || match.away === teamId
  );
  
  // Seřadit chronologicky
  const sortedMatches = teamMatches.sort((a, b) => {
    const dateA = parseCzechDate(a.date);
    const dateB = parseCzechDate(b.date);
    return dateA - dateB;
  });
  
  // Najít první zápas v budoucnosti nebo dnes
  const nextMatch = sortedMatches.find(match => {
    const matchDate = parseCzechDate(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= currentDate;
  });
  
  if (!nextMatch) return null;
  
  // Určit soupeře a zda je doma/venku
  const isHome = nextMatch.home === teamId;
  const opponentId = isHome ? nextMatch.away : nextMatch.home;
  const opponent = teams[opponentId];
  
  return {
    ...nextMatch,
    isHome,
    opponentId,
    opponentName: opponent.name,
    opponentEmoji: opponent.emoji,
    opponentLogo: opponent.logo,
    homeTeam: teams[nextMatch.home],
    awayTeam: teams[nextMatch.away]
  };
};

// Najít všechny zápasy týmu
export const getTeamMatches = (teamId) => {
  return allMatches
    .filter(match => match.home === teamId || match.away === teamId)
    .sort((a, b) => {
      const dateA = parseCzechDate(a.date);
      const dateB = parseCzechDate(b.date);
      return dateA - dateB;
    })
    .map(match => {
      const isHome = match.home === teamId;
      const opponentId = isHome ? match.away : match.home;
      const opponent = teams[opponentId];
      
      return {
        ...match,
        isHome,
        opponentId,
        opponentName: opponent.name,
        opponentEmoji: opponent.emoji
      };
    });
};

// Zjistit, zda je zápas v minulosti
export const isPastMatch = (matchDate, currentDateStr) => {
  const current = new Date(currentDateStr);
  const match = parseCzechDate(matchDate);
  
  current.setHours(0, 0, 0, 0);
  match.setHours(0, 0, 0, 0);
  
  return match < current;
};

// Zjistit, zda je zápas dnes
export const isMatchToday = (matchDate, currentDateStr) => {
  const current = new Date(currentDateStr);
  const match = parseCzechDate(matchDate);
  
  return (
    match.getDate() === current.getDate() &&
    match.getMonth() === current.getMonth() &&
    match.getFullYear() === current.getFullYear()
  );
};

// Formátovat datum pro zobrazení
export const formatMatchDate = (dateStr, includeDay = true) => {
  const date = parseCzechDate(dateStr);
  const options = includeDay 
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric' };
  
  const formatted = date.toLocaleDateString('cs-CZ', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Získat countdown do zápasu (ve dnech)
export const getDaysUntilMatch = (matchDate, currentDateStr) => {
  const current = new Date(currentDateStr);
  const match = parseCzechDate(matchDate);
  
  current.setHours(0, 0, 0, 0);
  match.setHours(0, 0, 0, 0);
  
  const diffTime = match - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
