import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, FolderOpen, Settings, Power } from 'lucide-react';

export default function HockeyManagerMenu() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();

  const menuButtons = [
    { 
      id: 'start', 
      label: 'Start hry', 
      icon: Play,
      color: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
    },
    { 
      id: 'load', 
      label: 'Načíst hru', 
      icon: FolderOpen,
      color: 'from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
    },
    { 
      id: 'settings', 
      label: 'Nastavení', 
      icon: Settings,
      color: 'from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
    },
    { 
      id: 'exit', 
      label: 'Vypnout hru', 
      icon: Power,
      color: 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
    }
  ];

  const handleButtonClick = (buttonId) => {
    console.log(`Kliknuto na: ${buttonId}`);
    
    switch(buttonId) {
      case 'start':
        // Přejít na setup obrazovku
        navigate('/setup');
        break;
      case 'load':
        alert('💾 Načítání hry přidáme později (zatím žádné uložené hry)');
        break;
      case 'settings':
        alert('⚙️ Nastavení přidáme později');
        break;
      case 'exit':
        if (window.confirm('Opravdu chceš vypnout hru?')) {
          // V Electronu
          if (window.require) {
            const { ipcRenderer } = window.require('electron');
            if (ipcRenderer) {
              window.close();
            }
          } else {
            // Fallback pro dev mode
            window.close();
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
      {/* Hokejový vzor na pozadí */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 52px)`,
        }}></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Hlavní nadpis */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
            🏒 HOCKEY
          </h1>
          <h2 className="text-4xl font-bold text-blue-400 mb-2">
            MANAGER
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-600"></div>
            <span>2025 Edition</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-600"></div>
          </div>
        </div>

        {/* Menu tlačítka */}
        <div className="space-y-4">
          {menuButtons.map((button) => {
            const Icon = button.icon;
            const isHovered = hoveredButton === button.id;
            
            return (
              <button
                key={button.id}
                onClick={() => handleButtonClick(button.id)}
                onMouseEnter={() => setHoveredButton(button.id)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`
                  w-full bg-gradient-to-r ${button.color}
                  text-white font-bold text-xl py-5 px-8 rounded-xl
                  shadow-lg hover:shadow-2xl
                  transform transition-all duration-200
                  ${isHovered ? 'scale-105 -translate-y-1' : 'scale-100'}
                  flex items-center justify-between
                  border-2 border-white/10 hover:border-white/30
                `}
              >
                <span className="flex items-center gap-4">
                  <Icon 
                    size={28} 
                    className={`transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`}
                  />
                  {button.label}
                </span>
                <div className={`
                  w-2 h-2 rounded-full bg-white/50
                  transition-all duration-200
                  ${isHovered ? 'scale-150 bg-white' : ''}
                `}></div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Verze 0.1.0 | Vytvořeno s React + Electron</p>
        </div>
      </div>

      {/* Dekorativní prvky */}
      <div className="absolute top-10 left-10 text-blue-500/10 text-9xl font-bold">
        🏒
      </div>
      <div className="absolute bottom-10 right-10 text-blue-500/10 text-9xl font-bold">
        🥅
      </div>
    </div>
  );
}