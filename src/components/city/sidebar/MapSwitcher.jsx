import React from 'react';

interface MapSwitcherProps {
  slots: number[];
  selectedSlot: number;
  onSelect: (slot: number) => void;
}

export const MapSwitcher: React.FC<MapSwitcherProps> = ({ slots, selectedSlot, onSelect }) => (
  <div>
    <h3 className="font-semibold text-sm mb-3 text-gray-300">🗂 Mapy</h3>
    <div className="grid grid-cols-5 gap-2">
      {slots.map((slot) => (
        <button
          key={`map-slot-${slot}`}
          onClick={() => onSelect(slot)}
          className={`p-2 rounded-lg border-2 text-xs font-semibold transition-all ${
            selectedSlot === slot
              ? 'border-green-500 bg-green-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Mapa {slot + 1}
        </button>
      ))}
    </div>
  </div>
);

