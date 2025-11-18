import React from 'react';

interface BuildOptionsPanelProps {
  selectedShape: string | null;
  roadSurface: string;
  onRoadSurfaceChange: (surface: string) => void;
  trackSlopePercent: number;
  onTrackSlopeChange: (value: number) => void;
  roadWidth: number;
  onRoadWidthChange: (value: number) => void;
  withWindows: boolean;
  onToggleWindows: () => void;
  selectedColor: number;
  onColorChange: (hex: number) => void;
  selectedMaterial: string;
  onMaterialChange: (material: string) => void;
  onClearShapeSelection: () => void;
}

export const BuildOptionsPanel: React.FC<BuildOptionsPanelProps> = ({
  selectedShape,
  roadSurface,
  onRoadSurfaceChange,
  trackSlopePercent,
  onTrackSlopeChange,
  roadWidth,
  onRoadWidthChange,
  withWindows,
  onToggleWindows,
  selectedColor,
  onColorChange,
  selectedMaterial,
  onMaterialChange,
  onClearShapeSelection,
}) => {
  const canConfigureAppearance =
    !!selectedShape &&
    selectedShape !== 'ground' &&
    selectedShape !== 'soccerfield' &&
    selectedShape !== 'track' &&
    selectedShape !== 'track-curve';

  return (
    <>
      {(selectedShape === 'track' || selectedShape === 'track-curve' || selectedShape === 'road-builder') && (
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-300">🛣️ Typ povrchu</h3>
          <div className="grid grid-cols-2 gap-2">
            <SurfaceButton
              label="Tartan"
              icon="🏃"
              active={roadSurface === 'tartan'}
              onClick={() => onRoadSurfaceChange('tartan')}
            />
            <SurfaceButton
              label="Asfalt"
              icon="🛣️"
              active={roadSurface === 'asphalt'}
              onClick={() => onRoadSurfaceChange('asphalt')}
            />
            <SurfaceButton
              label="Štěrk"
              icon="🪨"
              active={roadSurface === 'gravel'}
              onClick={() => onRoadSurfaceChange('gravel')}
            />
            <SurfaceButton
              label="Bahno"
              icon="🌱"
              active={roadSurface === 'dirt'}
              onClick={() => onRoadSurfaceChange('dirt')}
            />
          </div>
          {selectedShape === 'track' && (
            <div className="mt-5">
              <h3 className="font-semibold text-sm mb-2 text-gray-300">⛰️ Stoupání / klesání</h3>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={trackSlopePercent}
                onChange={(e) => onTrackSlopeChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                {trackSlopePercent === 0
                  ? 'Rovný úsek (0 %)'
                  : trackSlopePercent > 0
                    ? `Stoupání ${trackSlopePercent.toFixed(1)} %`
                    : `Klesání ${Math.abs(trackSlopePercent).toFixed(1)} %`}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onTrackSlopeChange(0)}
                  className="flex-1 p-2 rounded border border-gray-600 hover:border-blue-500 hover:bg-blue-900/30"
                >
                  0 %
                </button>
                <button
                  onClick={() => onTrackSlopeChange(5)}
                  className="flex-1 p-2 rounded border border-gray-600 hover:border-blue-500 hover:bg-blue-900/30"
                >
                  +5 %
                </button>
                <button
                  onClick={() => onTrackSlopeChange(-5)}
                  className="flex-1 p-2 rounded border border-gray-600 hover:border-blue-500 hover:bg-blue-900/30"
                >
                  -5 %
                </button>
              </div>
            </div>
          )}
          {selectedShape === 'road-builder' && (
            <div className="mt-5">
              <h3 className="font-semibold text-sm mb-2 text-gray-300">↔️ Šířka silnice</h3>
              <input
                type="range"
                min="3"
                max="50"
                step="0.5"
                value={roadWidth}
                onChange={(e) => onRoadWidthChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                {roadWidth.toFixed(1)} m
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Klikni a táhni myší pro vytvoření úseku silnice mezi body A → B. Silnice se automaticky přizpůsobí terénu a naváže na nejbližší cestu.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedShape === 'box' && (
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-300">🪟 Okna</h3>
          <button
            onClick={onToggleWindows}
            className={`w-full p-3 rounded-lg border-2 transition-all ${
              withWindows ? 'border-blue-500 bg-blue-900/50' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{withWindows ? '🪟' : '🔲'}</div>
            <div className="text-sm">{withWindows ? 'S okny' : 'Bez oken'}</div>
          </button>
        </div>
      )}

      {canConfigureAppearance && (
        <>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-300">🎨 Barva</h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={`#${selectedColor.toString(16).padStart(6, '0')}`}
                onChange={(e) => onColorChange(parseInt(e.target.value.replace('#', ''), 16))}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-600"
              />
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Vybraná barva:</div>
                <div
                  className="w-full h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: `#${selectedColor.toString(16).padStart(6, '0')}` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-300">✨ Materiál</h3>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_OPTIONS.map((material) => (
                <button
                  key={material.key}
                  onClick={() => onMaterialChange(material.key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMaterial === material.key
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{material.icon}</div>
                  <div className="text-xs">{material.label}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedShape && (
        <button
          onClick={onClearShapeSelection}
          className="w-full p-3 rounded-lg border-2 border-red-600 bg-red-900/50 hover:bg-red-800/50 text-center"
        >
          ❌ Zrušit výběr
        </button>
      )}
    </>
  );
};

const MATERIAL_OPTIONS = [
  { key: 'standard', icon: '🔲', label: 'Standard' },
  { key: 'metallic', icon: '⚙️', label: 'Kovový' },
  { key: 'matte', icon: '🧱', label: 'Matný' },
  { key: 'glass', icon: '💎', label: 'Sklo' },
  { key: 'neon', icon: '💡', label: 'Neon' },
  { key: 'wood', icon: '🪵', label: 'Dřevo' },
  { key: 'plastic', icon: '🔷', label: 'Plast' },
  { key: 'ice', icon: '🧊', label: 'Led' },
];

const SurfaceButton: React.FC<{ label: string; icon: string; active: boolean; onClick: () => void }> = ({
  label,
  icon,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-lg border-2 transition-all ${
      active ? 'border-blue-500 bg-blue-900/50' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
    }`}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xs">{label}</div>
  </button>
);

