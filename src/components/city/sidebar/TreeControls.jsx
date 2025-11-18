import React from 'react';

const TREE_TYPES = [
  { key: 'conifer', label: '🌲 Jehličnatý', icon: '🌲' },
  { key: 'deciduous', label: '🌳 Listnatý', icon: '🌳' },
];

const PLACEMENT_MODES = [
  { key: 'single', label: '📍 Jeden', icon: '📍' },
  { key: 'brush', label: '🖌️ Plocha', icon: '🖌️' },
];

export const TreeControls = ({
  selectedTreeType,
  onTreeTypeSelect,
  treeHeight,
  onTreeHeightChange,
  treeCrownWidth,
  onTreeCrownWidthChange,
  placementMode,
  onPlacementModeChange,
  brushRadius,
  onBrushRadiusChange,
  brushDensity,
  onBrushDensityChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-300">🌲 Typ stromu</h3>
        <div className="grid grid-cols-2 gap-2">
          {TREE_TYPES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onTreeTypeSelect(key)}
              className={`p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                selectedTreeType === key
                  ? 'border-green-500 bg-green-900/50'
                  : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div>{label}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedTreeType && (
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-300">🎯 Režim umístění</h3>
          <div className="grid grid-cols-2 gap-2">
            {PLACEMENT_MODES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onPlacementModeChange(key)}
                className={`p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                  placementMode === key
                    ? 'border-blue-500 bg-blue-900/50'
                    : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div>{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTreeType && placementMode === 'brush' && (
        <>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              🔭 Poloměr štětce: {brushRadius.toFixed(1)} m
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={brushRadius}
              onChange={(e) => onBrushRadiusChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              🌳 Hustota: {brushDensity.toFixed(1)} stromů/m²
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={brushDensity}
              onChange={(e) => onBrushDensityChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </>
      )}

      {selectedTreeType && (
        <>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              📏 Výška: {treeHeight.toFixed(1)} m
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="0.5"
              value={treeHeight}
              onChange={(e) => onTreeHeightChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              🌿 Šířka koruny: {treeCrownWidth.toFixed(1)} m
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={treeCrownWidth}
              onChange={(e) => onTreeCrownWidthChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-400 space-y-1 bg-gray-900/40 p-3 rounded-lg border border-gray-700">
            <p>📌 Tipy:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Klikni na terén pro umístění stromu.</li>
              <li>Stromy mají automatický LOD systém.</li>
              <li>Z dálky jsou vidět jako billboardy.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

