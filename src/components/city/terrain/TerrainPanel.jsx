import React from 'react';

const TOOLS = [
  { key: 'raise', label: '⬆️ Zvednout' },
  { key: 'lower', label: '⬇️ Snížit' },
  { key: 'smooth', label: '〰️ Vyhladit' },
  { key: 'paint-surface', label: '🎨 Malovat povrch' },
];

const SURFACE_TYPES = [
  { key: 0, label: '🌱 Tráva', color: '#3b6b3b' },
  { key: 1, label: '⛰️ Skalnatý', color: '#5a5a5a' },
  { key: 2, label: '🏖️ Písek', color: '#d4c5a9' },
  { key: 3, label: '❄️ Sníh', color: '#f0f0f0' },
  { key: 4, label: '🏗️ Beton', color: '#8a8a8a' },
  { key: 5, label: '🧊 Led', color: '#b8d4e8' },
];

export const TerrainPanel = ({
  tool,
  onToolChange,
  radius,
  onRadiusChange,
  strength,
  onStrengthChange,
  surfaceType,
  onSurfaceTypeChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-300">🛠️ Nástroj</h3>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onToolChange(key)}
              className={`p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                tool === key
                  ? 'border-green-500 bg-green-900/50'
                  : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tool === 'paint-surface' && (
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-300">🎨 Typ povrchu</h3>
          <div className="grid grid-cols-3 gap-2">
            {SURFACE_TYPES.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => onSurfaceTypeChange(key)}
                className={`p-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                  surfaceType === key
                    ? 'border-blue-500 bg-blue-900/50'
                    : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ borderColor: surfaceType === key ? color : undefined }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          🔭 Poloměr štětce: {radius.toFixed(1)} m
        </label>
        <input
          type="range"
          min="1"
          max="30"
          step="0.5"
          value={radius}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          💪 Síla: {strength.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.05"
          max="2"
          step="0.05"
          value={strength}
          onChange={(e) => onStrengthChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-2">
          Vyšší síla = rychlejší změny výšky. Používej s citem 🙂
        </p>
      </div>

      <div className="text-xs text-gray-400 space-y-1 bg-gray-900/40 p-3 rounded-lg border border-gray-700">
        <p>📌 Tipy:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Drž levé tlačítko myši pro malování terénu.</li>
          <li>Přepínání nástrojů ti pomůže dělat kopce i nájezdy.</li>
          <li>Vyhlazení je super na silnice do kopce.</li>
        </ul>
      </div>
    </div>
  );
};

