import React from 'react';

const SHAPE_LABELS = {
  box: '📦 Obdélník',
  door: '🚪 Dveře',
  cylinder: '⭕ Válec',
  ground: '🟩 Zemina',
  soccerfield: '⚽ Fotbalové hřiště',
  track: '🛣️ Cesta (rovná)',
  'track-curve': '🔄 Cesta (zatáčka)',
  'box-curve': '🧊 Box (zatáčka)',
};

const TIME_PRESETS = [
  { label: '🌅 Východ', value: 5 },
  { label: '☀️ Poledne', value: 12 },
  { label: '🌇 Západ', value: 21 },
  { label: '🌙 Půlnoc', value: 0 },
];

const CLOUD_OPTIONS = [
  { key: 'clear', label: '☀️ Jasno', activeClass: 'bg-yellow-900/50 border border-yellow-600' },
  { key: 'partlyCloudy', label: '⛅ Polojasno', activeClass: 'bg-blue-900/50 border border-blue-600' },
  { key: 'cloudy', label: '☁️ Zataženo', activeClass: 'bg-blue-900/50 border border-blue-600' },
  { key: 'overcast', label: '🌫️ Zamračeno', activeClass: 'bg-gray-900/50 border border-gray-600' },
];

export const TopBar = ({
  onNavigateDashboard,
  onNavigateCharacterEditor,
  selectedShape,
  currentTime,
  isPausedTime,
  onTogglePause,
  onSlowDown,
  onSpeedUp,
  onSetTime,
  cloudPreset,
  onCloudPresetChange,
  mouseNeutralized,
  selectedObject,
  selectedDrawingType,
  isFirstPerson,
  buildingCount,
  canUndo,
  onUndo,
  onClearAll,
}) => {
  const renderShapeLabel = () => {
    if (!selectedShape) return null;
    return SHAPE_LABELS[selectedShape] || 'Neznámý';
  };

  return (
    <div className="p-4 bg-gray-800 border-b border-gray-700 text-white">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={onNavigateDashboard}
          className="px-4 py-2 rounded-lg border-2 border-blue-600 bg-blue-900/50 hover:bg-blue-800/50 font-semibold transition-all"
        >
          🏠 Menu
        </button>
        <button
          onClick={onNavigateCharacterEditor}
          className="px-4 py-2 rounded-lg border-2 border-purple-600 bg-purple-900/50 hover:bg-purple-800/50 font-semibold transition-all"
        >
          👤 Editor postav
        </button>
        <h1 className="text-2xl font-bold">🏗️ Stavitel měst</h1>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          {selectedShape ? (
            <>
              <span className="text-green-400">✓</span>
              <strong>Vybraný tvar:</strong> {renderShapeLabel()}
            </>
          ) : (
            <>
              <span className="text-blue-400">🎯</span>
              <strong>Vyber tvar z levého panelu</strong> nebo <strong>označ objekt a Delete smaž</strong>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-yellow-400">☀️</span>
          <strong>Čas:</strong> {Math.floor(currentTime)}:
          {String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}
          <button
            onClick={onTogglePause}
            className={`px-3 py-1 rounded font-semibold ${
              isPausedTime
                ? 'bg-green-900/50 hover:bg-green-800/50 border border-green-600'
                : 'bg-orange-900/50 hover:bg-orange-800/50 border border-orange-600'
            }`}
          >
            {isPausedTime ? '▶️' : '⏸️'}
          </button>
          <button
            onClick={onSlowDown}
            className="px-2 py-1 rounded bg-blue-900/50 hover:bg-blue-800/50 border border-blue-600"
          >
            ⏪
          </button>
          <button
            onClick={onSpeedUp}
            className="px-2 py-1 rounded bg-blue-900/50 hover:bg-blue-800/50 border border-blue-600"
          >
            ⏩
          </button>
          <div className="h-4 w-px bg-gray-600" />
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onSetTime(preset.value)}
              className="px-2 py-1 rounded bg-blue-900/50 hover:bg-blue-800/50 border border-blue-600 text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-blue-300">☁️</span>
          <strong>Počasí:</strong>
          {CLOUD_OPTIONS.map(({ key, label, activeClass }) => (
            <button
              key={key}
              onClick={() => onCloudPresetChange(key)}
              className={`px-2 py-1 rounded text-xs ${
                cloudPreset === key ? activeClass : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mouseNeutralized && selectedShape && (
          <div className="flex items-center gap-2 text-blue-400">
            <strong>🖱️ REŽIM VÝBĚRU</strong>
          </div>
        )}

        {selectedObject && (
          <div className="flex items-center gap-2 text-red-400">
            <strong>🎯 Objekt označen</strong> (Delete pro smazání)
          </div>
        )}

        {selectedDrawingType && (
          <div className="flex items-center gap-2 text-green-400 font-bold">
            🎨 REŽIM KRESBY: {selectedDrawingType} | Šipky: Posun | Enter: Umístit | Esc: Zrušit
          </div>
        )}

        {isFirstPerson && (
          <>
            <div className="flex items-center gap-2 text-purple-400 font-bold">🚶 FIRST PERSON REŽIM</div>
            <div className="flex items-center gap-2">⌨️ <strong>WASD/Šipky:</strong> Pohyb</div>
            <div className="flex items-center gap-2">🖱️ <strong>Myš:</strong> Rozhlížení</div>
            <div className="flex items-center gap-2">⌨️ <strong>Mezerník:</strong> Nahoru</div>
            <div className="flex items-center gap-2">⌨️ <strong>Shift:</strong> Dolů</div>
            <div className="flex items-center gap-2">⌨️ <strong>V:</strong> Zpět do orbital kamery</div>
          </>
        )}

        {selectedShape && !mouseNeutralized && !isFirstPerson && (
          <>
            <div className="flex items-center gap-2">
              🖱️ <strong>Levé tlačítko:</strong> Postav
            </div>
            <div className="flex items-center gap-2">
              🖱️ <strong>Pravé tlačítko:</strong> Režim výběru
            </div>
            <div className="flex items-center gap-2">
              ⌨️ <strong>Q/E:</strong> Otáčení
            </div>
            <div className="flex items-center gap-2">
              <strong>ESC:</strong> Zrušit výběr
            </div>
          </>
        )}

        {!selectedShape && !isFirstPerson && (
          <>
            <div className="flex items-center gap-2">
              🖱️ <strong>Levé tlačítko + tažení:</strong> Otáčení kamery
            </div>
            <div className="flex items-center gap-2">
              🖱️ <strong>Kolečko:</strong> Přiblížení/oddálení
            </div>
            <div className="flex items-center gap-2">
              🖱️ <strong>Pravé tlačítko + tažení:</strong> Posun kamery
            </div>
            <div className="flex items-center gap-2">
              ⌨️ <strong>V:</strong> First Person režim
            </div>
          </>
        )}

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            📦 Objekty: {buildingCount}
          </div>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
              !canUndo
                ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                : 'border-yellow-600 bg-yellow-900/50 hover:bg-yellow-800/50'
            }`}
          >
            ↶ Zpět
          </button>
          <button
            onClick={onClearAll}
            className="px-4 py-2 rounded-lg border-2 border-red-600 bg-red-900/50 hover:bg-red-800/50 font-semibold transition-all"
          >
            🗑️ Smazat vše
          </button>
        </div>
      </div>
    </div>
  );
};

