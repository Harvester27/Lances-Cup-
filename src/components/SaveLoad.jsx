import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Calendar, User, Trophy, Clock } from 'lucide-react';

export default function SaveLoad() {
  const navigate = useNavigate();
  const [saveSlots, setSaveSlots] = useState([]);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    // Načíst aktuální data hráče
    const data = sessionStorage.getItem('playerData');
    if (data) {
      setPlayerData(JSON.parse(data));
    }

    // Načíst existující save sloty z localStorage
    const slots = [];
    for (let i = 1; i <= 5; i++) {
      const savedData = localStorage.getItem(`hockeySave_slot${i}`);
      if (savedData) {
        slots.push({
          slotNumber: i,
          data: JSON.parse(savedData),
          isEmpty: false
        });
      } else {
        slots.push({
          slotNumber: i,
          data: null,
          isEmpty: true
        });
      }
    }
    setSaveSlots(slots);
  }, []);

  const handleSaveToSlot = (slotNumber) => {
    if (!playerData) return;

    // Uložit data do vybraného slotu
    const saveData = {
      ...playerData,
      savedAt: new Date().toISOString(),
      slotNumber: slotNumber
    };

    localStorage.setItem(`hockeySave_slot${slotNumber}`, JSON.stringify(saveData));
    
    // Aktualizovat zobrazení slotů
    const updatedSlots = [...saveSlots];
    updatedSlots[slotNumber - 1] = {
      slotNumber: slotNumber,
      data: saveData,
      isEmpty: false
    };
    setSaveSlots(updatedSlots);

    // Alert a návrat
    alert(`💾 Hra úspěšně uložena do Slotu ${slotNumber}!`);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 
                     border border-slate-600 rounded-lg text-white transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={18} />
            <span>Zpět na dashboard</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">💾 Uložit hru</h1>
            <p className="text-gray-400">Vyber slot pro uložení své hry</p>
          </div>

          <div className="w-32"></div> {/* Spacer pro vycentrování */}
        </div>

        {/* Save sloty */}
        <div className="space-y-4">
          {saveSlots.map((slot) => (
            <button
              key={slot.slotNumber}
              onClick={() => handleSaveToSlot(slot.slotNumber)}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]
                ${slot.isEmpty 
                  ? 'bg-slate-800/50 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50' 
                  : 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/50 hover:border-blue-400'
                }`}
            >
              <div className="flex items-center gap-6">
                {/* Slot číslo */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-xl flex items-center justify-center border-2 border-slate-600">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase">Slot</div>
                      <div className="text-2xl font-bold text-white">{slot.slotNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Obsah slotu */}
                {slot.isEmpty ? (
                  <div className="flex-1 text-left">
                    <div className="text-xl font-bold text-gray-400 mb-1">Prázdný slot</div>
                    <div className="text-sm text-gray-500">Klikni pro uložení hry</div>
                  </div>
                ) : (
                  <div className="flex-1 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Levý sloupec */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-blue-400" />
                          <span className="text-white font-bold">
                            {slot.data.firstName} {slot.data.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                          <Trophy size={14} className="text-yellow-400" />
                          <span>Level {slot.data.level || 1}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar size={14} className="text-green-400" />
                          <span>{new Date(slot.data.startDate).toLocaleDateString('cs-CZ')}</span>
                        </div>
                      </div>

                      {/* Pravý sloupec */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <Clock size={14} className="text-purple-400" />
                          <span className="text-xs text-gray-400">Uloženo:</span>
                        </div>
                        <div className="text-xs text-gray-300">
                          {formatDate(slot.data.savedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ikona save */}
                <div className="flex-shrink-0">
                  <Save size={32} className={slot.isEmpty ? 'text-gray-500' : 'text-blue-400'} />
                </div>
              </div>

              {/* Varování při přepsání */}
              {!slot.isEmpty && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                  <div className="text-xs text-orange-400 text-center">
                    ⚠️ Kliknutím přepíšeš tuto uloženou hru
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info text */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-600/50 rounded-lg">
          <div className="text-sm text-gray-400 text-center">
            💡 Tip: Uložené hry jsou uchovány v prohlížeči. Pro načtení hry použij menu na hlavní obrazovce.
          </div>
        </div>
      </div>
    </div>
  );
}
