import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Calendar as CalendarIcon, Wallet, User, Award, Briefcase, Coffee, Trophy } from 'lucide-react';

export default function Calendar() {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const data = sessionStorage.getItem('playerData');
    if (data) {
      const parsedData = JSON.parse(data);
      setPlayerData(parsedData);
      
      const gameDate = new Date(parsedData.startDate);
      setCurrentDate(gameDate);
      setSelectedMonth(gameDate.getMonth());
      setSelectedYear(gameDate.getFullYear());
    } else {
      navigate('/setup');
    }
  }, [navigate]);

  if (!playerData || selectedMonth === null) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  const handleSaveGame = () => {
    alert('💾 Hra bude uložena (zatím nefunkční - přidáme později)');
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('cs-CZ') + ' Kč';
  };

  // ROZLOSOVÁNÍ ZÁPASŮ - Zápasy týmu Lancers
  const lancersMatches = [
    { date: '8. září 2024', opponent: 'Most', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '13. září 2024', opponent: 'Duchcov', isHome: false, time: '20:45', venue: 'Teplická aréna' },
    { date: '15. září 2024', opponent: 'Louny', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '22. září 2024', opponent: 'Chomutov', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '29. září 2024', opponent: 'Obojživelníci Litvínov', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '5. října 2024', opponent: 'Bílina', isHome: false, time: '20:00', venue: 'Aréna Bílina' },
    { date: '12. října 2024', opponent: 'Teplice', isHome: false, time: '20:00', venue: 'Teplická aréna' },
    { date: '20. října 2024', opponent: 'Most', isHome: false, time: '19:00', venue: 'Mostecký stadion' },
    { date: '26. října 2024', opponent: 'Chomutov', isHome: false, time: '19:00', venue: 'Chomutovská hala' },
    { date: '27. října 2024', opponent: 'Louny', isHome: false, time: '19:00', venue: 'Mostecký stadion' },
    { date: '2. listopadu 2024', opponent: 'Duchcov', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '3. listopadu 2024', opponent: 'Bílina', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '9. listopadu 2024', opponent: 'Obojživelníci Litvínov', isHome: false, time: '20:00', venue: 'Litvínov Arena' },
    { date: '10. listopadu 2024', opponent: 'Teplice', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '16. listopadu 2024', opponent: 'Chomutov', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '17. listopadu 2024', opponent: 'Bílina', isHome: false, time: '20:00', venue: 'Aréna Bílina' },
    { date: '23. listopadu 2024', opponent: 'Most', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '24. listopadu 2024', opponent: 'Teplice', isHome: false, time: '20:00', venue: 'Teplická aréna' },
    { date: '30. listopadu 2024', opponent: 'Obojživelníci Litvínov', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '1. prosince 2024', opponent: 'Louny', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '7. prosince 2024', opponent: 'Duchcov', isHome: false, time: '20:45', venue: 'Teplická aréna' },
    { date: '8. prosince 2024', opponent: 'Chomutov', isHome: false, time: '19:00', venue: 'Chomutovská hala' },
    { date: '14. prosince 2024', opponent: 'Bílina', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '15. prosince 2024', opponent: 'Most', isHome: false, time: '19:00', venue: 'Mostecký stadion' },
    { date: '21. prosince 2024', opponent: 'Teplice', isHome: true, time: '20:00', venue: 'Litvínov Arena' },
    { date: '22. prosince 2024', opponent: 'Louny', isHome: false, time: '19:00', venue: 'Mostecký stadion' },
    { date: '28. prosince 2024', opponent: 'Obojživelníci Litvínov', isHome: false, time: '20:00', venue: 'Litvínov Arena' },
    { date: '29. prosince 2024', opponent: 'Duchcov', isHome: true, time: '20:00', venue: 'Litvínov Arena' }
  ];

  // Funkce pro parsování českého data
  const parseCzechDate = (dateStr) => {
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

  // Funkce pro zjištění, zda je týden lichý nebo sudý (počítáno od začátku hry)
  const getWeekNumber = (date) => {
    const startDate = new Date(playerData.startDate);
    const diffTime = Math.abs(date - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  // Funkce pro získání pracovní doby podle týdne
  const getWorkTime = (date) => {
    const weekNum = getWeekNumber(date);
    return weekNum % 2 === 1 ? '13:00-22:00' : '5:00-14:00'; // lichý týden: 13-22, sudý: 5-14
  };

  // Funkce pro zjištění, zda má hráč v daný den zápas
  const getMatchForDay = (day, month, year) => {
    if (!day) return null;
    
    const dateToCheck = new Date(year, month, day);
    
    for (const match of lancersMatches) {
      const matchDate = parseCzechDate(match.date);
      if (matchDate.getDate() === day && 
          matchDate.getMonth() === month && 
          matchDate.getFullYear() === year) {
        return match;
      }
    }
    return null;
  };

  // Funkce pro zjištění, zda je daný den v minulosti
  const isPastDay = (day, month, year) => {
    if (!day) return false;
    const dateToCheck = new Date(year, month, day);
    const current = new Date(currentDate);
    
    // Resetovat čas pro správné porovnání
    dateToCheck.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    
    return dateToCheck < current;
  };

  // Funkce pro získání dnů v měsíci
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Funkce pro získání prvního dne v měsíci (0 = pondělí, 6 = neděle)
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  // Zjistit, jestli je den víkend
  const isWeekend = (day, month, year) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Neděle nebo Sobota
  };

  // Navigace měsíců
  const previousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Navigace roků
  const previousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const nextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  // Generování kalendáře
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Prázdná pole před prvním dnem
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Dny měsíce
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  const calendarDays = generateCalendar();

  // Kontrola, jestli je den aktuální herní den
  const isCurrentDay = (day) => {
    if (!day || !currentDate) return false;
    return day === currentDate.getDate() && 
           selectedMonth === currentDate.getMonth() && 
           selectedYear === currentDate.getFullYear();
  };

  // Funkce pro obsluhu hover
  const handleMouseEnter = (day, event) => {
    if (!day) return;
    setHoveredDay({ day, month: selectedMonth, year: selectedYear });
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Tooltip komponenta
  const Tooltip = () => {
    if (!hoveredDay) return null;

    const { day, month, year } = hoveredDay;
    const match = getMatchForDay(day, month, year);
    const isPast = isPastDay(day, month, year);
    const isCurrent = isCurrentDay(day);
    const isWeekendDay = isWeekend(day, month, year);
    const workTime = getWorkTime(new Date(year, month, day));

    return (
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-3 shadow-2xl min-w-[200px]">
          <div className="text-white font-bold text-sm mb-2 border-b border-slate-600 pb-2">
            {day}. {monthNames[month]} {year}
          </div>
          
          <div className="space-y-2 text-xs">
            {/* Zápas */}
            {match && (
              <div className="bg-green-900/30 border border-green-500/50 rounded p-2">
                <div className="flex items-center gap-1 text-green-300 font-bold mb-1">
                  <Trophy size={12} />
                  <span>ZÁPAS</span>
                </div>
                <div className="text-white text-xs">
                  {match.isHome ? 'DOMA' : 'VENKU'} vs {match.opponent}
                </div>
                <div className="text-gray-400 text-xs">{match.time} • {match.venue}</div>
              </div>
            )}

            {/* Práce */}
            {!isWeekendDay && (
              <div className={`${isPast || isCurrent ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-700/30 border-slate-500/50'} border rounded p-2`}>
                <div className="flex items-center gap-1 text-blue-300 font-bold mb-1">
                  <Briefcase size={12} />
                  <span>PRÁCE</span>
                </div>
                <div className="text-gray-300 text-xs">{workTime}</div>
                {isPast && <div className="text-green-400 text-xs mt-1">✓ Hotovo</div>}
                {isCurrent && <div className="text-yellow-400 text-xs mt-1">⏰ Probíhá</div>}
              </div>
            )}

            {/* Víkend */}
            {isWeekendDay && (
              <div className="bg-orange-900/30 border border-orange-500/50 rounded p-2">
                <div className="flex items-center gap-1 text-orange-300 font-bold mb-1">
                  <Coffee size={12} />
                  <span>VÍKEND</span>
                </div>
                <div className="text-gray-300 text-xs">Volný den</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
      {/* HORNÍ LIŠTA - FIXNÍ VÝŠKA */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl flex-shrink-0">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Levá strana - Info o hráči */}
            <div className="flex items-center gap-6">
              {/* Jméno manažera + Level */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-all group"
              >
                <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                  <User size={18} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Manažer</div>
                  <div className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">
                    {playerData.firstName} {playerData.lastName}
                  </div>
                </div>
                
                {/* Level badge */}
                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg px-2 py-1 group-hover:border-yellow-500/50 transition-all">
                  <Award size={14} className="text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-xs">Lvl {playerData.level || 1}</span>
                </div>
              </button>

              {/* Datum - Zpět na dashboard */}
              <button
                onClick={() => navigate('/game')}
                className="flex items-center gap-2 hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-all group"
              >
                <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                  <CalendarIcon size={18} className="text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">← Zpět</div>
                  <div className="text-white font-bold text-sm group-hover:text-green-300 transition-colors">
                    Dashboard
                  </div>
                </div>
              </button>

              {/* Peníze */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Wallet size={18} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Rozpočet</div>
                  <div className="text-white font-bold text-sm">
                    {formatMoney(playerData.money)}
                  </div>
                </div>
              </div>
            </div>

            {/* Pravá strana - Tlačítko Uložit */}
            <button
              onClick={handleSaveGame}
              className="flex items-center gap-2 px-5 py-2.5
                       bg-gradient-to-r from-blue-600 to-blue-700 
                       hover:from-blue-500 hover:to-blue-600
                       text-white font-bold rounded-lg text-sm
                       shadow-lg hover:shadow-xl
                       transition-all duration-200
                       hover:scale-105"
            >
              <Save size={18} />
              <span>Uložit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KALENDÁŘ - ZABÍRÁ ZBYTEK OBRAZOVKY */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Nadpis */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
              <CalendarIcon size={32} className="text-blue-400" />
              Herní kalendář
            </h1>
            <p className="text-gray-400 text-sm">
              {currentDate.toLocaleDateString('cs-CZ', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* Kalendář karta - ROZTAŽENÁ */}
          <div className="flex-1 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-2xl p-6 flex flex-col">
            {/* Ovládání roku */}
            <div className="flex items-center justify-center gap-6 mb-3">
              <button
                onClick={previousYear}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all hover:scale-110"
              >
                <ChevronLeft size={20} className="text-blue-400" />
              </button>
              <div className="text-2xl font-bold text-white px-8">
                {selectedYear}
              </div>
              <button
                onClick={nextYear}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all hover:scale-110"
              >
                <ChevronRight size={20} className="text-blue-400" />
              </button>
            </div>

            {/* Ovládání měsíce */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <button
                onClick={previousMonth}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all hover:scale-110"
              >
                <ChevronLeft size={18} className="text-green-400" />
              </button>
              <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 w-40 text-center">
                {monthNames[selectedMonth]}
              </div>
              <button
                onClick={nextMonth}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all hover:scale-110"
              >
                <ChevronRight size={18} className="text-green-400" />
              </button>
            </div>

            {/* Dny v týdnu - hlavička */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className={`text-center font-bold py-2 text-xs uppercase tracking-wide ${
                    index >= 5 ? 'text-orange-300' : 'text-blue-300'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Kalendářní mřížka - ROZTAŽENÁ */}
            <div className="flex-1 grid grid-cols-7 gap-2 content-start">
              {calendarDays.map((day, index) => {
                const isCurrent = isCurrentDay(day);
                const isWeekendDay = isWeekend(day, selectedMonth, selectedYear);
                const match = getMatchForDay(day, selectedMonth, selectedYear);
                const isPast = isPastDay(day, selectedMonth, selectedYear);
                
                return (
                  <div
                    key={index}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`
                      flex flex-col items-center justify-center rounded-lg font-semibold
                      transition-all duration-200 min-h-[60px] relative
                      ${day === null 
                        ? 'bg-transparent' 
                        : isCurrent
                          ? 'bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/50 scale-105 ring-4 ring-green-400/30'
                          : isWeekendDay
                            ? 'bg-gradient-to-br from-orange-600/40 to-red-600/40 border-2 border-orange-500/50 text-orange-100 hover:bg-orange-600/60 hover:scale-105 cursor-default'
                            : 'bg-slate-700/40 border-2 border-blue-500/20 text-gray-200 hover:bg-slate-600/60 hover:scale-105 cursor-default'
                      }
                    `}
                  >
                    {day && (
                      <div className="text-center">
                        <div className={`${isCurrent ? 'text-2xl font-bold' : 'text-lg'}`}>
                          {day}
                        </div>
                        
                        {/* Ikony událostí */}
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {/* Aktuální den */}
                          {isCurrent && (
                            <div className="text-xs text-green-100 font-normal">
                              DNES
                            </div>
                          )}
                          
                          {/* Zápas */}
                          {!isCurrent && match && (
                            <Trophy size={14} className="text-green-400" />
                          )}
                          
                          {/* Práce (pro minulé dny) */}
                          {!isCurrent && isPast && !isWeekendDay && (
                            <Briefcase size={12} className="text-blue-400" />
                          )}
                          
                          {/* Víkend */}
                          {!isCurrent && !isPast && isWeekendDay && (
                            <Coffee size={14} className="text-orange-300" />
                          )}
                          
                          {/* Běžný pracovní den v budoucnosti */}
                          {!isCurrent && !isPast && !isWeekendDay && !match && (
                            <Briefcase size={12} className="text-blue-400 opacity-50" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-blue-500 rounded"></div>
                <span className="text-gray-400">Aktuální den</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-green-400" />
                <span className="text-gray-400">Zápas</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-blue-400" />
                <span className="text-gray-400">Pracovní den</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee size={14} className="text-orange-400" />
                <span className="text-gray-400">Víkend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <Tooltip />
    </div>
  );
}
