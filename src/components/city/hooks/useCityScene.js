import { useEffect } from 'react';
import { FirstPersonControls } from '../FirstPersonControls';
import {
  setupScene,
  setupControls,
  setupGround,
  setupLights,
  createGhost,
  setupEventListeners,
} from '../sceneSetup';
import { initCloudSystem } from '../Clouds';
import { initMoonSystem } from '../MoonSystem';
import { initSunSystem } from '../SunSystem';
import { TerrainManager } from '../terrain/TerrainManager';
import TreeManager from '../trees/TreeManager';

export const useCityScene = ({
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
  treePlacementModeRef,
  treeBrushRadiusRef,
  treeBrushDensityRef,
  treeGhostRef,
  getCurrentMapKey,
  getTerrainHeightAt,
  roadBuilderStateRef,
  roadWidthRef,
  resetRoadBuilderState,
}) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer } = setupScene(containerRef.current);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const controls = setupControls(camera, renderer);
    controlsRef.current = controls;

    const fpControls = new FirstPersonControls(camera, renderer.domElement);
    fpControls.disconnect();
    fpControlsRef.current = fpControls;

    const ground = setupGround(scene);
    groundRef.current = ground;

    const lights = setupLights(scene);
    const skyDomeRef = lights.skyDome; // Reference na oblohu

    const cloudSystem = initCloudSystem(lights.skyMaterial, {
      coverage: 0.5,
      scale: 0.8,
      speed: 1.0,
      opacity: 0.7,
      lightAbsorption: 0.3,
    });
    cloudSystemRef.current = cloudSystem;

    const moonSystem = initMoonSystem(scene, 12, 172);
    moonUpdateRef.current = moonSystem;

    sunUpdateRef.current = initSunSystem(scene, lights, lights.skyMaterial, 12, cloudSystem);

    const ghostObject = createGhost('box', [1, 1, 1], 0xffffff, 'standard', scene, getTerrainHeightAt);
    ghostBoxRef.current = ghostObject;

    const terrainManager = new TerrainManager({
      tileSize: 200,
      resolution: 129,
      viewDistance: 3, // Zvýšeno z 1 na 3 pro lepší dohled
      getStorageKey: () => getCurrentMapKey(),
    });
    terrainManager.initialize(scene);
    terrainManager.updateVisibleChunks(camera.position);
    terrainManagerRef.current = terrainManager;

    // Inicializovat TreeManager
    const treeManager = new TreeManager({
      scene,
      camera,
      getTerrainHeightAt,
      getStorageKey: () => getCurrentMapKey(),
    });
    treeManager.loadTrees();
    if (treeManagerRef) {
      treeManagerRef.current = treeManager;
    }

    reloadMap(selectedSlotRef.current);
    sceneReadyRef.current = true;

    const cleanupEventListeners = setupEventListeners({
      renderer,
      camera,
      ground,
      raycaster,
      mouse,
      ghostBoxRef,
      selectedShapeRef,
      mouseNeutralizedRef,
      controlsRef,
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
      ghostRotation,
      sceneRef,
      setMouseNeutralized,
      setSelectedObject,
      setSelectedShape,
      saveAndSyncBuildings,
      historyRef,
      setCanUndo,
      terrainManagerRef,
      treeManagerRef,
      editorModeRef,
      selectedTreeTypeRef,
      treeHeightRef,
      treeCrownWidthRef,
      treePlacementModeRef,
      treeBrushRadiusRef,
      treeBrushDensityRef,
      treeGhostRef,
      getTerrainHeightAt,
      roadBuilderStateRef,
      roadWidthRef,
      resetRoadBuilderState,
    });

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let frameCount = 0;
    let animationId = null;
    const animate = () => {
      animationId = window.requestAnimationFrame(animate);

      if (isFirstPersonRef.current && fpControlsRef.current) {
        fpControlsRef.current.update();
      } else if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (cloudSystemRef.current) {
        cloudSystemRef.current.update(0.016);
      }

      if (sunUpdateRef.current) {
        const currentTimeValue = sunUpdateRef.current.update();

        if (moonUpdateRef.current) {
          const sunPosition = sunUpdateRef.current.getSunPosition();
          moonUpdateRef.current.update(currentTimeValue, undefined, sunPosition);
        }

        if (frameCount % 30 === 0) {
          setCurrentTime(currentTimeValue);
          setIsPausedTime(sunUpdateRef.current.isPaused());
        }
        frameCount += 1;
      }

      if (terrainManagerRef.current) {
        terrainManagerRef.current.updateVisibleChunks(camera.position);
      }

      // Aktualizovat LOD stromů (s throttlingem)
      if (treeManagerRef && treeManagerRef.current) {
        treeManagerRef.current.camera = camera;
        treeManagerRef.current.updateLOD(frameCount);
      }

      // Aktualizovat pozici oblohy podle kamery
      if (skyDomeRef) {
        skyDomeRef.position.copy(camera.position);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupEventListeners();
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (fpControlsRef.current) {
        fpControlsRef.current.dispose();
      }
      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (terrainManagerRef.current) {
        terrainManagerRef.current.dispose();
        terrainManagerRef.current = null;
      } else {
        terrainManager.dispose();
      }
      if (treeManagerRef && treeManagerRef.current) {
        treeManagerRef.current.dispose();
        treeManagerRef.current = null;
      }
    };
  }, [containerRef, getCurrentMapKey, reloadMap, selectedSlotRef, resetRoadBuilderState]);

  useEffect(() => {
    if (!sceneReadyRef.current) return;
    reloadMap(selectedSlot);
    if (terrainManagerRef.current) {
      const camera = cameraRef.current ? cameraRef.current.position : undefined;
      terrainManagerRef.current.handleSlotChange(camera);
    }
  }, [selectedSlot, reloadMap, sceneReadyRef, terrainManagerRef, cameraRef]);
};
