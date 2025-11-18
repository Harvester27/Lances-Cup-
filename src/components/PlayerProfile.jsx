import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Brain, Target, Heart, Zap, Star, Trophy, Gauge, Briefcase, Award, Activity, ChevronRight } from 'lucide-react';
import { useGame } from './GameContext';

export default function PlayerProfile() {
  const navigate = useNavigate();
  const { playerData } = useGame();
  const [activeTab, setActiveTab] = useState('manager'); // 'manager', 'player', 'stats'

  useEffect(() => {
    if (!playerData) {
      navigate('/setup');
    }
  }, [playerData, navigate]);

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  // Výpočet XP pro další level
  const xpForNextLevel = playerData.level * 100;
  const xpProgress = (playerData.xp / xpForNextLevel) * 100;

  // Manažerské atributy
  const managerAttributes = [
    {
      name: 'Vedení',
      value: playerData.attributes?.leadership || { level: 1, xp: 0 },
      icon: Users,
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-600',
      description: 'Schopnost vést tým a motivovat hráče'
    },
    {
      name: 'Taktika',
      value: playerData.attributes?.tactics || { level: 1, xp: 0 },
      icon: Brain,
      color: 'from-red-700 to-red-900',
      bgColor: 'bg-red-700',
      description: 'Strategické myšlení a plánování zápasů'
    },
    {
      name: 'Motivace',
      value: playerData.attributes?.motivation || { level: 1, xp: 0 },
      icon: Heart,
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-red-500',
      description: 'Povzbuzování týmu v kritických momentech'
    },
    {
      name: 'Vyjednávání',
      value: playerData.attributes?.negotiation || { level: 1, xp: 0 },
      icon: Target,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500',
      description: 'Uzavírání kontraktů a transfery'
    },
    {
      name: 'Kondice',
      value: playerData.attributes?.fitness || { level: 1, xp: 0 },
      icon: Zap,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-400',
      description: 'Trénink a fyzická příprava týmu'
    },
    {
      name: 'Prestiž',
      value: playerData.attributes?.prestige || { level: 1, xp: 0 },
      icon: Star,
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500',
      description: 'Reputace a vliv v hokejovém světě'
    }
  ];

  // Hráčské dovednosti (12 celkem - přidány 3 nové!)
  const playerSkills = [
    {
      name: 'Rychlost',
      value: playerData.skills?.speed || { level: 1, xp: 0 },
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-600',
      description: 'Maximální rychlost na ledě'
    },
    {
      name: 'Zrychlení',
      value: playerData.skills?.acceleration || { level: 1, xp: 0 },
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-red-500',
      description: 'Schopnost rychle nabrat rychlost'
    },
    {
      name: 'Technika bruslení',
      value: playerData.skills?.skatingTechnique || { level: 1, xp: 0 },
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500',
      description: 'Kvalita a plynulost bruslení'
    },
    {
      name: 'Brzdění',
      value: playerData.skills?.braking || { level: 1, xp: 0 },
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-400',
      description: 'Schopnost zastavit a změnit směr'
    },
    {
      name: 'Stabilita',
      value: playerData.skills?.stability || { level: 1, xp: 0 },
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500',
      description: 'Rovnováha a odolnost vůči pádům'
    },
    {
      name: 'Výdrž',
      value: playerData.skills?.stamina || { level: 1, xp: 0 },
      color: 'from-red-700 to-red-900',
      bgColor: 'bg-red-700',
      description: 'Udržení výkonu po celý zápas'
    },
    {
      name: 'Síla',
      value: playerData.skills?.strength || { level: 1, xp: 0 },
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-600',
      description: 'Fyzická síla v soubojích'
    },
    {
      name: 'Střela',
      value: playerData.skills?.shooting || { level: 1, xp: 0 },
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-red-500',
      description: 'Přesnost a síla střelby'
    },
    {
      name: 'Přihrávky',
      value: playerData.skills?.passing || { level: 1, xp: 0 },
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500',
      description: 'Přesnost a načasování přihrávek'
    },
    {
      name: 'Ovládání puku',
      value: playerData.skills?.puckControl || { level: 1, xp: 0 },
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-400',
      description: 'Kontrola puku při bruslení'
    },
    {
      name: 'Odebírání puku',
      value: playerData.skills?.stealing || { level: 1, xp: 0 },
      color: 'from-red-700 to-red-900',
      bgColor: 'bg-red-700',
      description: 'Úspěšnost v získávání puku'
    },
    {
      name: 'Hra tělem',
      value: playerData.skills?.checking || { level: 1, xp: 0 },
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500',
      description: 'Efektivita bodyčeků'
    }
  ];

  // Statistiky kariéry
  const careerStats = [
    { label: 'Odehraných zápasů', value: playerData.stats?.matchesPlayed || 0, icon: Activity, color: 'blue' },
    { label: 'Výher', value: playerData.stats?.wins || 0, icon: Trophy, color: 'green' },
    { label: 'Proher', value: playerData.stats?.losses || 0, icon: Target, color: 'red' },
    { label: 'Vyhraných turnajů', value: playerData.stats?.tournaments || 0, icon: Award, color: 'yellow' }
  ];

  // Výpočet manažerského ratingu (průměr manažerských atributů)
  const calculateManagerRating = () => {
    if (!playerData.attributes) return 1;
    const attrs = Object.values(playerData.attributes);
    const sum = attrs.reduce((acc, attr) => acc + (attr.level || attr || 1), 0);
    return Math.round(sum / attrs.length);
  };

  // Výpočet hráčského ratingu (průměr všech 12 hráčských dovedností)
  const calculatePlayerRating = () => {
    if (!playerData.skills) return 1;
    const skills = Object.values(playerData.skills);
    const sum = skills.reduce((acc, skill) => acc + (skill.level || skill || 1), 0);
    return Math.round(sum / skills.length);
  };

  // Energie a Psychika (0-100%)
  const energy = playerData.energy !== undefined ? playerData.energy : 100;
  const psyche = playerData.psyche !== undefined ? playerData.psyche : 100;

  // Funkce pro určení barvy podle hodnoty
  const getStatusColor = (value) => {
    if (value >= 80) return 'from-green-500 to-emerald-600';
    if (value >= 60) return 'from-yellow-500 to-amber-600';
    if (value >= 40) return 'from-orange-500 to-red-600';
    return 'from-red-600 to-red-800';
  };

  const getStatusTextColor = (value) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const managerRating = calculateManagerRating();
  const playerRating = calculatePlayerRating();

  // Funkce pro získání barvy podle hodnoty
  const getColorByValue = (value) => {
    if (value >= 80) return 'text-yellow-400'; // Zlatá pro nejlepší
    if (value >= 60) return 'text-white'; // Bílá pro dobré
    if (value >= 40) return 'text-red-400'; // Červená pro průměrné
    return 'text-red-700'; // Tmavě červená pro nízké
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HORNÍ LIŠTA S GRADIENTEM */}
      <div className="relative bg-gradient-to-r from-black via-red-950 to-black border-b-4 border-red-600 shadow-2xl shadow-red-600/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="container mx-auto px-6 py-5 relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/game')}
              className="group flex items-center gap-3 text-white hover:text-red-400 transition-all duration-300 bg-white/10 hover:bg-red-600/30 px-5 py-3 rounded-xl backdrop-blur-sm border border-red-600/40 hover:border-red-500 hover:shadow-lg hover:shadow-red-600/50"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Hlavní obrazovka</span>
            </button>

            {/* Level Badge */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-3 rounded-xl font-bold text-black text-lg shadow-xl shadow-yellow-500/50 border-2 border-yellow-400">
                LVL {playerData.level || 1}
              </div>
              <div className="bg-red-950/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-red-600/40 shadow-lg shadow-red-600/30">
                <div className="text-xs text-gray-400 mb-1">XP Progress</div>
                <div className="text-white font-bold">{playerData.xp} / {xpForNextLevel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* GRID LAYOUT - Split Screen */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEVÝ PANEL - PLAYER CARD */}
          <div className="col-span-12 lg:col-span-4">
            {/* PLAYER CARD - Trading Card Style */}
            <div className="relative group">
              {/* Glow Effect - Červeno-zlatý */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-black via-red-950 to-black border-4 border-red-600/70 rounded-3xl p-8 shadow-2xl shadow-red-600/50">
                {/* Rating Badges - Top Corners */}
                <div className="absolute top-4 left-4 bg-gradient-to-br from-red-600 to-red-800 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/50 border-2 border-yellow-400 transform -rotate-12">
                  <div className="text-center">
                    <div className="text-xs font-bold text-yellow-300">MGR</div>
                    <div className="text-2xl font-black text-white">{managerRating}</div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 bg-gradient-to-br from-yellow-500 to-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/50 border-2 border-white transform rotate-12">
                  <div className="text-center">
                    <div className="text-xs font-bold text-black">PLY</div>
                    <div className="text-2xl font-black text-black">{playerRating}</div>
                  </div>
                </div>

                {/* Avatar */}
                <div className="mt-16 mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-yellow-500 to-red-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                    <div className="relative w-48 h-48 bg-gradient-to-br from-red-600 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-8xl font-black text-white shadow-2xl border-8 border-yellow-400/30">
                      {playerData.firstName[0]}{playerData.lastName[0]}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    {playerData.firstName}
                  </h1>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent mb-3 tracking-tight">
                    {playerData.lastName}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Briefcase size={16} />
                    <span className="text-sm font-medium">Manažer & Hráč</span>
                  </div>
                </div>

                {/* XP Bar */}
                <div className="bg-red-950/50 rounded-2xl p-4 border border-red-600/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-400">ZKUŠENOSTI</span>
                    <span className="text-sm font-bold text-white">{Math.round(xpProgress)}%</span>
                  </div>
                  <div className="relative w-full bg-black/50 rounded-full h-4 overflow-hidden border border-red-900/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-red-950 to-black"></div>
                    <div
                      className="relative h-full bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 transition-all duration-500 shadow-lg shadow-red-600/50"
                      style={{ width: `${xpProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-gray-500">
                    {playerData.xp} / {xpForNextLevel} XP do dalšího levelu
                  </div>
                </div>

                {/* ENERGIE A PSYCHIKA - NOVÁ SEKCE */}
                <div className="mt-6 space-y-3">
                  {/* Energie */}
                  <div className="bg-black/50 rounded-2xl p-4 border border-cyan-600/40">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-cyan-400" />
                        <span className="text-sm font-semibold text-gray-400">ENERGIE</span>
                      </div>
                      <span className={`text-sm font-bold ${getStatusTextColor(energy)}`}>{energy}%</span>
                    </div>
                    <div className="relative w-full bg-black/50 rounded-full h-3 overflow-hidden border border-cyan-900/50">
                      <div
                        className={`h-full bg-gradient-to-r ${getStatusColor(energy)} transition-all duration-500 shadow-lg`}
                        style={{ width: `${energy}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  {/* Psychika */}
                  <div className="bg-black/50 rounded-2xl p-4 border border-purple-600/40">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Brain size={16} className="text-purple-400" />
                        <span className="text-sm font-semibold text-gray-400">PSYCHIKA</span>
                      </div>
                      <span className={`text-sm font-bold ${getStatusTextColor(psyche)}`}>{psyche}%</span>
                    </div>
                    <div className="relative w-full bg-black/50 rounded-full h-3 overflow-hidden border border-purple-900/50">
                      <div
                        className={`h-full bg-gradient-to-r ${getStatusColor(psyche)} transition-all duration-500 shadow-lg`}
                        style={{ width: `${psyche}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Stats Mini */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {careerStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    const colors = {
                      blue: 'from-red-600 to-red-800',
                      green: 'from-yellow-500 to-amber-600',
                      red: 'from-red-700 to-red-900',
                      yellow: 'from-yellow-400 to-yellow-600'
                    };
                    const iconColors = {
                      blue: 'text-red-400',
                      green: 'text-yellow-400',
                      red: 'text-red-300',
                      yellow: 'text-yellow-300'
                    };
                    return (
                      <div key={idx} className="bg-black/50 rounded-xl p-3 border border-red-900/50 text-center">
                        <Icon className={`mx-auto mb-2 ${iconColors[stat.color]}`} size={20} />
                        <div className={`text-2xl font-bold bg-gradient-to-r ${colors[stat.color]} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PRAVÝ PANEL - TAB CONTENT */}
          <div className="col-span-12 lg:col-span-8">
            
            {/* TAB NAVIGATION */}
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-2 mb-6 border border-red-900/50 flex gap-2">
              <button
                onClick={() => setActiveTab('manager')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'manager'
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-600/50 border-2 border-yellow-400'
                    : 'text-gray-400 hover:text-white hover:bg-red-950/30 border-2 border-transparent'
                }`}
              >
                <Briefcase size={20} />
                <span>Manager Stats</span>
                <div className={`text-2xl font-black ${activeTab === 'manager' ? 'text-yellow-400' : 'text-gray-600'}`}>
                  {managerRating}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('player')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'player'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/50 border-2 border-white'
                    : 'text-gray-400 hover:text-white hover:bg-red-950/30 border-2 border-transparent'
                }`}
              >
                <Trophy size={20} />
                <span>Player Stats</span>
                <div className={`text-2xl font-black ${activeTab === 'player' ? 'text-black' : 'text-gray-600'}`}>
                  {playerRating}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'stats'
                    ? 'bg-gradient-to-r from-white to-gray-300 text-black shadow-lg shadow-white/50 border-2 border-red-600'
                    : 'text-gray-400 hover:text-white hover:bg-red-950/30 border-2 border-transparent'
                }`}
              >
                <Star size={20} />
                <span>Info</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-4">
              
              {/* MANAGER TAB */}
              {activeTab === 'manager' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl p-6 border border-red-600/40 shadow-lg shadow-red-600/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/50">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Manažerské atributy</h2>
                        <p className="text-sm text-red-300">Overall Rating: {managerRating}</p>
                      </div>
                    </div>
                  </div>

                  {managerAttributes.map((attr, idx) => {
                    const Icon = attr.icon;
                    const level = attr.value.level || 1;
                    const xp = attr.value.xp || 0;
                    const xpForNextLevel = 10 + (level - 1) * 2;
                    const xpProgress = (xp / xpForNextLevel) * 100;
                    
                    return (
                      <div
                        key={idx}
                        className="group bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-red-900/40 hover:border-red-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-600/30"
                      >
                        <div className="flex items-center gap-6">
                          {/* Icon + Value */}
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 bg-gradient-to-br ${attr.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                              <Icon size={28} className="text-white" />
                            </div>
                            <div className={`text-5xl font-black ${getColorByValue(level)}`}>
                              {level}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{attr.name}</h3>
                            <p className="text-sm text-gray-400 mb-3">{attr.description}</p>
                            
                            {/* Progress Bar - Horizontal */}
                            <div className="relative w-full bg-black/50 border border-red-900/30 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${attr.color} transition-all duration-700 shadow-lg`}
                                style={{ width: `${xpProgress}%` }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                                {xp}/{xpForNextLevel} XP
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="text-gray-600 group-hover:text-red-400 transition-colors" size={24} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PLAYER TAB */}
              {activeTab === 'player' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 rounded-2xl p-6 border border-yellow-600/40 shadow-lg shadow-yellow-600/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Hráčské dovednosti</h2>
                        <p className="text-sm text-yellow-300">Overall Rating: {playerRating}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playerSkills.map((skill, idx) => {
                      const level = skill.value.level || 1;
                      const xp = skill.value.xp || 0;
                      const xpForNextLevel = 10 + (level - 1) * 2;
                      const xpProgress = (xp / xpForNextLevel) * 100;
                      
                      return (
                        <div
                          key={idx}
                          className="group bg-black/80 backdrop-blur-xl rounded-2xl p-5 border border-red-900/40 hover:border-yellow-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-600/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">{skill.name}</h3>
                              <p className="text-xs text-gray-500">{skill.description}</p>
                            </div>
                            <div className={`text-4xl font-black ${getColorByValue(level)}`}>
                              {level}
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative w-full bg-black/50 border border-red-900/30 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${skill.color} transition-all duration-700`}
                              style={{ width: `${xpProgress}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">
                              {xp}/{xpForNextLevel} XP
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Career Stats Detail */}
                  <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 border border-red-900/40">
                    <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                      <Award className="text-yellow-400" size={32} />
                      Statistiky kariéry
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {careerStats.map((stat, idx) => {
                        const Icon = stat.icon;
                        const colors = {
                          blue: 'from-red-600 to-red-800',
                          green: 'from-yellow-500 to-amber-600',
                          red: 'from-red-700 to-red-900',
                          yellow: 'from-yellow-400 to-yellow-600'
                        };
                        const iconColors = {
                          blue: 'text-red-400',
                          green: 'text-yellow-400',
                          red: 'text-red-300',
                          yellow: 'text-yellow-300'
                        };
                        return (
                          <div key={idx} className="bg-black/50 rounded-2xl p-6 border border-red-900/50 text-center hover:scale-105 transition-transform hover:shadow-lg hover:shadow-red-600/30">
                            <Icon className={`mx-auto mb-4 ${iconColors[stat.color]}`} size={32} />
                            <div className={`text-6xl font-black bg-gradient-to-r ${colors[stat.color]} bg-clip-text text-transparent mb-3`}>
                              {stat.value}
                            </div>
                            <div className="text-gray-400 font-medium">{stat.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-gradient-to-br from-red-600/20 via-yellow-600/20 to-red-600/20 rounded-2xl p-8 border border-red-600/40">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="text-3xl">💡</span>
                      Jak zlepšit dovednosti?
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-black/50 rounded-xl p-5 border border-red-900/40">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/50">
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <h4 className="text-red-300 font-bold mb-2">⚙️ Manažerské atributy (Manager OVR)</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              Získáváš zkušenosti vítězstvím v zápasech, podpisováním nových hráčů a vylepšováním klubu. 
                              Průměr všech 6 manažerských atributů.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-xl p-5 border border-red-900/40">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/50">
                            <Trophy size={20} />
                          </div>
                          <div>
                            <h4 className="text-yellow-300 font-bold mb-2">🏒 Hráčské dovednosti (Player OVR)</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              Zlepšuješ hraním zápasů, tréninky a speciálními programy. 
                              Průměr všech 12 hráčských dovedností určuje tvůj celkový rating jako hráče!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer animace */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}