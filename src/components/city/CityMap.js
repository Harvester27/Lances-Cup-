import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { createMaterial } from './materialHelpers';
import { loadBuildings, clearAllBuildings, saveBuildings, createRealObject, createSoccerField, disposeObject } from './buildingHelpers';
import { checkCollision } from './sceneSetup';
import { initSunSystem } from './SunSystem';
import { initCloudSystem } from './Clouds';
import { initMoonSystem } from './MoonSystem';
import { 
  createFaceoffCircle, 
  createBlueLine, 
  createRedLine, 
  createGoalLine, 
  createCrease,
  createFaceoffDots,
  createCenterDot,
  createFullRink
} from './hockeyTextures';
import { useMapSlots } from './hooks/useMapSlots';
import { useCityScene } from './hooks/useCityScene';
import { MapSwitcher } from './sidebar/MapSwitcher';
import { ShapeControls } from './sidebar/ShapeControls';
import { SelectedObjectInspector } from './sidebar/SelectedObjectInspector';
import { BuildOptionsPanel } from './sidebar/BuildOptionsPanel';
import { TopBar } from './topbar/TopBar';
import { TerrainPanel } from './terrain/TerrainPanel';
import { TreeControls } from './sidebar/TreeControls';

const findWireframe = (object) => {
  if (!object) return null;
  if (object.type === 'LineSegments') return object;
  if (!object.children) return null;
  for (const child of object.children) {
    const found = findWireframe(child);
    if (found) return found;
  }
  return null;
};

const getDoorPanelMesh = (object) => {
  if (!object) return null;
  let target = null;
  object.traverse(child => {
    if (!target && child.userData && child.userData.isDoorPanel) {
      target = child;
    }
  });
  return target;
};

export default function CityBuilder() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const fpControlsRef = useRef(null); // First person controls
  const groundRef = useRef(null);
  const ghostBoxRef = useRef(null);
  const placedBoxes = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const ghostRotation = useRef(0);
  const selectedShapeRef = useRef(null);
  const mouseNeutralizedRef = useRef(false);
  const selectedObjectRef = useRef(null);
  const boxSizeRef = useRef([1, 1, 1]);
  const cylinderSizeRef = useRef([0.5, 1]);
  const trackSizeRef = useRef([10, 20]);
  const roadWidthRef = useRef(8);
  const trackSlopeRef = useRef(0);
  const trackCurveSizeRef = useRef([10, 10]);
  const trackCurveCustomSizeRef = useRef([10, 10]); // [šířka, poloměr] pro custom zatáčku
  const trackCurveCustomAngleRef = useRef(45); // Úhel zatáčky ve stupních (1-89)
  const boxCurveSizeRef = useRef([1, 2, 1]); // [šířka, poloměr, výška]
  const doorSizeRef = useRef([1, 2, 0.2]);
  const doorOptionsRef = useRef({ hinge: 'left', isOpen: false });
  const selectedColorRef = useRef(0xffffff);
  const selectedMaterialRef = useRef('standard');
  const withWindowsRef = useRef(false);
  const roadSurfaceRef = useRef('tartan'); // Ref pro typ povrchu cesty
  const sunUpdateRef = useRef(null);
  const moonUpdateRef = useRef(null); // Moon system reference
  const cloudSystemRef = useRef(null); // Cloud system reference
  const savedCameraPositionRef = useRef(null); // Pro uložení pozice kamery
  const savedCameraRotationRef = useRef(null); // Pro uložení rotace kamery
  const isFirstPersonRef = useRef(false); // Ref pro sledování režimu v animační smyčce
  const historyRef = useRef([]); // Historie přidaných objektů pro undo
  const prevCameraStateRef = useRef(null);
  const orbitBookmarkRef = useRef(null);
  const sceneReadyRef = useRef(false);
  
  const [buildingCount, setBuildingCount] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null);
  const [boxSize, setBoxSize] = useState([1, 1, 1]);
  const [cylinderSize, setCylinderSize] = useState([0.5, 1]);
  const [trackSize, setTrackSize] = useState([10, 20]); // [šířka, délka]
  const [roadWidth, setRoadWidth] = useState(8);
  const [trackSlopePercent, setTrackSlopePercent] = useState(0);
  const [trackCurveSize, setTrackCurveSize] = useState([10, 10]); // [šířka, poloměr]
  const [trackCurveCustomSize, setTrackCurveCustomSize] = useState([10, 10]); // [šířka, poloměr] pro custom zatáčku
  const [trackCurveCustomAngle, setTrackCurveCustomAngle] = useState(45); // Úhel zatáčky ve stupních (1-89)
  const [boxCurveSize, setBoxCurveSize] = useState([1, 2, 1]); // [šířka, poloměr, výška]
  const [doorSize, setDoorSize] = useState([1, 2, 0.2]); // [šířka, výška, tloušťka]
  const [doorHinge, setDoorHinge] = useState('left');
  const [doorStateVersion, setDoorStateVersion] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0xffffff);
  const [selectedMaterial, setSelectedMaterial] = useState('standard');
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [mouseNeutralized, setMouseNeutralized] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [withWindows, setWithWindows] = useState(false);
  const [currentTime, setCurrentTime] = useState(12);
  const [isPausedTime, setIsPausedTime] = useState(false);
  const [isFirstPerson, setIsFirstPerson] = useState(false); // Režim první osoby
  const [cloudCoverage, setCloudCoverage] = useState(0.5); // Pokrytí mraky
  const [cloudPreset, setCloudPreset] = useState('partlyCloudy'); // Preset počasí
  const [canUndo, setCanUndo] = useState(false); // Zda je možné undo
  const [roadSurface, setRoadSurface] = useState('tartan'); // Typ povrchu cesty
  const [textureParams, setTextureParams] = useState({ posX: 0.5, posY: 0.5, scale: 1, rotation: 0, wear: 0 }); // Parametry textury
  const [selectedDrawingType, setSelectedDrawingType] = useState(null); // Typ kresby k umístění
  const [drawingGhostPosition, setDrawingGhostPosition] = useState({ x: 0, z: 0 }); // Pozice ghost kresby
  const drawingGhostRef = useRef(null); // Ghost preview kresby
  const terrainManagerRef = useRef(null);
  const treeManagerRef = useRef(null);
  const terrainPaintingRef = useRef(false);
  const terrainGhostRef = useRef(null);
  const roadBuilderStateRef = useRef({
    isDrawing: false,
    startPoint: null,
    preview: null,
    basePoints: [],
    currentPoint: null,
  });
  const resetRoadBuilderState = useCallback(() => {
    const builder = roadBuilderStateRef.current;
    if (builder.preview && sceneRef.current) {
      sceneRef.current.remove(builder.preview);
      if (builder.preview.geometry) builder.preview.geometry.dispose();
      if (builder.preview.material) builder.preview.material.dispose();
    }
    roadBuilderStateRef.current = {
      isDrawing: false,
      startPoint: null,
      preview: null,
      basePoints: [],
      currentPoint: null,
    };
  }, [sceneRef]);
  const [editorMode, setEditorMode] = useState('build');
  const [terrainTool, setTerrainTool] = useState('raise');
  const [terrainRadius, setTerrainRadius] = useState(8);
  const [terrainStrength, setTerrainStrength] = useState(0.4);
  const [terrainSurfaceType, setTerrainSurfaceType] = useState(0); // 0 = tráva, 1 = skalnatý
  const [selectedTreeType, setSelectedTreeType] = useState(null); // 'conifer' nebo 'deciduous'
  const [treeHeight, setTreeHeight] = useState(8);
  const [treeCrownWidth, setTreeCrownWidth] = useState(4);
  const [treePlacementMode, setTreePlacementMode] = useState('single'); // 'single' nebo 'brush'
  const [treeBrushRadius, setTreeBrushRadius] = useState(15);
  const [treeBrushDensity, setTreeBrushDensity] = useState(0.5); // stromů/m²
  const selectedTreeTypeRef = useRef(null);
  const treeHeightRef = useRef(8);
  const treeCrownWidthRef = useRef(4);
  const treePlacementModeRef = useRef('single');
  const treeBrushRadiusRef = useRef(15);
  const treeBrushDensityRef = useRef(0.5);
  const treeGhostRef = useRef(null);
  const editorModeRef = useRef('build');
  
  // Synchronizace refs s state
  useEffect(() => {
    selectedTreeTypeRef.current = selectedTreeType;
    treeHeightRef.current = treeHeight;
    treeCrownWidthRef.current = treeCrownWidth;
    treePlacementModeRef.current = treePlacementMode;
    treeBrushRadiusRef.current = treeBrushRadius;
    treeBrushDensityRef.current = treeBrushDensity;
    editorModeRef.current = editorMode;
  }, [selectedTreeType, treeHeight, treeCrownWidth, treePlacementMode, treeBrushRadius, treeBrushDensity, editorMode]);

  const getTerrainHeightAt = useCallback(
    (position) => {
      if (!terrainManagerRef.current) return 0;
      return terrainManagerRef.current.getHeightAt(position);
    },
    []
  );
  const {
    selectedSlot,
    selectSlot,
    slots: mapSlots,
    selectedSlotRef,
    getCurrentMapKey
  } = useMapSlots();

  const syncBuildingCount = useCallback(() => {
    setBuildingCount(placedBoxes.current.length);
  }, []);

  const saveAndSyncBuildings = useCallback(() => {
    saveBuildings(placedBoxes.current, getCurrentMapKey());
    syncBuildingCount();
  }, [syncBuildingCount]);

  const reloadMap = useCallback(
    (slotIndex) => {
      if (!sceneRef.current) return;

      placedBoxes.current.forEach(box => {
        sceneRef.current.remove(box);
        disposeObject(box);
      });
      placedBoxes.current.length = 0;
      selectedObjectRef.current = null;
      setSelectedObject(null);
      historyRef.current = [];

      const count = loadBuildings(sceneRef.current, placedBoxes.current, `cityBuildings:slot${slotIndex}`);
      setBuildingCount(count);
      syncBuildingCount();
    },
    [setSelectedObject, syncBuildingCount]
  );
  useCityScene({
    containerRef,
    sceneRef,
    cameraRef,
    rendererRef,
    controlsRef,
    fpControlsRef,
    groundRef,
    ghostBoxRef,
      raycaster,
      mouse,
    ghostRotation,
      selectedShapeRef,
      mouseNeutralizedRef,
      boxSizeRef,
      cylinderSizeRef,
      trackSizeRef,
      trackCurveSizeRef,
      trackCurveCustomSizeRef,
      trackCurveCustomAngleRef,
    trackSlopeRef,
      boxCurveSizeRef,
    doorSizeRef,
    doorOptionsRef,
      selectedColorRef,
      selectedMaterialRef,
      withWindowsRef,
      roadSurfaceRef,
      placedBoxes,
      selectedObjectRef,
      setMouseNeutralized,
      setSelectedObject,
      setSelectedShape,
    saveAndSyncBuildings,
      historyRef,
    setCanUndo,
    reloadMap,
    selectedSlot,
    selectedSlotRef,
    setCurrentTime,
    setIsPausedTime,
    sunUpdateRef,
    moonUpdateRef,
    cloudSystemRef,
    sceneReadyRef,
    isFirstPersonRef,
    terrainManagerRef,
    treeManagerRef,
    editorModeRef,
    selectedTreeTypeRef,
    treeHeightRef,
    treeCrownWidthRef,
    getCurrentMapKey,
    getTerrainHeightAt,
    roadBuilderStateRef,
    roadWidthRef,
    resetRoadBuilderState,
  });

  // useEffect pro přepínání mezi režimy kamery
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !fpControlsRef.current) return;
    
    const camera = cameraRef.current;
    const orbitControls = controlsRef.current;
    const fpControls = fpControlsRef.current;
    
    // Synchronizace ref s state
    isFirstPersonRef.current = isFirstPerson;
    
    if (isFirstPerson) {
      // Přepnutí do first person režimu
      
      // Uložit aktuální pozici a rotaci
      savedCameraPositionRef.current = camera.position.clone();
      savedCameraRotationRef.current = camera.rotation.clone();
      
      // DŮLEŽITÉ: Úplně vypnout OrbitControls
      orbitControls.enabled = false;
      
      // Nastavit kameru na úroveň očí
      camera.position.y = fpControls.height;
      
      // Resetovat rotaci kamery pro první osobu
      camera.rotation.set(0, 0, 0);
      
      // Připojit FirstPersonControls
      fpControls.connect();
      
      // Zrušit výběr tvaru při vstupu do FP režimu
      if (selectedShapeRef.current) {
        selectedShapeRef.current = null;
        setSelectedShape(null);
      }
      
      console.log('First Person režim aktivován');
      
    } else {
      // Přepnutí zpět do orbital režimu
      
      // DŮLEŽITÉ: Úplně odpojit FirstPersonControls
      fpControls.disconnect();
      
      // Obnovit původní pozici kamery pokud byla uložena
      if (savedCameraPositionRef.current) {
        camera.position.copy(savedCameraPositionRef.current);
        camera.rotation.copy(savedCameraRotationRef.current);
      } else {
        // Výchozí pozice
        camera.position.set(8, 6, 8);
        camera.lookAt(0, 0, 0);
      }
      
      // Zapnout OrbitControls
      orbitControls.enabled = true;
      orbitControls.update();
      
      console.log('Orbital režim aktivován');
    }
  }, [isFirstPerson]);

  // useEffect pro globální handler klávesy V (přepínání režimu)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'KeyV') {
        setIsFirstPerson(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // useEffect pro načtení textureParams z vybraného objektu
  useEffect(() => {
    if (selectedObject && selectedObject.userData.textureParams) {
      setTextureParams(selectedObject.userData.textureParams);
    } else {
      // Reset na výchozí hodnoty
      setTextureParams({ posX: 0.5, posY: 0.5, scale: 1, rotation: 0, wear: 0 });
    }
  }, [selectedObject]);

  useEffect(() => {
    if (!selectedObject && !orbitBookmarkRef.current) return;
    if (!cameraRef.current || !controlsRef.current) return;
    if (isFirstPersonRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (selectedObject) {
      if (!orbitBookmarkRef.current) {
        orbitBookmarkRef.current = {
          position: camera.position.clone(),
          target: controls.target.clone()
        };
      }

      const targetPosition = selectedObject.position ? selectedObject.position.clone() : new THREE.Vector3();
      const size = selectedObject.userData?.size;
      const maxDimension = Array.isArray(size) ? Math.max(...size.map((value) => Math.abs(value))) : 1;
      const distance = Math.max(4, maxDimension * 1.6);
      const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      if (direction.lengthSq() === 0) {
        direction.set(0, 0.6, 0.8).normalize();
      }

      const newCameraPosition = targetPosition.clone().add(direction.multiplyScalar(distance));
      controls.target.copy(targetPosition);
      camera.position.copy(newCameraPosition);
      camera.updateProjectionMatrix();
      controls.update();
    } else if (orbitBookmarkRef.current) {
      const { position, target } = orbitBookmarkRef.current;
      controls.target.copy(target);
      camera.position.copy(position);
      camera.updateProjectionMatrix();
      controls.update();
      orbitBookmarkRef.current = null;
    }
  }, [selectedObject]);

  useEffect(() => {
    if (selectedShape !== 'road-builder' && roadBuilderStateRef.current.isDrawing) {
      resetRoadBuilderState();
    }
  }, [selectedShape, resetRoadBuilderState]);

  useEffect(() => {
    if (!selectedObject) return;

    const supportedCollisionTypes = new Set(['box', 'door', 'cylinder', 'ground', 'soccerfield', 'track']);
    const roundToStep = (value) => Math.round(value * 1000) / 1000;

    const handleObjectMoveKeys = (e) => {
      if (!selectedObjectRef.current) return;
      if (selectedObjectRef.current.userData?.type === 'road') {
        return;
      }
      if (selectedShapeRef.current || selectedDrawingType || mouseNeutralizedRef.current || isFirstPersonRef.current) return;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

      e.preventDefault();
      const fineStep = e.altKey ? 0.01 : 0.1;
      const step = e.shiftKey ? 1 : fineStep;

      let deltaX = 0;
      let deltaZ = 0;
      switch (e.key) {
        case 'ArrowUp':
          deltaZ = -step;
          break;
        case 'ArrowDown':
          deltaZ = step;
          break;
        case 'ArrowLeft':
          deltaX = -step;
          break;
        case 'ArrowRight':
          deltaX = step;
          break;
      }

      const object = selectedObjectRef.current;
      const newPosition = object.position.clone();
      newPosition.x = roundToStep(newPosition.x + deltaX);
      newPosition.z = roundToStep(newPosition.z + deltaZ);

      const shapeType = object.userData?.type;
      const size = object.userData?.size;

      if (shapeType && size && supportedCollisionTypes.has(shapeType)) {
        const hasCollision = checkCollision(newPosition, size, shapeType, placedBoxes.current, object);
        if (hasCollision) {
          return;
        }
      }

      if (object.userData?.snapToTerrain) {
        const terrainBase = getTerrainHeightAt(newPosition);
        const offset = typeof object.userData.terrainOffset === 'number' ? object.userData.terrainOffset : 0;
        newPosition.y = terrainBase + offset;
      }

      object.position.copy(newPosition);
      saveAndSyncBuildings();
    };

    window.addEventListener('keydown', handleObjectMoveKeys);
    return () => {
      window.removeEventListener('keydown', handleObjectMoveKeys);
    };
  }, [selectedObject, selectedDrawingType, selectedShape, isFirstPerson, getTerrainHeightAt]);

  // useEffect pro ghost kresbu a ovládání šipkami
  useEffect(() => {
    if (!selectedObject || !selectedDrawingType) {
      // Odstranit ghost pokud existuje
      if (drawingGhostRef.current) {
        selectedObject?.remove(drawingGhostRef.current);
        if (drawingGhostRef.current.geometry) drawingGhostRef.current.geometry.dispose();
        if (drawingGhostRef.current.material) {
          if (drawingGhostRef.current.material.map) drawingGhostRef.current.material.map.dispose();
          drawingGhostRef.current.material.dispose();
        }
        drawingGhostRef.current = null;
      }
      return;
    }

    // Vytvořit nebo updatovat ghost preview
    const updateGhost = () => {
      // Odstranit starý ghost
      if (drawingGhostRef.current) {
        selectedObject.remove(drawingGhostRef.current);
        if (drawingGhostRef.current.geometry) drawingGhostRef.current.geometry.dispose();
        if (drawingGhostRef.current.material) {
          if (drawingGhostRef.current.material.map) drawingGhostRef.current.material.map.dispose();
          drawingGhostRef.current.material.dispose();
        }
      }

      // Vytvořit texturu podle typu
      let texture = null;
      const options = { 
        posX: textureParams.posX, 
        posY: textureParams.posY, 
        scale: textureParams.scale, 
        rotation: textureParams.rotation 
      };

      switch (selectedDrawingType) {
        case 'faceoff-red':
          texture = createFaceoffCircle('#ff0000', options);
          break;
        case 'faceoff-blue':
          texture = createFaceoffCircle('#0033cc', options);
          break;
        case 'blue-line':
          texture = createBlueLine(options);
          break;
        case 'red-line':
          texture = createRedLine(options);
          break;
        case 'goal-line':
          texture = createGoalLine(options);
          break;
        case 'crease':
          texture = createCrease(options);
          break;
        case 'faceoff-dots':
          texture = createFaceoffDots('#ff0000', options);
          break;
        case 'center-dot':
          texture = createCenterDot('#0033cc', options);
          break;
        case 'full-rink':
          texture = createFullRink(options);
          break;
      }

      if (texture) {
        const size = selectedObject.userData.size || [1, 1, 1];
        const planeGeometry = new THREE.PlaneGeometry(size[0], size[2]);
        const planeMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: true,
          opacity: 0.7 // Ghost je průhlednější
        });

        const ghost = new THREE.Mesh(planeGeometry, planeMaterial);
        ghost.position.set(drawingGhostPosition.x, size[1] / 2 + 0.02, drawingGhostPosition.z);
        ghost.rotation.x = -Math.PI / 2;
        ghost.renderOrder = 999; // Vykreslit navrch

        selectedObject.add(ghost);
        drawingGhostRef.current = ghost;
      }
    };

    updateGhost();

    // Ovládání šipkami
    const handleDrawingKeys = (e) => {
      if (!selectedDrawingType || !selectedObject) return;

      const step = e.shiftKey ? 0.1 : 0.01;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setDrawingGhostPosition(prev => ({ ...prev, z: prev.z - step }));
          if (drawingGhostRef.current) {
            drawingGhostRef.current.position.z -= step;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          setDrawingGhostPosition(prev => ({ ...prev, z: prev.z + step }));
          if (drawingGhostRef.current) {
            drawingGhostRef.current.position.z += step;
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setDrawingGhostPosition(prev => ({ ...prev, x: prev.x - step }));
          if (drawingGhostRef.current) {
            drawingGhostRef.current.position.x -= step;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          setDrawingGhostPosition(prev => ({ ...prev, x: prev.x + step }));
          if (drawingGhostRef.current) {
            drawingGhostRef.current.position.x += step;
          }
          break;
        case 'Enter':
          e.preventDefault();
          // Umístit kresbu
          if (drawingGhostRef.current) {
            const size = selectedObject.userData.size || [1, 1, 1];
            const planeGeometry = new THREE.PlaneGeometry(size[0], size[2]);
            const planeMaterial = new THREE.MeshBasicMaterial({
              map: drawingGhostRef.current.material.map.clone(),
              transparent: true,
              alphaTest: 0.5,
              side: THREE.DoubleSide,
              depthWrite: false,
              depthTest: true,
              opacity: 1.0 // Skutečná kresba není průhledná
            });

            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.position.copy(drawingGhostRef.current.position);
            plane.rotation.copy(drawingGhostRef.current.rotation);
            plane.renderOrder = 999; // Vykreslit navrch

            const drawingId = Date.now() + Math.random();
            plane.userData = {
              isDrawing: true,
              drawingId: drawingId,
              drawingType: selectedDrawingType,
              textureParams: { ...textureParams }
            };

            selectedObject.add(plane);

            if (!selectedObject.userData.drawings) {
              selectedObject.userData.drawings = [];
            }
            selectedObject.userData.drawings.push({
              id: drawingId,
              type: selectedDrawingType,
              textureParams: { ...textureParams },
              position: { x: drawingGhostPosition.x, z: drawingGhostPosition.z }
            });

            saveAndSyncBuildings();
            console.log('Kresba umístěna:', selectedDrawingType);

            // Reset ghost pozice pro další kresbu
            setDrawingGhostPosition({ x: 0, z: 0 });
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedDrawingType(null);
          setDrawingGhostPosition({ x: 0, z: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleDrawingKeys);

    return () => {
      window.removeEventListener('keydown', handleDrawingKeys);
      // Odstranit ghost při unmount
      if (drawingGhostRef.current && selectedObject) {
        selectedObject.remove(drawingGhostRef.current);
        if (drawingGhostRef.current.geometry) drawingGhostRef.current.geometry.dispose();
        if (drawingGhostRef.current.material) {
          if (drawingGhostRef.current.material.map) drawingGhostRef.current.material.map.dispose();
          drawingGhostRef.current.material.dispose();
        }
      }
    };
  }, [selectedDrawingType, selectedObject, textureParams, drawingGhostPosition]);

  // Handlery pro ovládání času
  const handleTimeChange = (hour) => {
    if (sunUpdateRef.current) {
      sunUpdateRef.current.setTime(hour);
      setCurrentTime(hour);
      
      // Update měsíčního systému s pozicí slunce
      if (moonUpdateRef.current) {
        const sunPosition = sunUpdateRef.current.getSunPosition();
        moonUpdateRef.current.update(hour, undefined, sunPosition);
      }
    }
  };

  const handleSpeedUp = () => {
    if (sunUpdateRef.current) {
      sunUpdateRef.current.speedUp();
    }
  };

  const handleSlowDown = () => {
    if (sunUpdateRef.current) {
      sunUpdateRef.current.slowDown();
    }
  };

  const handleTogglePause = () => {
    if (sunUpdateRef.current) {
      const paused = sunUpdateRef.current.togglePause();
      setIsPausedTime(paused);
    }
  };

  // Handlery pro ovládání mraků
  const handleCloudCoverageChange = (value) => {
    if (cloudSystemRef.current) {
      cloudSystemRef.current.setCoverage(value);
      setCloudCoverage(value);
    }
  };

  const handleCloudPresetChange = (preset) => {
    if (cloudSystemRef.current && cloudSystemRef.current.presets[preset]) {
      cloudSystemRef.current.presets[preset]();
      setCloudPreset(preset);
      setCloudCoverage(cloudSystemRef.current.getCoverage());
    }
  };

  // Handler pro výběr tvaru
  const handleShapeSelect = (shape) => {
    selectedShapeRef.current = shape;
    setSelectedShape(shape);
    ghostRotation.current = 0;
    
    if (selectedObjectRef.current && selectedObjectRef.current.material) {
      selectedObjectRef.current.material.emissive.setHex(0x000000);
      selectedObjectRef.current = null;
      setSelectedObject(null);
    }
  };
  
  // Handler pro změnu barvy označeného objektu
  const handleSelectedObjectColorChange = (newColor) => {
    if (!selectedObject) return;
    
    const targetMesh = selectedObject.material ? selectedObject : getDoorPanelMesh(selectedObject);
    if (!targetMesh || !targetMesh.material) return;
    
    targetMesh.material.color.setHex(newColor);
    if (targetMesh.material.emissive) {
      targetMesh.material.emissive.setHex(newColor);
    }
    
    // DŮLEŽITÉ: Aktualizovat userData - toto se ukládá do localStorage
    if (selectedObject.userData) {
      selectedObject.userData.color = newColor;
    }
    
    // Uložit změny do localStorage
    saveAndSyncBuildings();
    
    console.log('Barva změněna a uložena:', newColor, selectedObject.userData);
  };

  // Handler pro změnu materiálu označeného objektu
  const handleSelectedObjectMaterialChange = (newMaterialType) => {
    if (!selectedObject) return;
    
    const targetMesh = selectedObject.geometry ? selectedObject : getDoorPanelMesh(selectedObject);
    if (!targetMesh || !targetMesh.geometry) return;
    
    // Získat aktuální barvu z materiálu (nikoliv z userData!)
    const currentColor = targetMesh.material?.color?.getHex() || 0xffffff;
    
    // Dispose starého materiálu
    if (targetMesh.material) {
      targetMesh.material.dispose();
    }
    
    // Vytvořit nový materiál se zachováním barvy
    const newMaterial = createMaterial(newMaterialType, currentColor, false);
    targetMesh.material = newMaterial;
    
    // DŮLEŽITÉ: Aktualizovat userData - toto se ukládá do localStorage
    if (selectedObject.userData) {
      selectedObject.userData.material = newMaterialType;
      selectedObject.userData.color = currentColor; // Zajistit že barva je uložená
    }
    
    // Uložit změny do localStorage
    saveAndSyncBuildings();
    
    console.log('Materiál změněn a uložen:', newMaterialType, 'barva:', currentColor, selectedObject.userData);
  };

  const handleDeselectObject = useCallback(() => {
    if (selectedObjectRef.current) {
      const wireframe = findWireframe(selectedObjectRef.current);
      if (wireframe) {
        wireframe.material.color.setHex(0xffffff);
      }
      selectedObjectRef.current = null;
    }
    setSelectedObject(null);
    selectedShapeRef.current = null;
  }, []);

  const handleClearShapeSelection = useCallback(() => {
    selectedShapeRef.current = null;
    setSelectedShape(null);
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
    if (selectedObjectRef.current) {
      const wireframe = findWireframe(selectedObjectRef.current);
      if (wireframe) {
        wireframe.material.color.setHex(0xffffff);
      }
      selectedObjectRef.current = null;
    }
    setSelectedObject(null);
    if (roadBuilderStateRef.current.isDrawing || roadBuilderStateRef.current.preview) {
      resetRoadBuilderState();
    }
  }, [resetRoadBuilderState]);

  const handleRoadSurfaceChange = useCallback((surface) => {
    setRoadSurface(surface);
    roadSurfaceRef.current = surface;
  }, []);

  const handleTrackSlopeChange = useCallback((value) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(numericValue)) return;
    const clamped = Math.max(-12, Math.min(12, numericValue));
    setTrackSlopePercent(clamped);
    trackSlopeRef.current = clamped;
  }, []);

  const handleRoadWidthChange = useCallback((value) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(numericValue)) return;
    const clamped = Math.max(3, Math.min(50, numericValue));
    setRoadWidth(clamped);
    roadWidthRef.current = clamped;
  }, []);

  const handleToggleWindows = useCallback(() => {
    setWithWindows((prev) => !prev);
  }, []);

  const handleClearAll = useCallback(() => {
    const wasCleared = clearAllBuildings(
      sceneRef.current,
      placedBoxes.current,
      selectedObjectRef,
      setSelectedObject,
      getCurrentMapKey()
    );
    if (wasCleared) {
      setBuildingCount(0);
      historyRef.current = [];
      setCanUndo(false);
    }
  }, [getCurrentMapKey]);

  const handleEditorModeChange = useCallback(
    (mode) => {
      setEditorMode(mode);
      // Skrýt tree ghost při opuštění tree módu
      if (mode !== 'trees' && treeGhostRef.current) {
        treeGhostRef.current.visible = false;
      }
      if (mode === 'terrain') {
        terrainPaintingRef.current = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
        selectedShapeRef.current = null;
        setSelectedShape(null);
        if (selectedObjectRef.current) {
          selectedObjectRef.current = null;
          setSelectedObject(null);
        }
        if (selectedDrawingType) {
          setSelectedDrawingType(null);
        }
        mouseNeutralizedRef.current = false;
        setMouseNeutralized(false);
        resetRoadBuilderState();
      }
    },
    [selectedDrawingType, resetRoadBuilderState]
  );

  const paintTerrainAtPointer = useCallback(
    (event, isPainting = false) => {
      if (
        !terrainManagerRef.current ||
        !cameraRef.current ||
        !rendererRef.current ||
        !raycaster.current ||
        !mouse.current ||
        !sceneRef.current
      ) {
        return;
      }
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.current.set(ndcX, ndcY);
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);

      const terrainMeshes = terrainManagerRef.current.getMeshes();
      if (!terrainMeshes || terrainMeshes.length === 0) {
        // Skrýt ghost pokud není terén
        if (terrainGhostRef.current) {
          terrainGhostRef.current.visible = false;
        }
        return;
      }
      const intersects = raycaster.current.intersectObjects(terrainMeshes, false);
      if (!intersects.length) {
        // Skrýt ghost pokud není průsečík
        if (terrainGhostRef.current) {
          terrainGhostRef.current.visible = false;
        }
        return;
      }

      const hitPoint = intersects[0].point;
      const terrainHeight = terrainManagerRef.current.getHeightAt(hitPoint);

      // Vytvořit nebo aktualizovat ghost objekt pro preview
      if (!terrainGhostRef.current) {
        const surfaceColors = {
          0: 0x3b6b3b, // Tráva
          1: 0x5a5a5a, // Skalnatý
          2: 0xd4c5a9, // Písek
          3: 0xf0f0f0, // Sníh
          4: 0x8a8a8a, // Beton
          5: 0xb8d4e8, // Led
        };
        const ghostGeometry = new THREE.RingGeometry(0.1, terrainRadius, 32);
        const ghostMaterial = new THREE.MeshBasicMaterial({
          color: terrainTool === 'paint-surface' 
            ? (surfaceColors[terrainSurfaceType] || 0x3b6b3b)
            : 0x00ff00,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
        });
        terrainGhostRef.current = new THREE.Mesh(ghostGeometry, ghostMaterial);
        terrainGhostRef.current.rotation.x = -Math.PI / 2;
        sceneRef.current.add(terrainGhostRef.current);
      }

      // Aktualizovat ghost objekt
      terrainGhostRef.current.position.set(hitPoint.x, terrainHeight + 0.1, hitPoint.z);
      terrainGhostRef.current.visible = true;
      
      // Aktualizovat velikost podle radius
      const currentGeometry = terrainGhostRef.current.geometry;
      const currentOuterRadius = currentGeometry.parameters?.outerRadius || 0;
      if (Math.abs(currentOuterRadius - terrainRadius) > 0.1) {
        currentGeometry.dispose();
        terrainGhostRef.current.geometry = new THREE.RingGeometry(0.1, terrainRadius, 32);
      }

      // Aktualizovat barvu podle typu povrchu nebo toolu
      if (terrainTool === 'paint-surface') {
        const surfaceColors = {
          0: 0x3b6b3b, // Tráva
          1: 0x5a5a5a, // Skalnatý
          2: 0xd4c5a9, // Písek
          3: 0xf0f0f0, // Sníh
          4: 0x8a8a8a, // Beton
          5: 0xb8d4e8, // Led
        };
        terrainGhostRef.current.material.color.setHex(
          surfaceColors[terrainSurfaceType] || 0x3b6b3b
        );
      } else {
        terrainGhostRef.current.material.color.setHex(0x00ff00);
      }

      // Pokud je aktivní malování, aplikovat změny
      if (isPainting) {
        if (terrainTool === 'paint-surface') {
          terrainManagerRef.current.applySurfaceBrush(hitPoint, {
            surfaceType: terrainSurfaceType,
            radius: terrainRadius,
            strength: terrainStrength,
          });
        } else {
          terrainManagerRef.current.applyBrush(hitPoint, {
            mode: terrainTool,
            radius: terrainRadius,
            strength: terrainStrength,
          });
        }
      }
    },
    [terrainTool, terrainRadius, terrainStrength, terrainSurfaceType, sceneRef]
  );

  useEffect(() => {
    if (
      editorMode !== 'terrain' ||
      !rendererRef.current ||
      !terrainManagerRef.current ||
      !cameraRef.current
    ) {
      return;
    }
    const canvas = rendererRef.current.domElement;
    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      terrainPaintingRef.current = true;
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      paintTerrainAtPointer(event, true);
    };
    const handlePointerMove = (event) => {
      event.preventDefault();
      paintTerrainAtPointer(event, terrainPaintingRef.current);
    };
    const handlePointerUp = () => {
      if (!terrainPaintingRef.current) return;
      terrainPaintingRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
      if (terrainManagerRef.current) {
        terrainManagerRef.current.saveDirtyChunks();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      terrainPaintingRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
      // Skrýt ghost při opuštění terrain módu
      if (terrainGhostRef.current) {
        terrainGhostRef.current.visible = false;
      }
    };
  }, [editorMode, paintTerrainAtPointer]);
  // Handler pro aplikaci hokejové kresby - přidá drawing jako plane
  const handleSelectedObjectTextureChange = (textureName) => {
    if (!selectedObject) return;
    
    if (textureName === 'none') {
      // Odstranit všechny kresby z objektu
      const drawings = selectedObject.children.filter(child => child.userData.isDrawing);
      drawings.forEach(drawing => {
        selectedObject.remove(drawing);
        if (drawing.material.map) drawing.material.map.dispose();
        drawing.material.dispose();
        drawing.geometry.dispose();
      });
      
      if (selectedObject.userData) {
        selectedObject.userData.drawings = [];
      }
      saveAndSyncBuildings();
      console.log('Všechny kresby odstraněny');
      return;
    }
    
    // Aktivovat režim umísťování kresby
    setSelectedDrawingType(textureName);
    setDrawingGhostPosition({ x: 0, z: 0 });
    console.log('Režim umísťování:', textureName);
  };

  const ensureDoorRuntime = (doorObject) => {
    if (!doorObject || doorObject.userData?.type !== 'door') return null;
    if (doorObject.userData.doorRuntime?.pivot) {
      return doorObject.userData.doorRuntime;
    }
    const panel = getDoorPanelMesh(doorObject);
    if (panel && panel.parent) {
      const runtime = { pivot: panel.parent, panel };
      doorObject.userData.doorRuntime = runtime;
      return runtime;
    }
    return null;
  };

  const toggleDoorState = useCallback((doorObject) => {
    if (!doorObject || doorObject.userData?.type !== 'door') return;
    const runtime = ensureDoorRuntime(doorObject);
    if (!runtime) return;
    const hinge = doorObject.userData.doorConfig?.hinge === 'right' ? 'right' : 'left';
    const nextState = !(doorObject.userData.doorConfig?.isOpen || false);
    const direction = hinge === 'left' ? 1 : -1;
    const targetAngle = nextState ? (Math.PI / 2) * direction : 0;
    runtime.pivot.rotation.y = targetAngle;
    doorObject.userData.doorConfig = {
      hinge,
      isOpen: nextState,
      openAngle: targetAngle
    };
    saveAndSyncBuildings();
    setDoorStateVersion(prev => prev + 1);
  }, [placedBoxes]);

  useEffect(() => {
    const handleDoorInteract = (e) => {
      if (e.code !== 'KeyE') return;
      if (!isFirstPersonRef.current) return;
      if (!cameraRef.current || !raycaster.current) return;
      
      const camera = cameraRef.current;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const origin = camera.position.clone();
      raycaster.current.set(origin, direction.normalize());
      
      const intersects = raycaster.current.intersectObjects(placedBoxes.current, true);
      for (const intersect of intersects) {
        let parent = intersect.object;
        while (parent && !placedBoxes.current.includes(parent)) {
          parent = parent.parent;
        }
        if (!parent) continue;
        if (parent.userData?.type === 'door') {
          const distance = camera.position.distanceTo(parent.position);
          if (distance > 4) continue;
          toggleDoorState(parent);
          break;
        }
      }
    };
    
    window.addEventListener('keydown', handleDoorInteract);
    return () => {
      window.removeEventListener('keydown', handleDoorInteract);
    };
  }, [toggleDoorState]);

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (selectedObject) {
      if (!prevCameraStateRef.current) {
        prevCameraStateRef.current = {
          position: camera.position.clone(),
          target: controls.target.clone()
        };
      }

      const target = selectedObject.position.clone();
      const size = selectedObject.userData?.size;
      let desiredDistance = 6;
      if (Array.isArray(size) && size.length > 0) {
        desiredDistance = Math.max(...size) * 1.5 + 2;
      }

      const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      if (!Number.isFinite(direction.length()) || direction.length() === 0) {
        direction.set(1, 0.5, 1).normalize();
      }

      const newPosition = target.clone().add(direction.multiplyScalar(Math.max(desiredDistance, 3)));
      camera.position.lerp(newPosition, 0.4);
      controls.target.copy(target);
      controls.update();
    } else if (prevCameraStateRef.current) {
      const { position, target } = prevCameraStateRef.current;
      controls.target.copy(target);
      camera.position.copy(position);
      controls.update();
      prevCameraStateRef.current = null;
    }
  }, [selectedObject]);

  const applyDrawingsToMesh = (mesh, drawings, size) => {
    if (!mesh || !drawings || drawings.length === 0 || !size) return;
    drawings.forEach(drawingData => {
      let texture = null;
      const options = drawingData.textureParams || { posX: 0.5, posY: 0.5, scale: 1, rotation: 0 };
      switch (drawingData.type) {
        case 'faceoff-red':
          texture = createFaceoffCircle('#ff0000', options);
          break;
        case 'faceoff-blue':
          texture = createFaceoffCircle('#0033cc', options);
          break;
        case 'blue-line':
          texture = createBlueLine(options);
          break;
        case 'red-line':
          texture = createRedLine(options);
          break;
        case 'goal-line':
          texture = createGoalLine(options);
          break;
        case 'crease':
          texture = createCrease(options);
          break;
        case 'faceoff-dots':
          texture = createFaceoffDots('#ff0000', options);
          break;
        case 'center-dot':
          texture = createCenterDot('#0033cc', options);
          break;
        case 'full-rink':
          texture = createFullRink(options);
          break;
      }
      if (!texture) return;

      const planeGeometry = new THREE.PlaneGeometry(size[0], size[2]);
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true
      });

      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      if (drawingData.position) {
        planeMesh.position.set(
          drawingData.position.x,
          size[1] / 2 + 0.01,
          drawingData.position.z
        );
      } else {
        planeMesh.position.y = size[1] / 2 + 0.01;
      }
      planeMesh.rotation.x = -Math.PI / 2;
      planeMesh.renderOrder = 999;
      planeMesh.userData = {
        isDrawing: true,
        drawingId: drawingData.id || Date.now() + Math.random(),
        drawingType: drawingData.type,
        textureParams: drawingData.textureParams
      };
      mesh.add(planeMesh);
    });

    mesh.userData.drawings = drawings.map(drawing => ({
      ...drawing,
      textureParams: drawing.textureParams ? { ...drawing.textureParams } : undefined,
      position: drawing.position ? { ...drawing.position } : undefined
    }));
  };

  const restoreDeletedObject = (snapshot) => {
    if (!snapshot || !sceneRef.current || !snapshot.type || !snapshot.position) return null;

    if (snapshot.type === 'soccerfield') {
      const fieldGroup = createSoccerField();
      fieldGroup.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
      if (snapshot.rotation) {
        fieldGroup.rotation.set(snapshot.rotation.x || 0, snapshot.rotation.y || 0, snapshot.rotation.z || 0);
      }
      fieldGroup.userData = {
        type: 'soccerfield',
        size: snapshot.size || [90, 70],
        color: snapshot.color || 0x4a7c26,
        material: snapshot.material || 'standard'
      };
      sceneRef.current.add(fieldGroup);
      placedBoxes.current.push(fieldGroup);
      saveAndSyncBuildings();
      return fieldGroup;
    }

    const restoredSize = snapshot.size ? [...snapshot.size] : [1, 1, 1];
    const position = new THREE.Vector3(snapshot.position.x, snapshot.position.y, snapshot.position.z);
    const rotationValue = snapshot.type === 'track'
      ? (snapshot.rotation?.z || 0)
      : (snapshot.rotation?.y || 0);

    const extraOptions = {
      ...(snapshot.doorConfig || {}),
    };

    if (snapshot.type === 'track' || snapshot.type === 'track-curve') {
      extraOptions.trackSlopePercent = snapshot.trackSlopePercent || 0;
      if (snapshot.trackEndpoints) {
        extraOptions.trackEndpoints = {
          start: snapshot.trackEndpoints.start ? { ...snapshot.trackEndpoints.start } : undefined,
          end: snapshot.trackEndpoints.end ? { ...snapshot.trackEndpoints.end } : undefined,
        };
      }
    }

    if (snapshot.type === 'road') {
      extraOptions.pathPoints = snapshot.roadPath || [];
      extraOptions.roadWidth = snapshot.roadWidth || (restoredSize?.[0] || 6);
    }

    const placementPosition = snapshot.type === 'road'
      ? new THREE.Vector3(0, 0, 0)
      : position;

    const restoredObject = createRealObject(
      snapshot.type,
      placementPosition,
      rotationValue,
      restoredSize,
      snapshot.color ?? 0xffffff,
      snapshot.material || 'standard',
      snapshot.withWindows || false,
      sceneRef.current,
      placedBoxes.current,
      snapshot.roadSurface || 'tartan',
      extraOptions
    );

    if (snapshot.drawings && snapshot.drawings.length && snapshot.type === 'box') {
      applyDrawingsToMesh(restoredObject, snapshot.drawings, restoredSize);
      saveAndSyncBuildings();
    }

    return restoredObject;
  };

  // Handler pro UNDO - vrátit poslední akci
  const handleUndo = () => {
    if (historyRef.current.length === 0) return;
    
    const lastEntry = historyRef.current.pop();
    if (!lastEntry) {
      setCanUndo(historyRef.current.length > 0);
      return;
    }

    if (lastEntry.type === 'delete') {
      const restoredObject = restoreDeletedObject(lastEntry.data);
      if (restoredObject) {
        syncBuildingCount();
      }
      setCanUndo(historyRef.current.length > 0);
      return;
    }

    const lastObject = lastEntry.type === 'create' ? lastEntry.object : lastEntry;
    if (!lastObject) {
      setCanUndo(historyRef.current.length > 0);
      return;
    }

    const index = placedBoxes.current.indexOf(lastObject);
    if (index > -1) {
      placedBoxes.current.splice(index, 1);
    }
    
    if (sceneRef.current) sceneRef.current.remove(lastObject);
    disposeObject(lastObject);
    
    saveAndSyncBuildings();
    
    if (selectedObjectRef.current === lastObject) {
      selectedObjectRef.current = null;
      setSelectedObject(null);
    }
    
    setCanUndo(historyRef.current.length > 0);
  };

  // useEffect pro aktualizaci ghost objektu při změně nastavení
  useEffect(() => {
    if (!ghostBoxRef.current || !sceneRef.current) return;
    
    if (!selectedShape) {
      ghostBoxRef.current.visible = false;
      return;
    }

    if (selectedShape === 'road-builder') {
      ghostBoxRef.current.visible = false;
      return;
    }

    const scene = sceneRef.current;
    const oldGhost = ghostBoxRef.current;
    
    scene.remove(oldGhost);
    if (oldGhost.geometry) oldGhost.geometry.dispose();
    if (oldGhost.material) oldGhost.material.dispose();
    
    let geometry;
    let material;
    
    if (selectedShape === 'box') {
      geometry = new THREE.BoxGeometry(...boxSize);
      material = createMaterial(selectedMaterial, selectedColor, true);
    } else if (selectedShape === 'cylinder') {
      geometry = new THREE.CylinderGeometry(cylinderSize[0], cylinderSize[0], cylinderSize[1], 32);
      material = createMaterial(selectedMaterial, selectedColor, true);
    } else if (selectedShape === 'ground') {
      geometry = new THREE.PlaneGeometry(90, 70, 150, 120);
      material = new THREE.MeshStandardMaterial({ 
        color: 0xb5e5b5,
        transparent: true,
        opacity: 0.5,
        roughness: 0.9,
        metalness: 0.0
      });
    } else if (selectedShape === 'soccerfield') {
      geometry = new THREE.PlaneGeometry(90, 70, 150, 120);
      material = new THREE.MeshStandardMaterial({ 
        color: 0x4a7c26,
        transparent: true,
        opacity: 0.5,
        roughness: 0.9,
        metalness: 0.0
      });
    } else if (selectedShape === 'track') {
      geometry = new THREE.PlaneGeometry(trackSize[0], trackSize[1], 40, 40);
      if (trackSize[1] > 0 && Math.abs(trackSlopePercent) > 0.0001) {
        const positions = geometry.attributes.position;
        const length = trackSize[1];
        const totalDelta = (trackSlopePercent / 100) * length;
        for (let i = 0; i < positions.count; i++) {
          const localY = positions.getY(i);
          const progress = (localY + length / 2) / length; // 0 -> start, 1 -> konec
          const heightOffset = (progress - 0.5) * totalDelta;
          positions.setZ(i, positions.getZ(i) + heightOffset);
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      }
      material = new THREE.MeshStandardMaterial({ 
        color: roadSurface === 'asphalt' ? 0x333333 : roadSurface === 'gravel' ? 0x8B7355 : roadSurface === 'dirt' ? 0x6B4423 : 0xb8442e,
        transparent: true,
        opacity: 0.8,
        roughness: 0.8,
        metalness: 0.0
      });
    } else if (selectedShape === 'track-curve-custom') {
      const curveSegments = 40;
      const widthSegments = 40;
      const innerRadius = trackCurveCustomSize[1];
      const outerRadius = innerRadius + trackCurveCustomSize[0];
      const curveAngleRadians = (trackCurveCustomAngle * Math.PI) / 180;
      const middleRadius = (innerRadius + outerRadius) / 2;
      
      // Vypočítat střed oblouku pro vycentrování geometrie
      const centerAngle = curveAngleRadians / 2;
      const centerOffsetX = Math.cos(centerAngle) * middleRadius;
      const centerOffsetZ = Math.sin(centerAngle) * middleRadius;
      
      const vertices = [];
      const indices = [];
      const uvs = [];
      
      for (let i = 0; i <= widthSegments; i++) {
        const radius = innerRadius + (outerRadius - innerRadius) * (i / widthSegments);
        for (let j = 0; j <= curveSegments; j++) {
          const angle = curveAngleRadians * (j / curveSegments);
          const x = Math.cos(angle) * radius - centerOffsetX;
          const y = 0;
          const z = Math.sin(angle) * radius - centerOffsetZ;
          vertices.push(x, y, z);
          uvs.push(i / widthSegments, j / curveSegments);
        }
      }
      
      for (let i = 0; i < widthSegments; i++) {
        for (let j = 0; j < curveSegments; j++) {
          const a = i * (curveSegments + 1) + j;
          const b = a + curveSegments + 1;
          indices.push(a, b, a + 1);
          indices.push(b, b + 1, a + 1);
        }
      }
      
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      material = new THREE.MeshStandardMaterial({ 
        color: roadSurface === 'asphalt' ? 0x333333 : roadSurface === 'gravel' ? 0x8B7355 : roadSurface === 'dirt' ? 0x6B4423 : 0xb8442e,
        transparent: true,
        opacity: 0.8,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
    } else if (selectedShape === 'track-curve') {
      const curveSegments = 40;
      const widthSegments = 40;
      const innerRadius = trackCurveSize[1];
      const outerRadius = innerRadius + trackCurveSize[0];
      
      const vertices = [];
      const indices = [];
      const uvs = [];
      
      for (let i = 0; i <= widthSegments; i++) {
        const radius = innerRadius + (outerRadius - innerRadius) * (i / widthSegments);
        for (let j = 0; j <= curveSegments; j++) {
          const angle = (Math.PI / 2) * (j / curveSegments);
          const x = Math.cos(angle) * radius;
          const y = 0;
          const z = Math.sin(angle) * radius;
          vertices.push(x, y, z);
          uvs.push(i / widthSegments, j / curveSegments);
        }
      }
      
      for (let i = 0; i < widthSegments; i++) {
        for (let j = 0; j < curveSegments; j++) {
          const a = i * (curveSegments + 1) + j;
          const b = a + curveSegments + 1;
          indices.push(a, b, a + 1);
          indices.push(b, b + 1, a + 1);
        }
      }
      
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      material = new THREE.MeshStandardMaterial({ 
        color: roadSurface === 'asphalt' ? 0x333333 : roadSurface === 'gravel' ? 0x8B7355 : roadSurface === 'dirt' ? 0x6B4423 : 0xb8442e,
        transparent: true,
        opacity: 0.8,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
    } else if (selectedShape === 'box-curve') {
      const curveSegments = 32;
      const width = boxCurveSize[0];
      const radius = boxCurveSize[1];
      const height = boxCurveSize[2];
      
      const innerRadius = radius;
      const outerRadius = radius + width;
      
      const vertices = [];
      const indices = [];
      
      for (let layer = 0; layer <= 1; layer++) {
        const y = layer * height - height / 2;
        for (let radial = 0; radial <= 1; radial++) {
          const r = radial === 0 ? innerRadius : outerRadius;
          for (let arc = 0; arc <= curveSegments; arc++) {
            const angle = (Math.PI / 2) * (arc / curveSegments);
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            vertices.push(x, y, z);
          }
        }
      }
      
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      
      const segmentsPerLayer = (curveSegments + 1) * 2;
      
      for (let layer = 0; layer < 1; layer++) {
        const layerStart = layer * segmentsPerLayer;
        const nextLayerStart = (layer + 1) * segmentsPerLayer;
        
        for (let radial = 0; radial < 1; radial++) {
          const ringStart = radial * (curveSegments + 1);
          const nextRingStart = (radial + 1) * (curveSegments + 1);
          
          for (let arc = 0; arc < curveSegments; arc++) {
            const a = layerStart + ringStart + arc;
            const b = layerStart + nextRingStart + arc;
            const c = layerStart + ringStart + arc + 1;
            const d = layerStart + nextRingStart + arc + 1;
            
            const e = nextLayerStart + ringStart + arc;
            const f = nextLayerStart + nextRingStart + arc;
            const g = nextLayerStart + ringStart + arc + 1;
            const h = nextLayerStart + nextRingStart + arc + 1;
            
            indices.push(a, c, e);
            indices.push(c, g, e);
            indices.push(b, f, d);
            indices.push(d, f, h);
            
            indices.push(a, b, c);
            indices.push(b, d, c);
            indices.push(e, g, f);
            indices.push(f, g, h);
          }
        }
        
        const inner0 = layerStart;
        const outer0 = layerStart + (curveSegments + 1);
        const inner1 = layerStart + curveSegments;
        const outer1 = layerStart + (curveSegments + 1) + curveSegments;
        
        const innerE0 = nextLayerStart;
        const outerE0 = nextLayerStart + (curveSegments + 1);
        const innerE1 = nextLayerStart + curveSegments;
        const outerE1 = nextLayerStart + (curveSegments + 1) + curveSegments;
        
        indices.push(inner0, innerE0, outer0);
        indices.push(outer0, innerE0, outerE0);
        indices.push(inner1, outer1, innerE1);
        indices.push(innerE1, outer1, outerE1);
      }
      
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      material = createMaterial(selectedMaterial, selectedColor, true);
      material.side = THREE.DoubleSide;
    } else if (selectedShape === 'door') {
      geometry = new THREE.BoxGeometry(...doorSize);
      material = createMaterial(selectedMaterial, selectedColor, true);
    }
    
    const newGhost = new THREE.Mesh(geometry, material);
    
    if (selectedShape === 'ground' || selectedShape === 'track') {
      newGhost.rotation.x = -Math.PI / 2;
      if (selectedShape === 'track') {
        newGhost.rotation.z = ghostRotation.current;
      }
    } else if (selectedShape === 'track-curve' || selectedShape === 'track-curve-custom' || selectedShape === 'box-curve') {
      // Zatáčka je už v XZ rovině, jen rotace Y
      newGhost.rotation.y = ghostRotation.current;
    } else if (selectedShape === 'soccerfield') {
      newGhost.rotation.x = -Math.PI / 2;
    } else {
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      newGhost.add(wireframe);
      newGhost.rotation.y = ghostRotation.current;
    }
    
    newGhost.visible = false;
    scene.add(newGhost);
    ghostBoxRef.current = newGhost;
  }, [selectedShape, boxSize, cylinderSize, trackSize, trackCurveSize, trackCurveCustomSize, trackCurveCustomAngle, boxCurveSize, doorSize, selectedColor, selectedMaterial, roadSurface, trackSlopePercent]);

  // Aktualizace refs při změně state
  useEffect(() => {
    boxSizeRef.current = boxSize;
    cylinderSizeRef.current = cylinderSize;
    trackSizeRef.current = trackSize;
    trackCurveSizeRef.current = trackCurveSize;
    trackCurveCustomSizeRef.current = trackCurveCustomSize;
    trackCurveCustomAngleRef.current = trackCurveCustomAngle;
    boxCurveSizeRef.current = boxCurveSize;
    doorSizeRef.current = doorSize;
    doorOptionsRef.current = {
      hinge: doorHinge === 'right' ? 'right' : 'left',
      isOpen: false
    };
    selectedColorRef.current = selectedColor;
    selectedMaterialRef.current = selectedMaterial;
    withWindowsRef.current = withWindows;
    roadSurfaceRef.current = roadSurface;
    trackSlopeRef.current = trackSlopePercent;
    roadWidthRef.current = roadWidth;
  }, [boxSize, cylinderSize, trackSize, trackCurveSize, trackCurveCustomSize, trackCurveCustomAngle, boxCurveSize, doorSize, doorHinge, selectedColor, selectedMaterial, withWindows, roadSurface, trackSlopePercent, roadWidth]);

  // Automatická aktualizace velikostí při označení objektu
  useEffect(() => {
    if (!selectedObject || !selectedObject.userData) return;
    
    const { type, size } = selectedObject.userData;
    
    // Aktualizovat velikosti podle typu objektu
    if (type === 'box' && size && size.length === 3) {
      console.log('Načítám velikost označeného obdélníku:', size);
      setBoxSize([size[0], size[1], size[2]]);
      boxSizeRef.current = [size[0], size[1], size[2]];
    } else if (type === 'cylinder' && size && size.length === 2) {
      console.log('Načítám velikost označeného válce:', size);
      setCylinderSize([size[0], size[1]]);
      cylinderSizeRef.current = [size[0], size[1]];
    } else if (type === 'track' && size && size.length === 2) {
      console.log('Načítám velikost označené dráhy:', size);
      setTrackSize([size[0], size[1]]);
      trackSizeRef.current = [size[0], size[1]];
      if (typeof selectedObject.userData.trackSlopePercent === 'number') {
        setTrackSlopePercent(selectedObject.userData.trackSlopePercent);
        trackSlopeRef.current = selectedObject.userData.trackSlopePercent;
      }
    } else if (type === 'track-curve' && size && size.length === 2) {
      console.log('Načítám velikost označené zatáčky:', size);
      setTrackCurveSize([size[0], size[1]]);
      trackCurveSizeRef.current = [size[0], size[1]];
    } else if (type === 'box-curve' && size && size.length === 3) {
      console.log('Načítám velikost označeného zakřiveného boxu:', size);
      setBoxCurveSize([size[0], size[1], size[2]]);
      boxCurveSizeRef.current = [size[0], size[1], size[2]];
    } else if (type === 'door' && size && size.length === 3) {
      setDoorSize([size[0], size[1], size[2]]);
      doorSizeRef.current = [size[0], size[1], size[2]];
      const hingeValue = selectedObject.userData?.doorConfig?.hinge || 'left';
      setDoorHinge(hingeValue);
      doorOptionsRef.current = {
        hinge: hingeValue,
        isOpen: selectedObject.userData?.doorConfig?.isOpen || false
      };
    } else if (type === 'road') {
      const widthValue = selectedObject.userData?.roadWidth;
      if (typeof widthValue === 'number') {
        setRoadWidth(widthValue);
        roadWidthRef.current = widthValue;
      }
    }
  }, [selectedObject]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex">
      {/* Levý panel */}
      <div className={`bg-gray-800 border-r border-gray-700 text-white transition-all duration-300 ${panelExpanded ? 'w-80' : 'w-12'} flex flex-col`}>
        {/* Hlavička panelu */}
        <div className="p-3 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
          {panelExpanded && <h2 className="font-bold text-lg">🛠️ Editor objektů</h2>}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {panelExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Obsah panelu */}
        {panelExpanded && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-300">🎮 Režim editoru</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                  onClick={() => handleEditorModeChange('build')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                    editorMode === 'build'
                      ? 'border-blue-500 bg-blue-900/50'
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                  🔨 Stavby
                      </button>
                      <button
                  onClick={() => handleEditorModeChange('terrain')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                    editorMode === 'terrain'
                      ? 'border-green-500 bg-green-900/50'
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                  ⛰️ Terén
                      </button>
                      <button
                  onClick={() => handleEditorModeChange('trees')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                    editorMode === 'trees'
                      ? 'border-green-500 bg-green-900/50'
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                  🌲 Stromy
                      </button>
                    </div>
                  </div>

            <MapSwitcher slots={mapSlots} selectedSlot={selectedSlot} onSelect={selectSlot} />

            {editorMode === 'terrain' ? (
              <TerrainPanel
                tool={terrainTool}
                onToolChange={setTerrainTool}
                radius={terrainRadius}
                onRadiusChange={setTerrainRadius}
                strength={terrainStrength}
                onStrengthChange={setTerrainStrength}
                surfaceType={terrainSurfaceType}
                onSurfaceTypeChange={setTerrainSurfaceType}
              />
            ) : editorMode === 'trees' ? (
              <TreeControls
                selectedTreeType={selectedTreeType}
                onTreeTypeSelect={setSelectedTreeType}
                treeHeight={treeHeight}
                onTreeHeightChange={setTreeHeight}
                treeCrownWidth={treeCrownWidth}
                onTreeCrownWidthChange={setTreeCrownWidth}
                placementMode={treePlacementMode}
                onPlacementModeChange={setTreePlacementMode}
                brushRadius={treeBrushRadius}
                onBrushRadiusChange={setTreeBrushRadius}
                brushDensity={treeBrushDensity}
                onBrushDensityChange={setTreeBrushDensity}
              />
            ) : (
              <>
                <ShapeControls
                  selectedShape={selectedShape}
                  onShapeSelect={handleShapeSelect}
                  boxSize={boxSize}
                  onBoxSizeChange={setBoxSize}
                  cylinderSize={cylinderSize}
                  onCylinderSizeChange={setCylinderSize}
                  trackSize={trackSize}
                  onTrackSizeChange={setTrackSize}
                  trackCurveSize={trackCurveSize}
                  onTrackCurveSizeChange={setTrackCurveSize}
                  trackCurveCustomSize={trackCurveCustomSize}
                  onTrackCurveCustomSizeChange={setTrackCurveCustomSize}
                  trackCurveCustomAngle={trackCurveCustomAngle}
                  onTrackCurveCustomAngleChange={setTrackCurveCustomAngle}
                  boxCurveSize={boxCurveSize}
                  onBoxCurveSizeChange={setBoxCurveSize}
                  doorSize={doorSize}
                  onDoorSizeChange={setDoorSize}
                  doorHinge={doorHinge === 'right' ? 'right' : 'left'}
                  onDoorHingeChange={(hinge) => setDoorHinge(hinge)}
                />

                {/* ÚPRAVA OZNAČENÉHO OBJEKTU */}
                {selectedObject && !selectedShape && selectedObject.userData && (
                  <SelectedObjectInspector
                    selectedObject={selectedObject}
                    onDeselect={handleDeselectObject}
                    onDoorToggle={toggleDoorState}
                    onColorChange={handleSelectedObjectColorChange}
                    onMaterialChange={handleSelectedObjectMaterialChange}
                    onTextureAction={handleSelectedObjectTextureChange}
                    textureParams={textureParams}
                    setTextureParams={setTextureParams}
                    doorStateVersion={doorStateVersion}
                    activeDrawingType={selectedDrawingType}
                  />
                )}

                <BuildOptionsPanel
                  selectedShape={selectedShape}
                  roadSurface={roadSurface}
                  onRoadSurfaceChange={handleRoadSurfaceChange}
                  trackSlopePercent={trackSlopePercent}
                  onTrackSlopeChange={handleTrackSlopeChange}
                  roadWidth={roadWidth}
                  onRoadWidthChange={handleRoadWidthChange}
                  withWindows={withWindows}
                  onToggleWindows={handleToggleWindows}
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                  selectedMaterial={selectedMaterial}
                  onMaterialChange={setSelectedMaterial}
                  onClearShapeSelection={handleClearShapeSelection}
                />
              </>
            )}

          </div>
        )}
      </div>

      {/* Hlavní oblast */}
      <div className="flex-1 flex flex-col">
        <TopBar
          onNavigateDashboard={() => navigate('/dashboard')}
          onNavigateCharacterEditor={() => navigate('/character-editor')}
          selectedShape={selectedShape}
          currentTime={currentTime}
          isPausedTime={isPausedTime}
          onTogglePause={handleTogglePause}
          onSlowDown={handleSlowDown}
          onSpeedUp={handleSpeedUp}
          onSetTime={handleTimeChange}
          cloudPreset={cloudPreset}
          onCloudPresetChange={handleCloudPresetChange}
          mouseNeutralized={mouseNeutralized}
          selectedObject={selectedObject}
          selectedDrawingType={selectedDrawingType}
          isFirstPerson={isFirstPerson}
          buildingCount={buildingCount}
          canUndo={canUndo}
          onUndo={handleUndo}
          onClearAll={handleClearAll}
        />

        {/* 3D scéna */}
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}