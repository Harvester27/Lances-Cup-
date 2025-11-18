// GameDashboard.jsx - UPRAVENÁ VERZE
// Změna: Tlačítko "Hrát zápas" nyní naviguje na /match kde se zobrazí 3D hřiště

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Wallet, User, Play, Award, Trophy, Clock, Briefcase, Dumbbell, ShoppingBag, X, Map, Target, MapPin } from 'lucide-react';
import { getNextMatch, formatMatchDate, isMatchToday, getDaysUntilMatch } from './scheduleHelpers';
import Timer from './Timer';
import { useGame } from './GameContext';

export default function GameDashboard() {
  const navigate = useNavigate();
  const { playerData, setTime } = useGame();
  const [showWorkDialog, setShowWorkDialog] = useState(false);
  const [nextMatch, setNextMatch] = useState(null);

  useEffect(() => {
    if (!playerData) {
      navigate('/setup');
      return;
    }
    
    // Načíst příští zápas
    const match = getNextMatch(playerData.team, playerData.startDate);
    setNextMatch(match);
  }, [playerData, navigate]);

  const handleSaveGame = () => {
    navigate('/save-load');
  };

  const handleWorkClick = () => {
    // Zkontrolovat čas - práce je ve 13:00
    const currentHour = parseInt(playerData.currentTime.split(':')[0]);
    
    if (currentHour < 13) {
      // Je ještě brzy!
      setShowWorkDialog(true);
    } else {
      // Jít do práce
      navigate('/prace');
    }
  };

  const handleGym = () => {
    setShowWorkDialog(false);
    alert('💪 Jdeš do posilovny... (posilovna bude přidána později)');
  };

  const handleShopping = () => {
    setShowWorkDialog(false);
    alert('🛍️ Jdeš nakupovat... (obchod bude přidán později)');
  };

  const handleTimeAdvance = (newTime, activity, newDate) => {
    setTime(newTime, newDate);
  };

  const handleDateAdvance = (newDate) => {
    setTime(playerData.currentTime, newDate);
  };

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  // Formátování data s dnem v týdnu
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('cs-CZ', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('cs-CZ', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    // První písmeno dne velkým
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return { dayName: capitalizedDay, formattedDate };
  };

  // Formátování peněz
  const formatMoney = (amount) => {
    return amount.toLocaleString('cs-CZ') + ' Kč';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* HORNÍ LIŠTA - přes celou šířku */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Levá strana - Info o hráči */}
            <div className="flex items-center gap-8">
              {/* Jméno manažera + Level - KLIKATELNÉ! */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                  <User size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Dělník</div>
                  <div className="text-white font-bold group-hover:text-blue-300 transition-colors">
                    {playerData.firstName} {playerData.lastName}
                  </div>
                </div>
                
                {/* Level badge */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg px-3 py-1 group-hover:border-yellow-500/50 transition-all">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-sm">Lvl {playerData.level || 1}</span>
                </div>

                {/* Energy badge */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-3 py-1 group-hover:border-green-500/50 transition-all">
                  <span className="text-green-300 text-sm">⚡</span>
                  <span className="text-green-300 font-bold text-sm">{playerData.energy || 100}</span>
                </div>

                {/* Psyche badge */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg px-3 py-1 group-hover:border-purple-500/50 transition-all">
                  <span className="text-purple-300 text-sm">🧠</span>
                  <span className="text-purple-300 font-bold text-sm">{playerData.psyche || 100}</span>
                </div>
              </button>

              {/* Datum - NYNÍ KLIKATELNÉ! */}
              <button
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-3 hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-all group"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                  <Calendar size={20} className="text-green-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    {formatDate(playerData.startDate).dayName}
                  </div>
                  <div className="text-white font-bold group-hover:text-green-300 transition-colors">
                    {formatDate(playerData.startDate).formattedDate}
                  </div>
                </div>
              </button>

              {/* ⏰ ČAS - NOVÉ! */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Clock size={20} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Čas</div>
                  <div className="text-white font-bold text-xl">
                    {playerData.currentTime}
                  </div>
                </div>
              </div>

              {/* Peníze */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Wallet size={20} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Peníze</div>
                  <div className="text-white font-bold">{formatMoney(playerData.money)}</div>
                </div>
              </div>
            </div>

            {/* Pravá strana - Akce */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveGame}
                className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 
                         px-4 py-2 rounded-lg transition-all text-white"
              >
                <Save size={18} />
                <span className="font-medium">Uložit hru</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEKCE POD HORNÍ LIŠTOU - flex container s time barem a obsahem */}
      <div className="flex flex-1">
        {/* TIMER - vlevo */}
        <Timer 
          currentTime={playerData.currentTime} 
          onTimeAdvance={handleTimeAdvance}
          playerData={playerData}
          onDateAdvance={handleDateAdvance}
        />

        {/* HLAVNÍ OBSAH - vpravo */}
        <div className="flex-1 overflow-auto">
      {/* HLAVNÍ SEKCE - GRID 2/3 + 1/3 */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* LEVÁ STRANA - 2/3 - TLAČÍTKA */}
          <div className="col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Co chceš dělat, {playerData.firstName}?
              </h2>
              <p className="text-gray-400">Vyber si jednu z následujících aktivit</p>
            </div>

            {/* GRID S TLAČÍTKY */}
            <div className="grid grid-cols-2 gap-6">
          {/* 💼 PRÁCE */}
          <button
            onClick={handleWorkClick}
            className="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 
                     border-2 border-indigo-500 rounded-lg p-8
                     transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
                     text-white"
          >
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-white font-bold mb-2 text-xl">Práce</h3>
            <p className="text-indigo-100 text-sm">Jít do práce a vydělat peníze</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Briefcase size={24} />
              <span className="font-bold">PRACOVAT</span>
            </div>
          </button>
          
          {/* 🏒 HRÁT ZÁPAS - ZMĚNA: Naviguje na /match kde se zobrazí 3D hřiště */}
          <button
            onClick={() => navigate('/match')}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 
                     border-2 border-green-500 rounded-lg p-8
                     transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
                     text-white"
          >
            <div className="text-5xl mb-4">🏒</div>
            <h3 className="text-white font-bold mb-2 text-xl">Hrát zápas!</h3>
            <p className="text-green-100 text-sm">Vybrat sestavy a hrát 🎮</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Play size={24} />
              <span className="font-bold">KLIKNI!</span>
            </div>
          </button>

          {/* 🏆 FOFR LIGA */}
          <button
            onClick={() => navigate('/league-table')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 
                     border-2 border-purple-500 rounded-lg p-8
                     transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
                     text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-white font-bold mb-2 text-xl">FOFR Liga</h3>
              <p className="text-purple-100 text-sm">Tabulka a soupeři</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Trophy size={24} />
                <span className="font-bold">8 TÝMŮ</span>
              </div>
            </div>
          </button>
          
          {/* 📊 STATISTIKY LIGY */}
          <button
            onClick={() => navigate('/league-stats')}
            className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 
                     border-2 border-orange-500 rounded-lg p-8
                     transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
                     text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/20 to-orange-400/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-white font-bold mb-2 text-xl">Statistiky</h3>
              <p className="text-orange-100 text-sm">Top střelci ligy</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Trophy size={24} />
                <span className="font-bold">ŽEBŘÍČEK</span>
              </div>
            </div>
          </button>

          {/* 🗺️ MAPA MĚSTA - NOVÉ! */}
          <button
            onClick={() => navigate('/city-map')}
            className="bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 
                     border-2 border-cyan-500 rounded-lg p-8
                     transform transition-all duration-200 hover:scale-105 hover:shadow-2xl
                     text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-white font-bold mb-2 text-xl">Město</h3>
              <p className="text-cyan-100 text-sm">Prozkoumat lokace</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Map size={24} />
                <span className="font-bold">11 MÍST</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* PRAVÁ STRANA - 1/3 - PŘÍŠTÍ ZÁPAS */}
      <div className="col-span-1">
        <div className="sticky top-8">
          <div className="relative bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80 rounded-xl border-2 border-blue-500/50 shadow-2xl overflow-hidden">
            {/* Animovaný background efekt */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 animate-pulse"></div>
            
            {/* Pattern pozadí */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}></div>
            </div>

            <div className="relative z-10 p-6">
              {/* Hlavička */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <Target className="text-red-400" size={20} />
                  </div>
                  <h3 className="text-red-300 text-xs font-bold uppercase tracking-wider">Příští zápas</h3>
                </div>
                {nextMatch ? (
                  <>
                    <p className="text-white text-lg font-bold">{nextMatch.round}. KOLO {nextMatch.phase === 'zakladni' ? 'ZÁKLADNÍ ČÁSTI' : 'FOFR LIGY'}</p>
                    <div className="inline-block bg-red-500/20 border border-red-500/50 rounded px-2 py-1 mt-2">
                      <span className="text-red-300 text-xs font-bold">
                        {isMatchToday(nextMatch.date, playerData.startDate) 
                          ? '🔥 DNES!' 
                          : `Za ${getDaysUntilMatch(nextMatch.date, playerData.startDate)} ${getDaysUntilMatch(nextMatch.date, playerData.startDate) === 1 ? 'den' : getDaysUntilMatch(nextMatch.date, playerData.startDate) < 5 ? 'dny' : 'dní'}`
                        }
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Není naplánován žádný zápas</p>
                )}
              </div>

              {/* Datum a čas */}
              {nextMatch && (
                <div className="bg-slate-900/60 rounded-lg p-4 mb-4 text-center border border-slate-700/50">
                  <div className="text-blue-300 text-xs font-bold uppercase mb-1">{nextMatch.dayOfWeek}</div>
                  <div className="text-white text-xl font-bold">{nextMatch.date.split(' ').slice(0, 2).join(' ')}</div>
                  <div className="text-gray-400 text-sm">{nextMatch.time}</div>
                </div>
              )}

              {/* Týmy */}
              {nextMatch && (
                <div className="space-y-3 mb-4">
                  {/* Domácí */}
                  <div className={`bg-slate-900/60 rounded-lg p-3 border-l-4 ${nextMatch.isHome ? 'border-blue-500' : 'border-slate-600'}`}>
                    <div className="flex items-center gap-3">
                      {nextMatch.isHome && nextMatch.homeTeam.logo ? (
                        <img 
                          src={nextMatch.homeTeam.logo} 
                          alt={nextMatch.homeTeam.name} 
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="text-4xl">{nextMatch.homeTeam.emoji}</div>
                      )}
                      <div className="flex-1">
                        <div className={`text-xs font-medium flex items-center gap-1 ${nextMatch.isHome ? 'text-blue-300' : 'text-gray-400'}`}>
                          <MapPin size={12} />
                          <span>DOMA</span>
                        </div>
                        <div className={`font-bold text-sm ${nextMatch.isHome ? 'text-white' : 'text-white'}`}>{nextMatch.homeTeam.name}</div>
                        <div className="text-gray-400 text-xs">{nextMatch.isHome ? '⭐ Tvůj tým' : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <span className="text-gray-400 font-bold text-lg">VS</span>
                  </div>

                  {/* Hosté */}
                  <div className={`bg-slate-900/60 rounded-lg p-3 border-l-4 ${!nextMatch.isHome ? 'border-blue-500' : 'border-slate-600'}`}>
                    <div className="flex items-center gap-3">
                      {!nextMatch.isHome && nextMatch.awayTeam.logo ? (
                        <img 
                          src={nextMatch.awayTeam.logo} 
                          alt={nextMatch.awayTeam.name} 
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="text-4xl">{nextMatch.awayTeam.emoji}</div>
                      )}
                      <div className="flex-1">
                        <div className={`text-xs font-medium flex items-center gap-1 ${!nextMatch.isHome ? 'text-blue-300' : 'text-gray-400'}`}>
                          <MapPin size={12} />
                          <span>HOSTÉ</span>
                        </div>
                        <div className={`font-bold text-sm ${!nextMatch.isHome ? 'text-white' : 'text-white'}`}>{nextMatch.awayTeam.name}</div>
                        <div className="text-gray-400 text-xs">{!nextMatch.isHome ? '⭐ Tvůj tým' : ''}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stadion */}
              {nextMatch && (
                <div className="bg-slate-900/40 rounded-lg p-3 mb-4 border border-slate-700/30">
                  <div className="text-gray-400 text-xs mb-1">🏟️ Stadion</div>
                  <div className="text-white font-medium text-sm">{nextMatch.venue}</div>
                  <div className="text-gray-500 text-xs">{nextMatch.isHome ? 'Domácí prostředí' : 'Venkovní zápas'}</div>
                </div>
              )}

              {/* Velké tlačítko HRÁT */}
              <button
                onClick={() => navigate('/pregame')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600
                         border-2 border-green-400 rounded-lg px-6 py-4 mb-3
                         transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/50 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/30 to-green-400/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center gap-2 text-white">
                  <Play size={20} />
                  <span className="font-bold">HRÁT ZÁPAS!</span>
                </div>
              </button>

              {/* Další akce */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/lancers-soupiska')}
                  className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2
                           transition-all duration-200 hover:scale-105 text-white text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Trophy size={14} className="text-blue-400" />
                  <span>Soupiska</span>
                </button>

                <button
                  onClick={() => navigate('/rozlosovani')}
                  className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2
                           transition-all duration-200 hover:scale-105 text-white text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Calendar size={14} className="text-orange-400" />
                  <span>Rozlosování</span>
                </button>
              </div>

              {/* Statistiky */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-slate-900/40 rounded-lg p-2 border border-slate-700/30">
                  <div className="text-gray-400 text-xs mb-1">Zápasy</div>
                  <div className="text-white text-lg font-bold">0</div>
                </div>

                <div className="bg-slate-900/40 rounded-lg p-2 border border-slate-700/30">
                  <div className="text-gray-400 text-xs mb-1">Body</div>
                  <div className="text-white text-lg font-bold">0</div>
                </div>
              </div>

              {/* Forma */}
              <div className="mt-3 bg-slate-900/40 rounded-lg p-2 border border-slate-700/30">
                <div className="text-gray-400 text-xs mb-2">Poslední forma</div>
                <div className="flex gap-1 justify-center">
                  <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs font-bold flex items-center justify-center">-</div>
                  <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs font-bold flex items-center justify-center">-</div>
                  <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs font-bold flex items-center justify-center">-</div>
                  <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs font-bold flex items-center justify-center">-</div>
                  <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs font-bold flex items-center justify-center">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
      </div>
      </div>

      {/* 💬 DIALOG - "JE JEŠTĚ BRZY!" */}
      {showWorkDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-orange-500/50 shadow-2xl max-w-lg w-full p-8 relative">
            {/* Tlačítko zavřít */}
            <button
              onClick={() => setShowWorkDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Obsah dialogu */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={40} className="text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                ⏰ Je ještě brzy!
              </h2>
              <p className="text-gray-300 text-lg">
                Práce začíná až ve <span className="font-bold text-orange-300">13:00</span>. 
                Teď je teprve <span className="font-bold text-purple-300">{playerData.currentTime}</span>.
              </p>
              <p className="text-gray-400 mt-2">
                Co bys chtěl dělat do začátku práce?
              </p>
            </div>

            {/* Možnosti aktivit */}
            <div className="space-y-3">
              <button
                onClick={handleGym}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600/20 to-blue-700/20 
                         border-2 border-blue-500/50 rounded-xl hover:border-blue-400 hover:bg-blue-600/30
                         transition-all duration-200 hover:scale-105 group"
              >
                <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center group-hover:bg-blue-500/50 transition-all">
                  <Dumbbell size={24} className="text-blue-300" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-bold text-lg">Posilovna</h3>
                  <p className="text-gray-400 text-sm">Zvýš své fyzické schopnosti</p>
                </div>
              </button>

              <button
                onClick={handleShopping}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-600/20 to-green-700/20 
                         border-2 border-green-500/50 rounded-xl hover:border-green-400 hover:bg-green-600/30
                         transition-all duration-200 hover:scale-105 group"
              >
                <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center group-hover:bg-green-500/50 transition-all">
                  <ShoppingBag size={24} className="text-green-300" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-bold text-lg">Obchod</h3>
                  <p className="text-gray-400 text-sm">Kup si výbavu a vybavení</p>
                </div>
              </button>

              <button
                onClick={() => { setShowWorkDialog(false); navigate('/city-map'); }}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 
                         border-2 border-cyan-500/50 rounded-xl hover:border-cyan-400 hover:bg-cyan-600/30
                         transition-all duration-200 hover:scale-105 group"
              >
                <div className="w-12 h-12 bg-cyan-500/30 rounded-full flex items-center justify-center group-hover:bg-cyan-500/50 transition-all">
                  <Map size={24} className="text-cyan-300" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-bold text-lg">Prozkoumat město</h3>
                  <p className="text-gray-400 text-sm">Navštiv různá místa ve městě</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setTime('13:00');
                  setShowWorkDialog(false);
                  navigate('/prace');
                }}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600/20 to-purple-700/20 
                         border-2 border-purple-500/50 rounded-xl hover:border-purple-400 hover:bg-purple-600/30
                         transition-all duration-200 hover:scale-105 group"
              >
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center group-hover:bg-purple-500/50 transition-all">
                  <Clock size={24} className="text-purple-300" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-bold text-lg">Počkat do začátku práce</h3>
                  <p className="text-gray-400 text-sm">Přeskočit čas na 13:00</p>
                </div>
              </button>

              <button
                onClick={() => setShowWorkDialog(false)}
                className="w-full p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl
                         text-gray-400 hover:text-white font-medium transition-all"
              >
                Zůstat na dashboardu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
