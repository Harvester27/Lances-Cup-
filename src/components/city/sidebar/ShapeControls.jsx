import React from 'react';

type Vec2 = [number, number];
type Vec3 = [number, number, number];

interface ShapeControlsProps {
  selectedShape: string | null;
  onShapeSelect: (shape: string) => void;
  boxSize: Vec3;
  onBoxSizeChange: (value: Vec3) => void;
  cylinderSize: Vec2;
  onCylinderSizeChange: (value: Vec2) => void;
  trackSize: Vec2;
  onTrackSizeChange: (value: Vec2) => void;
  trackCurveSize: Vec2;
  onTrackCurveSizeChange: (value: Vec2) => void;
  trackCurveCustomSize: Vec2;
  onTrackCurveCustomSizeChange: (value: Vec2) => void;
  trackCurveCustomAngle: number;
  onTrackCurveCustomAngleChange: (value: number) => void;
  boxCurveSize: Vec3;
  onBoxCurveSizeChange: (value: Vec3) => void;
  doorSize: Vec3;
  onDoorSizeChange: (value: Vec3) => void;
  doorHinge: 'left' | 'right';
  onDoorHingeChange: (value: 'left' | 'right') => void;
}

export const ShapeControls: React.FC<ShapeControlsProps> = ({
  selectedShape,
  onShapeSelect,
  boxSize,
  onBoxSizeChange,
  cylinderSize,
  onCylinderSizeChange,
  trackSize,
  onTrackSizeChange,
  trackCurveSize,
  onTrackCurveSizeChange,
  trackCurveCustomSize,
  onTrackCurveCustomSizeChange,
  trackCurveCustomAngle,
  onTrackCurveCustomAngleChange,
  boxCurveSize,
  onBoxCurveSizeChange,
  doorSize,
  onDoorSizeChange,
  doorHinge,
  onDoorHingeChange,
}) => (
  <>
    <div>
      <h3 className="font-semibold text-sm mb-3 text-gray-300">📐 Tvar objektu</h3>
      <div className="space-y-2">
        <button
          onClick={() => onShapeSelect('box')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'box'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">📦</div>
          <div className="font-semibold">Obdélník</div>
        </button>

        <button
          onClick={() => onShapeSelect('door')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'door'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🚪</div>
          <div className="font-semibold">Dveře</div>
        </button>

        <button
          onClick={() => onShapeSelect('cylinder')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'cylinder'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">⭕</div>
          <div className="font-semibold">Válec</div>
        </button>

        <button
          onClick={() => onShapeSelect('ground')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'ground'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🟩</div>
          <div className="font-semibold">Zemina</div>
        </button>

        <button
          onClick={() => onShapeSelect('soccerfield')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'soccerfield'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">⚽</div>
          <div className="font-semibold">Fotbalové hřiště</div>
        </button>

        <button
          onClick={() => onShapeSelect('track')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'track'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🛣️</div>
          <div className="font-semibold">Cesta (rovná)</div>
        </button>

        <button
          onClick={() => onShapeSelect('road-builder')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'road-builder'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🛣️✨</div>
          <div className="font-semibold">Silnice (táhnout)</div>
        </button>

        <button
          onClick={() => onShapeSelect('track-curve')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'track-curve'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🔄</div>
          <div className="font-semibold">Cesta (zatáčka 90°)</div>
        </button>

        <button
          onClick={() => onShapeSelect('track-curve-custom')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'track-curve-custom'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🔄📐</div>
          <div className="font-semibold">Cesta (zatáčka vlastní)</div>
        </button>

        <button
          onClick={() => onShapeSelect('box-curve')}
          className={`w-full p-3 rounded-lg border-2 transition-all ${
            selectedShape === 'box-curve'
              ? 'border-blue-500 bg-blue-900/50'
              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="text-3xl mb-1">🧊</div>
          <div className="font-semibold">Box (zatáčka)</div>
        </button>
      </div>
    </div>

    {selectedShape && (
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-300">📏 Velikost</h3>

        {selectedShape === 'box' && (
          <div className="space-y-3">
            <Slider
              label="Šířka (X)"
              value={boxSize[0]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onBoxSizeChange([value, boxSize[1], boxSize[2]])}
            />
            <Slider
              label="Výška (Y)"
              value={boxSize[1]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onBoxSizeChange([boxSize[0], value, boxSize[2]])}
            />
            <Slider
              label="Hloubka (Z)"
              value={boxSize[2]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onBoxSizeChange([boxSize[0], boxSize[1], value])}
            />
          </div>
        )}

        {selectedShape === 'door' && (
          <div className="space-y-4">
            <Slider
              label="Šířka (X)"
              value={doorSize[0]}
              min={0.5}
              max={5}
              step={0.05}
              onChange={(value) => onDoorSizeChange([value, doorSize[1], doorSize[2]])}
            />
            <Slider
              label="Výška (Y)"
              value={doorSize[1]}
              min={1}
              max={4}
              step={0.05}
              onChange={(value) => onDoorSizeChange([doorSize[0], value, doorSize[2]])}
            />
            <Slider
              label="Tloušťka (Z)"
              value={doorSize[2]}
              min={0.05}
              max={0.8}
              step={0.01}
              onChange={(value) => onDoorSizeChange([doorSize[0], doorSize[1], value])}
            />

            <div>
              <label className="text-xs text-gray-400 block mb-2">Panty</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDoorHingeChange('left')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    doorHinge === 'left'
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ↩️ Levé
                </button>
                <button
                  onClick={() => onDoorHingeChange('right')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    doorHinge === 'right'
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ↪️ Pravé
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              💡 V režimu první osoby (klávesa V) otevřeš nebo zavřeš dveře klávesou{' '}
              <span className="font-semibold">E</span>.
            </p>
          </div>
        )}

        {selectedShape === 'cylinder' && (
          <div className="space-y-3">
            <Slider
              label="Poloměr"
              value={cylinderSize[0]}
              min={0.1}
              max={100}
              step={0.5}
              onChange={(value) => onCylinderSizeChange([value, cylinderSize[1]])}
            />
            <Slider
              label="Výška"
              value={cylinderSize[1]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onCylinderSizeChange([cylinderSize[0], value])}
            />
          </div>
        )}

        {selectedShape === 'track' && (
          <div className="space-y-3">
            <Slider
              label="Délka"
              value={trackSize[1]}
              min={3}
              max={200}
              step={1}
              onChange={(value) => onTrackSizeChange([trackSize[0], value])}
            />
            <Slider
              label="Šířka"
              value={trackSize[0]}
              min={3}
              max={200}
              step={1}
              onChange={(value) => onTrackSizeChange([value, trackSize[1]])}
            />
          </div>
        )}

        {selectedShape === 'track-curve' && (
          <div className="space-y-3">
            <Slider
              label="Šířka"
              value={trackCurveSize[0]}
              min={3}
              max={200}
              step={1}
              onChange={(value) => onTrackCurveSizeChange([value, trackCurveSize[1]])}
            />
            <Slider
              label="Poloměr"
              value={trackCurveSize[1]}
              min={3}
              max={200}
              step={1}
              onChange={(value) => onTrackCurveSizeChange([trackCurveSize[0], value])}
            />
          </div>
        )}

        {selectedShape === 'track-curve-custom' && (
          <div className="space-y-3">
            <Slider
              label="Šířka"
              value={trackCurveCustomSize[0]}
              min={3}
              max={200}
              step={1}
              onChange={(value) => onTrackCurveCustomSizeChange([value, trackCurveCustomSize[1]])}
            />
            <Slider
              label="Poloměr"
              value={trackCurveCustomSize[1]}
              min={3}
              max={200}
              step={1}
              onChange={(value) => onTrackCurveCustomSizeChange([trackCurveCustomSize[0], value])}
            />
            <Slider
              label="Úhel (stupně)"
              value={trackCurveCustomAngle}
              min={1}
              max={89}
              step={1}
              onChange={(value) => onTrackCurveCustomAngleChange(value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              💡 Úhel zatáčky od 1° do 89°. Rotace pomocí kláves <span className="font-semibold">Q</span> a <span className="font-semibold">R</span>.
            </p>
          </div>
        )}

        {selectedShape === 'box-curve' && (
          <div className="space-y-3">
            <Slider
              label="Šířka"
              value={boxCurveSize[0]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onBoxCurveSizeChange([value, boxCurveSize[1], boxCurveSize[2]])}
            />
            <Slider
              label="Poloměr"
              value={boxCurveSize[1]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onBoxCurveSizeChange([boxCurveSize[0], value, boxCurveSize[2]])}
            />
            <Slider
              label="Výška"
              value={boxCurveSize[2]}
              min={0.1}
              max={200}
              step={0.5}
              onChange={(value) => onBoxCurveSizeChange([boxCurveSize[0], boxCurveSize[1], value])}
            />
          </div>
        )}
      </div>
    )}
  </>
);

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <label className="text-xs text-gray-400 block mb-1">
      {label}: {value.toFixed(1)}
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

