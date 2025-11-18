import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Wallet, User, Award, Clock } from 'lucide-react';

export default function PlayerHeaderBar({ children = null }) {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('playerData');
    if (data) {
      setPlayerData(JSON.parse(data));
    }
  }, []);

  const handleSaveGame = () => {
    alert('💾 Hra bude uložena (zatím nefunkční - přidáme později)');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('cs-CZ', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('cs-CZ', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return { dayName: capitalizedDay, formattedDate };
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('cs-CZ') + ' Kč';
  };

  if (!playerData) {
    return (
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="text-white">Načítání...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
      <div className="container mx-auto px-6 py-4">
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
                <div className="text-xs text-gray-400 uppercase tracking-wide">Manažer</div>
                <div className="text-white font-bold group-hover:text-blue-300 transition-colors">
                  {playerData.firstName} {playerData.lastName}
                </div>
              </div>
              
              {/* Level badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg px-3 py-1 group-hover:border-yellow-500/50 transition-all">
                <Award size={16} className="text-yellow-400" />
                <span className="text-yellow-300 font-bold text-sm">Lvl {playerData.level || 1}</span>
              </div>
            </button>

            {/* Datum - KLIKATELNÉ! */}
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

            {/* ⏰ ČAS */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Čas</div>
                <div className="text-white font-bold text-xl">
                  {playerData.currentTime || '08:00'}
                </div>
              </div>
            </div>

            {/* Peníze */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Wallet size={20} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Rozpočet</div>
                <div className="text-white font-bold">
                  {formatMoney(playerData.money)}
                </div>
              </div>
            </div>
          </div>

          {/* Pravá strana - Custom obsah nebo tlačítko Uložit */}
          <div className="flex items-center gap-4">
            {children}
            
            {/* Tlačítko Uložit */}
            <button
              onClick={handleSaveGame}
              className="flex items-center gap-2 px-6 py-3
                       bg-gradient-to-r from-blue-600 to-blue-700 
                       hover:from-blue-500 hover:to-blue-600
                       text-white font-bold rounded-lg
                       shadow-lg hover:shadow-xl
                       transition-all duration-200
                       hover:scale-105"
            >
              <Save size={20} />
              <span>Uložit hru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
