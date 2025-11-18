import React from 'react';
import * as THREE from 'three';

type TextureParams = {
  posX: number;
  posY: number;
  scale: number;
  rotation: number;
  wear: number;
};

export interface SelectedObjectInspectorProps {
  selectedObject: THREE.Object3D | null;
  onDeselect: () => void;
  onDoorToggle: (object: THREE.Object3D) => void;
  onColorChange: (hex: number) => void;
  onMaterialChange: (material: string) => void;
  onTextureAction: (textureName: string) => void;
  textureParams: TextureParams;
  setTextureParams: (params: TextureParams) => void;
  doorStateVersion: number;
  activeDrawingType?: string | null;
}

const MATERIALS = [
  { key: 'standard', icon: '🔲', label: 'Standard' },
  { key: 'metallic', icon: '⚙️', label: 'Kovový' },
  { key: 'matte', icon: '🧱', label: 'Matný' },
  { key: 'glass', icon: '💎', label: 'Sklo' },
  { key: 'neon', icon: '💡', label: 'Neon' },
  { key: 'wood', icon: '🪵', label: 'Dřevo' },
  { key: 'plastic', icon: '🔷', label: 'Plast' },
  { key: 'ice', icon: '🧊', label: 'Led' },
];

const TEXTURE_BUTTONS = [
  { key: 'faceoff-red', label: 'Červené vhaz.', icon: '🔴' },
  { key: 'faceoff-blue', label: 'Modré vhaz.', icon: '🔵' },
  { key: 'blue-line', label: 'Modrá čára', icon: '🟦' },
  { key: 'red-line', label: 'Červená čára', icon: '🟥' },
  { key: 'goal-line', label: 'Branková', icon: '🥅' },
  { key: 'crease', label: 'Brankoviště', icon: '🧊' },
  { key: 'faceoff-dots', label: 'Tečky vhaz.', icon: '🎯' },
  { key: 'center-dot', label: 'Středový bod', icon: '⚪' },
  { key: 'full-rink', label: 'Celé kluziště', icon: '🏒' },
  { key: 'none', label: 'Smazat kresby', icon: '❌', danger: true },
];

export const SelectedObjectInspector: React.FC<SelectedObjectInspectorProps> = ({
  selectedObject,
  onDeselect,
  onDoorToggle,
  onColorChange,
  onMaterialChange,
  onTextureAction,
  textureParams,
  setTextureParams,
  doorStateVersion,
  activeDrawingType,
}) => {
  if (!selectedObject || !selectedObject.userData) return null;
  const { type, size, drawings = [], material, color } = selectedObject.userData;

  return (
    <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-900/20">
      <h3 className="font-semibold text-lg mb-4 text-yellow-300 flex items-center gap-2">
        ✏️ Úprava označeného objektu
      </h3>

      <ObjectTypeInfo type={type} />
      {size && <ObjectSizeInfo type={type} size={size} />}

      {type === 'door' && (
        <DoorDetails
          key={`door-info-${doorStateVersion}`}
          doorConfig={selectedObject.userData.doorConfig}
          onToggle={() => onDoorToggle(selectedObject)}
        />
      )}

      <ColorControls type={type} color={color} onColorChange={onColorChange} />
      <MaterialControls type={type} material={material} onMaterialChange={onMaterialChange} />
      <TextureControls
        type={type}
        textureParams={textureParams}
        setTextureParams={setTextureParams}
        onTextureAction={onTextureAction}
        drawingsCount={Array.isArray(drawings) ? drawings.length : 0}
        activeDrawingType={activeDrawingType}
      />

      <button
        onClick={onDeselect}
        className="w-full p-3 mt-4 rounded-lg border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 font-semibold transition-all"
      >
        Zrušit výběr objektu
      </button>
    </div>
  );
};

const ObjectTypeInfo: React.FC<{ type: string }> = ({ type }) => (
  <div className="mb-4 p-2 bg-gray-800 rounded">
    <div className="text-xs text-gray-400">Typ objektu:</div>
    <div className="font-semibold">
      {type === 'box' && '📦 Obdélník'}
      {type === 'door' && '🚪 Dveře'}
      {type === 'cylinder' && '⭕ Válec'}
      {type === 'ground' && '🟩 Zemina'}
      {type === 'soccerfield' && '⚽ Fotbalové hřiště'}
      {type === 'track' && '🏃 Atletická dráha'}
      {type === 'track-curve' && '🔄 Atletická zatáčka'}
    </div>
  </div>
);

const ObjectSizeInfo: React.FC<{ type: string; size: number[] }> = ({ type, size }) => (
  <div className="mb-4 p-2 bg-gray-800 rounded">
    <div className="text-xs text-gray-400 mb-1">Rozměry:</div>
    <div className="font-semibold text-sm">
      {type === 'box' && (
        <div className="space-y-1">
          <div>📏 Šířka (X): {size?.[0]?.toFixed(1)}</div>
          <div>📏 Výška (Y): {size?.[1]?.toFixed(1)}</div>
          <div>📏 Hloubka (Z): {size?.[2]?.toFixed(1)}</div>
        </div>
      )}
      {type === 'cylinder' && (
        <div className="space-y-1">
          <div>⭕ Poloměr: {size?.[0]?.toFixed(1)}</div>
          <div>📏 Výška: {size?.[1]?.toFixed(1)}</div>
        </div>
      )}
      {type === 'track' && (
        <div className="space-y-1">
          <div>📏 Šířka: {size?.[0]?.toFixed(1)}</div>
          <div>📏 Délka: {size?.[1]?.toFixed(1)}</div>
        </div>
      )}
      {type === 'track-curve' && (
        <div className="space-y-1">
          <div>📏 Šířka: {size?.[0]?.toFixed(1)}</div>
          <div>⭕ Poloměr: {size?.[1]?.toFixed(1)}</div>
        </div>
      )}
      {(type === 'ground' || type === 'soccerfield') && (
        <div className="space-y-1">
          <div>📏 Šířka: 90</div>
          <div>📏 Délka: 70</div>
        </div>
      )}
    </div>
    <div className="text-xs text-yellow-300 mt-2">💡 Velikost byla načtena do sliderů</div>
  </div>
);

const DoorDetails: React.FC<{ doorConfig?: { hinge?: string; isOpen?: boolean }; onToggle: () => void }> = ({
  doorConfig,
  onToggle,
}) => (
  <div className="mb-4 p-2 bg-gray-800 rounded space-y-2">
    <div className="text-xs text-gray-400">Panty:</div>
    <div className="font-semibold">{doorConfig?.hinge === 'right' ? '↪️ Pravé' : '↩️ Levé'}</div>
    <div className="text-xs text-gray-400">Stav:</div>
    <div className="font-semibold">{doorConfig?.isOpen ? '🟢 Otevřené' : '🔴 Zavřené'}</div>
    <button
      onClick={onToggle}
      className="w-full mt-2 p-3 rounded-lg border-2 border-blue-500 bg-blue-900/50 hover:bg-blue-800/50 transition-all"
    >
      {doorConfig?.isOpen ? '🔒 Zavřít dveře' : '🔓 Otevřít dveře'}
    </button>
  </div>
);

const ColorControls: React.FC<{ type: string; color?: number; onColorChange: (hex: number) => void }> = ({
  type,
  color,
  onColorChange,
}) => {
  if (type === 'ground' || type === 'soccerfield' || type === 'track' || type === 'track-curve') return null;
  const hexColor = `#${(color ?? 0xffffff).toString(16).padStart(6, '0')}`;

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-sm mb-3 text-gray-300">🎨 Změnit barvu</h4>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hexColor}
          onChange={(e) => onColorChange(parseInt(e.target.value.replace('#', ''), 16))}
          className="w-16 h-16 rounded-lg cursor-pointer border-2 border-yellow-500"
        />
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1">Aktuální barva:</div>
          <div className="w-full h-8 rounded border-2 border-yellow-500" style={{ backgroundColor: hexColor }} />
        </div>
      </div>
    </div>
  );
};

const MaterialControls: React.FC<{ type: string; material?: string; onMaterialChange: (m: string) => void }> = ({
  type,
  material,
  onMaterialChange,
}) => {
  if (type === 'ground' || type === 'soccerfield' || type === 'track' || type === 'track-curve') return null;

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-sm mb-3 text-gray-300">✨ Změnit materiál</h4>
      <div className="grid grid-cols-2 gap-2">
        {MATERIALS.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => onMaterialChange(key)}
            className={`p-3 rounded-lg border-2 transition-all ${
              material === key ? 'border-yellow-500 bg-yellow-900/50' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const TextureControls: React.FC<{
  type: string;
  textureParams: TextureParams;
  setTextureParams: (params: TextureParams) => void;
  onTextureAction: (key: string) => void;
  drawingsCount: number;
  activeDrawingType?: string | null;
}> = ({ type, textureParams, setTextureParams, onTextureAction, drawingsCount, activeDrawingType }) => {
  if (type !== 'box') return null;

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-sm mb-3 text-gray-300">🏒 Hokejové kresby</h4>

      {drawingsCount > 0 && (
        <div className="mb-3 p-2 bg-blue-900/30 border border-blue-500/30 rounded-lg text-xs text-blue-300">
          📌 Počet kreseb na objektu: <strong>{drawingsCount}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {TEXTURE_BUTTONS.map(({ key, label, icon, danger }) => (
          <button
            key={key}
            onClick={() => onTextureAction(key)}
            className={`flex items-center gap-2 p-2 rounded-lg border-2 text-xs transition ${
              danger
                ? 'border-red-500 bg-red-900/50 hover:bg-red-900/70'
                : 'border-blue-500/60 bg-blue-900/30 hover:bg-blue-900/40'
            }`}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-left">{label}</span>
          </button>
        ))}
      </div>

      {activeDrawingType && (
        <div className="mt-3 p-3 bg-green-900/30 rounded-lg border border-green-500/40 text-xs text-green-200 space-y-1">
          <div>
            ✅ Režim umístění: <span className="font-semibold text-green-100">{activeDrawingType}</span>
          </div>
          <div>⌨️ Šipky – jemný posun</div>
          <div>⌨️ Shift + Šipky – větší krok</div>
          <div>⌨️ Enter – potvrdit | Esc – zrušit</div>
        </div>
      )}

      <div className="mt-4 space-y-3 p-3 bg-gray-800 rounded-lg border border-yellow-500/30">
        <h5 className="font-semibold text-sm text-yellow-300 mb-1">⚙️ Nastavení kresby</h5>
        <p className="text-xs text-gray-400">Nejdřív nastav hodnoty a poté vyber typ kresby.</p>

        <RangeInput
          label="Pozice X"
          value={textureParams.posX}
          min={0}
          max={1}
          step={0.01}
          formatValue={(v) => v.toFixed(2)}
          onChange={(posX) => setTextureParams({ ...textureParams, posX })}
        />
        <RangeInput
          label="Pozice Y"
          value={textureParams.posY}
          min={0}
          max={1}
          step={0.01}
          formatValue={(v) => v.toFixed(2)}
          onChange={(posY) => setTextureParams({ ...textureParams, posY })}
        />
        <RangeInput
          label="Velikost"
          value={textureParams.scale}
          min={0.1}
          max={3}
          step={0.05}
          formatValue={(v) => v.toFixed(2)}
          onChange={(scale) => setTextureParams({ ...textureParams, scale })}
        />
        <RangeInput
          label="Rotace (°)"
          value={textureParams.rotation}
          min={0}
          max={360}
          step={1}
          formatValue={(v) => `${v.toFixed(0)}°`}
          onChange={(rotation) => setTextureParams({ ...textureParams, rotation })}
        />
        <RangeInput
          label="Opotřebení"
          value={textureParams.wear}
          min={0}
          max={1}
          step={0.01}
          formatValue={(v) => `${Math.round(v * 100)}%`}
          onChange={(wear) => setTextureParams({ ...textureParams, wear })}
        />
      </div>
    </div>
  );
};

const RangeInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}> = ({ label, value, min, max, step, onChange, formatValue }) => (
  <div>
    <label className="text-xs text-gray-400 block mb-1 flex justify-between">
      <span>{label}</span>
      <span className="text-yellow-300 font-mono">{formatValue ? formatValue(value) : value.toFixed(2)}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full"
    />
  </div>
);

