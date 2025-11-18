import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createMaterial } from './materialHelpers';
import { createRealObject, createSoccerField, disposeObject } from './buildingHelpers';

/**
 * Nastaví základní Three.js scénu
 * @param {HTMLElement} container - Container element
 * @returns {Object} Objekt s scene, camera, renderer
 */
export const setupScene = (container) => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(8, 6, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  return { scene, camera, renderer };
};

/**
 * Nastaví OrbitControls
 * @param {THREE.Camera} camera - Kamera
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @returns {OrbitControls} OrbitControls instance
 */
export const setupControls = (camera, renderer) => {
  let controls;
  try {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09; // Plynulejší pohyb
    controls.minDistance = 0.5;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0, 0);
    
    // Vylepšené ovládání
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 0.8;
    controls.panSpeed = 0.8;
    controls.enableKeys = true;
    controls.keys = {
      LEFT: 'ArrowLeft',
      UP: 'ArrowUp',
      RIGHT: 'ArrowRight',
      BOTTOM: 'ArrowDown'
    };
    
    // Zajistit správné zachycení pointer events
    if (renderer.domElement.setPointerCapture) {
      const originalSetPointerCapture = renderer.domElement.setPointerCapture.bind(renderer.domElement);
      renderer.domElement.setPointerCapture = function(pointerId) {
        try {
          return originalSetPointerCapture(pointerId);
        } catch (e) {
          // Ignorovat InvalidStateError - pointer může být již zachycený
          if (e.name !== 'InvalidStateError') {
            throw e;
          }
        }
      };
    }
  } catch (error) {
    console.warn('Error setting up OrbitControls:', error);
    // Fallback na základní controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.minDistance = 0.5;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0, 0);
  }
  return controls;
};

/**
 * Vytvoří neviditelnou rovinu pro raycaster
 * @param {THREE.Scene} scene - Scéna
 * @returns {THREE.Mesh} Neviditelná rovina
 */
export const setupGround = (scene) => {
  // Velká neviditelná rovina pro raycaster
  const planeGeometry = new THREE.PlaneGeometry(500, 500);
  const planeMaterial = new THREE.MeshBasicMaterial({ 
    visible: false
  });
  
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  scene.add(plane);

  return plane;
};

/**
 * Nastaví osvětlení scény
 * @param {THREE.Scene} scene - Scéna
 * @returns {Object} Objekt s odkazy na světla a skyMaterial
 */
export const setupLights = (scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Počáteční pozice slunce (bude hned přepsána initSunSystem)
  const sunPosition = new THREE.Vector3(0, 300, 150);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.copy(sunPosition);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // SkyDome s gradientem - větší poloměr pro lepší dohled
  const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      uniform vec3 sunDirection;
      uniform vec3 sunColor;
      uniform float sunSize;
      uniform float sunIntensity;
      uniform float sunElevation;
      uniform vec3 sunriseColor;
      uniform float sunriseIntensity;
      
      varying vec3 vWorldPosition;
      
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        
        // Základní gradient oblohy
        vec3 skyColor = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
        
        // Červená/oranžová záře při východu/západu - JEN ve směru slunce
        if (sunriseIntensity > 0.0) {
          vec3 viewDirection = normalize(vWorldPosition);
          float directionToSun = dot(viewDirection, sunDirection);
          
          // Jen pozitivní směr (směrem ke slunci) a u horizontu
          if (directionToSun > -0.2 && h < 0.4) {
            // Vypočítat jak moc jsme blízko směru slunce
            float sunProximityFactor = smoothstep(-0.2, 0.6, directionToSun);
            
            // Aplikovat jen v dolní části oblohy (horizont)
            float horizonFactor = 1.0 - smoothstep(0.0, 0.4, h);
            
            // Výsledná intenzita červené záře
            float sunriseGlow = sunProximityFactor * horizonFactor * sunriseIntensity;
            
            // Přidat červenou záři
            skyColor = mix(skyColor, sunriseColor, sunriseGlow * 0.9);
          }
        }
        
        // Sluneční disk a záře
        vec3 viewDirection = normalize(vWorldPosition);
        float sunProximity = dot(viewDirection, sunDirection);
        float sunDisc = smoothstep(sunSize - 0.01, sunSize, sunProximity);
        float sunGlow = pow(max(sunProximity, 0.0), 15.0) * 0.3;
        
        vec3 finalColor = skyColor + (sunColor * sunDisc * sunIntensity) + (sunColor * sunGlow);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0x89cff0) },
      offset: { value: 0 },
      exponent: { value: 0.6 },
      sunDirection: { value: sunPosition.clone().normalize() },
      sunColor: { value: new THREE.Color(0xffff99) },
      sunSize: { value: 0.9995 },
      sunIntensity: { value: 1.5 },
      sunElevation: { value: 0.5 },
      sunriseColor: { value: new THREE.Color(0x000000) },
      sunriseIntensity: { value: 0.0 },
      // Moon uniforms - přidáno pro měsíční systém
      moonDirection: { value: new THREE.Vector3(0, 1, 0) },
      moonPhase: { value: 0.5 },
      moonIntensity: { value: 0.0 },
      moonColor: { value: new THREE.Color(0xffffee) }
    },
    side: THREE.BackSide
  });
  
  const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyDome);

  return {
    ambientLight,
    directionalLight,
    skyMaterial,
    skyDome // Vrátit referenci na skyDome pro aktualizaci pozice
  };
};

/**
 * Vytvoří ghost objekt
 * @param {string} shape - Typ tvaru
 * @param {Array} size - Velikost
 * @param {number} color - Barva
 * @param {string} materialType - Typ materiálu
 * @param {THREE.Scene} scene - Scéna
 * @returns {THREE.Mesh} Ghost mesh
 */
export const createGhost = (shape, size, color, materialType, scene, getTerrainHeightAt) => {
  let geometry;
  let material;
  
  if (shape === 'box') {
    geometry = new THREE.BoxGeometry(...size);
    material = createMaterial(materialType, color, true);
  } else if (shape === 'cylinder') {
    geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], 32);
    material = createMaterial(materialType, color, true);
  } else if (shape === 'ground') {
    geometry = new THREE.PlaneGeometry(90, 70, 150, 120);
    material = new THREE.MeshStandardMaterial({ 
      color: 0xb5e5b5,
      transparent: true,
      opacity: 0.5,
      roughness: 0.9,
      metalness: 0.0
    });
  } else if (shape === 'track') {
    geometry = new THREE.PlaneGeometry(10, 10, 40, 40);
    material = new THREE.MeshStandardMaterial({ 
      color: 0xb8442e,
      transparent: true,
      opacity: 0.8,
      roughness: 0.8,
      metalness: 0.0
    });
  } else if (shape === 'track-curve-custom') {
    // Ghost objekt pro custom zatáčku - bude vytvořen v CityMap.js s aktuálními hodnotami
    geometry = new THREE.PlaneGeometry(10, 10);
    material = new THREE.MeshStandardMaterial({ 
      color: 0xb8442e,
      transparent: true,
      opacity: 0.8,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
  } else if (shape === 'track-curve') {
    const curveSegments = 40;
    const widthSegments = 40;
    const innerRadius = 5;
    const outerRadius = 15;
    
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
        // UV: u = pozice podél oblouku, v = pozice napříč šířkou (pro horizontální čáry v textuře)
        uvs.push(j / curveSegments, i / widthSegments);
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
      color: 0xb8442e,
      transparent: true,
      opacity: 0.8,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
  } else if (shape === 'box-curve') {
    const curveSegments = 32;
    const width = size[0] || 1;
    const radius = size[1] || 2;
    const height = size[2] || 1;
    
    const innerRadius = radius;
    const outerRadius = radius + width;
    
    const vertices = [];
    const indices = [];
    
    // Vytvoření zakřiveného boxu - 90° oblouk
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
    
    // Boční plochy (vnitřní a vnější oblouk)
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
          
          // Vnitřní/vnější oblouk
          indices.push(a, c, e);
          indices.push(c, g, e);
          indices.push(b, f, d);
          indices.push(d, f, h);
          
          // Spodní a horní plocha
          indices.push(a, b, c);
          indices.push(b, d, c);
          indices.push(e, g, f);
          indices.push(f, g, h);
        }
      }
      
      // Boční čelní plochy (začátek a konec oblouku)
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
    
    material = createMaterial(materialType, color, true);
  }
  
  const mesh = new THREE.Mesh(geometry, material);
  
  if (shape === 'ground' || shape === 'track') {
    mesh.rotation.x = -Math.PI / 2;
  } else if (shape === 'track-curve') {
    // Zatáčka je už vytvořená v XZ rovině, neotáčíme ji
  } else if (shape === 'box-curve') {
    // Box-curve je v XZ rovině
  } else {
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(wireframe);
  }
  
  mesh.visible = false;
  scene.add(mesh);
  mesh.userData.getTerrainHeightAt = getTerrainHeightAt;
  return mesh;
};

/**
 * Kontroluje kolizi objektu s existujícími objekty
 * @param {THREE.Vector3} position - Pozice nového objektu
 * @param {Array} size - Velikost nového objektu
 * @param {string} shape - Tvar nového objektu
 * @param {Array} placedBoxes - Pole existujících objektů
 * @returns {boolean} True pokud je kolize
 */
export const checkCollision = (position, size, shape, placedBoxes, ignoreObject = null) => {
  const tolerance = 0.01;
  
  for (const box of placedBoxes) {
    if (ignoreObject && (box === ignoreObject || box.uuid === ignoreObject.uuid)) {
      continue;
    }
    const dx = Math.abs(position.x - box.position.x);
    const dz = Math.abs(position.z - box.position.z);
    const dy = Math.abs(position.y - box.position.y);
    
    let boxWidth, boxHeight, boxDepth;
    
    // Kontrola zda je to Group (např. soccerfield) nebo má geometry
    if (!box.geometry) {
      // Je to Group, použijeme userData
      if (box.userData && box.userData.type === 'soccerfield') {
        boxWidth = 90;
        boxHeight = 0.01;
        boxDepth = 70;
      } else if (box.userData && box.userData.type === 'door' && box.userData.size) {
        boxWidth = box.userData.size[0];
        boxHeight = box.userData.size[1];
        boxDepth = box.userData.size[2];
      } else {
        continue;
      }
    } else if (box.geometry.type === 'BoxGeometry') {
      boxWidth = box.geometry.parameters.width;
      boxHeight = box.geometry.parameters.height;
      boxDepth = box.geometry.parameters.depth;
    } else if (box.geometry.type === 'CylinderGeometry') {
      boxWidth = box.geometry.parameters.radiusTop * 2;
      boxHeight = box.geometry.parameters.height;
      boxDepth = box.geometry.parameters.radiusTop * 2;
    } else if (box.geometry.type === 'PlaneGeometry') {
      boxWidth = box.geometry.parameters.width;
      boxHeight = 0.01;
      boxDepth = box.geometry.parameters.height;
    } else {
      continue;
    }
    
    let newWidth, newHeight, newDepth;
    if (shape === 'box' || shape === 'door') {
      [newWidth, newHeight, newDepth] = size;
    } else if (shape === 'cylinder') {
      newWidth = size[0] * 2;
      newHeight = size[1];
      newDepth = size[0] * 2;
    } else if (shape === 'ground' || shape === 'soccerfield' || shape === 'track') {
      newWidth = size[0];
      newHeight = 0.01;
      newDepth = size[1];
    }
    
    const overlapX = dx < (boxWidth / 2 + newWidth / 2 - tolerance);
    const overlapY = dy < (boxHeight / 2 + newHeight / 2 - tolerance);
    const overlapZ = dz < (boxDepth / 2 + newDepth / 2 - tolerance);
    
    if (overlapX && overlapY && overlapZ) {
      return true;
    }
  }
  
  return false;
};

/**
 * Nastaví event listenery pro myš a klávesnici
 * @param {Object} params - Parametry obsahující všechny potřebné reference
 * @returns {Function} Cleanup funkce
 */
export const setupEventListeners = (params) => {
  const {
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
  } = params;

  const cloneDrawingData = (drawings = []) => drawings.map(drawing => ({
    ...drawing,
    textureParams: drawing.textureParams ? { ...drawing.textureParams } : undefined,
    position: drawing.position ? { ...drawing.position } : undefined
  }));

  const createDeletionSnapshot = (object) => {
    if (!object || !object.userData || !object.userData.type) return null;
    return {
      type: object.userData.type,
      size: Array.isArray(object.userData.size) ? [...object.userData.size] : null,
      color: object.userData.color,
      material: object.userData.material,
      withWindows: object.userData.withWindows,
      roadSurface: object.userData.roadSurface,
      roadPath: object.userData.roadPath ? object.userData.roadPath.map((point) => ({ ...point })) : undefined,
      roadWidth: object.userData.roadWidth,
      trackEndpoints: object.userData.trackEndpoints
        ? {
            start: object.userData.trackEndpoints.start ? { ...object.userData.trackEndpoints.start } : undefined,
            end: object.userData.trackEndpoints.end ? { ...object.userData.trackEndpoints.end } : undefined
          }
        : undefined,
      trackSlopePercent: object.userData.trackSlopePercent || 0,
      drawings: object.userData.drawings ? cloneDrawingData(object.userData.drawings) : undefined,
      position: {
        x: object.position.x,
        y: object.position.y,
        z: object.position.z
      },
      rotation: {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z
      },
      doorConfig: object.userData.doorConfig ? { ...object.userData.doorConfig } : undefined
    };
  };

  const setControlsPlacementMode = (active) => {
    if (!controlsRef.current) return;
    try {
      // Při aktivním placement mode deaktivujeme rotaci a pan, ale zoom zůstává aktivní
      controlsRef.current.enableRotate = !active;
      controlsRef.current.enablePan = !active;
      controlsRef.current.enableZoom = true;
      
      // Pokud deaktivujeme placement mode, obnovíme všechny kontroly
      if (!active) {
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
      }
    } catch (error) {
      console.warn('Error setting controls placement mode:', error);
    }
  };

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

  const TRACK_SURFACE_OFFSET = 0.15;
  const terrainSamplePoint = new THREE.Vector3();
  const sampleTerrainHeight = (x, z) => {
    if (typeof getTerrainHeightAt === 'function') {
      terrainSamplePoint.set(x, 0, z);
      return getTerrainHeightAt(terrainSamplePoint);
    }
    return 0;
  };

  const ROAD_ELEVATION_OFFSET = 0.08;
  const MIN_ROAD_LENGTH = 3;
  let lastTrackSnapInfo = null;

  const getTrackDirectionVector = (rotationValue) => {
    const forward = new THREE.Vector3(0, 1, 0);
    const euler = new THREE.Euler(-Math.PI / 2, 0, rotationValue, 'XYZ');
    forward.applyEuler(euler);
    forward.y = 0;
    if (forward.lengthSq() === 0) {
      forward.set(0, 0, 1);
    } else {
      forward.normalize();
    }
    return forward;
  };

  const pointToVector3 = (point) => {
    if (!point) {
      return null;
    }
    return new THREE.Vector3(
      Number(point.x) || 0,
      Number(point.y) || 0,
      Number(point.z) || 0
    );
  };

  const projectPointerToTerrain = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    let intersects = [];
    if (terrainManagerRef?.current) {
      const terrainMeshes = terrainManagerRef.current.getMeshes?.();
      if (terrainMeshes && terrainMeshes.length > 0) {
        intersects = raycaster.current.intersectObjects(terrainMeshes, false);
      }
    }

    if (!intersects.length) {
      intersects = raycaster.current.intersectObject(ground);
    }

    if (!intersects.length) return null;

    const point = intersects[0].point.clone();
    const terrainY = sampleTerrainHeight(point.x, point.z);
    point.y = terrainY;
    return point;
  };

  const snapPointToRoadNetwork = (point) => {
    let closest = null;
    let minDistance = 4;

    for (const obj of placedBoxes.current) {
      if (!obj.userData || obj.userData.type !== 'road' || !Array.isArray(obj.userData.roadPath)) continue;
      const path = obj.userData.roadPath;
      if (path.length === 0) continue;
      const endpoints = [path[0], path[path.length - 1]];
      for (const endpoint of endpoints) {
        if (!endpoint) continue;
        const dist = Math.hypot(point.x - endpoint.x, point.z - endpoint.z);
        if (dist < minDistance) {
          minDistance = dist;
          closest = endpoint;
        }
      }
    }

    if (closest) {
      point.set(closest.x, closest.y, closest.z);
    }
    return point;
  };

  const ensureRoadPreview = () => {
    let preview = roadBuilderStateRef.current.preview;
    if (preview) return preview;
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    preview = new THREE.Mesh(geometry, material);
    preview.rotation.x = -Math.PI / 2;
    preview.visible = false;
    if (sceneRef.current) {
      sceneRef.current.add(preview);
    }
    roadBuilderStateRef.current.preview = preview;
    return preview;
  };

  const updateRoadPreview = (currentPoint) => {
    const builder = roadBuilderStateRef.current;
    if (!builder.isDrawing || !builder.startPoint) return;
    const preview = ensureRoadPreview();
    const start = builder.startPoint;
    const deltaX = currentPoint.x - start.x;
    const deltaZ = currentPoint.z - start.z;
    const length = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

    if (length < 0.5) {
      preview.visible = false;
      return;
    }

    const angle = Math.atan2(deltaX, deltaZ);
    const midPoint = new THREE.Vector3(
      (start.x + currentPoint.x) / 2,
      (start.y + currentPoint.y) / 2 + ROAD_ELEVATION_OFFSET,
      (start.z + currentPoint.z) / 2
    );

    preview.visible = true;
    preview.position.copy(midPoint);
    preview.rotation.y = angle;
    preview.scale.set(roadWidthRef.current || 6, length, 1);
  };

  const buildRoadPathData = (startPoint, endPoint) => {
    const start = startPoint.clone();
    const end = endPoint.clone();
    const planarDistance = Math.hypot(end.x - start.x, end.z - start.z);
    if (planarDistance < MIN_ROAD_LENGTH) {
      return null;
    }

    const segments = Math.max(2, Math.ceil(planarDistance / 2));
    const pathPoints = [];
    const basePoints = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(start.x, end.x, t);
      const z = THREE.MathUtils.lerp(start.z, end.z, t);
      const baseY = THREE.MathUtils.lerp(start.y, end.y, t);
      const elevatedY = baseY + ROAD_ELEVATION_OFFSET;

      basePoints.push(new THREE.Vector3(x, baseY, z));
      pathPoints.push(new THREE.Vector3(x, elevatedY, z));
    }

    let totalLength = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      totalLength += pathPoints[i].distanceTo(pathPoints[i + 1]);
    }

    return { pathPoints, basePoints, totalLength };
  };

  const applyTerrainForRoad = (basePoints, width) => {
    if (!terrainManagerRef?.current || !Array.isArray(basePoints)) return;
    for (let i = 0; i < basePoints.length - 1; i++) {
      const start = basePoints[i];
      const end = basePoints[i + 1];
      const segmentVec = new THREE.Vector3().subVectors(end, start);
      const length = segmentVec.length();
      if (length < 0.5) continue;
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const rotation = Math.atan2(segmentVec.x, segmentVec.z);
      const directionVector = segmentVec.clone().setY(0);
      if (directionVector.lengthSq() > 0) {
        directionVector.normalize();
      } else {
        directionVector.set(0, 0, 1);
      }
      const slopePercent = ((end.y - start.y) / length) * 100;
      terrainManagerRef.current.applySlopeForTrack({
        center,
        length,
        width: (width || 6) + 1,
        rotation,
        slopePercent,
        baseHeight: start.y,
        directionVector,
      });
    }
    terrainManagerRef.current.saveDirtyChunks();
  };

  const finalizeRoadSegment = (startPoint, endPoint) => {
    const roadData = buildRoadPathData(startPoint, endPoint);
    if (!roadData) {
      return;
    }

    const payloadPath = roadData.pathPoints.map((point) => ({
      x: point.x,
      y: point.y,
      z: point.z,
    }));

    const extraOptions = {
      pathPoints: payloadPath,
      roadWidth: roadWidthRef.current || 6,
    };

    const newRoad = createRealObject(
      'road',
      new THREE.Vector3(0, 0, 0),
      0,
      [roadWidthRef.current || 6, roadData.totalLength],
      selectedColorRef.current,
      selectedMaterialRef.current,
      false,
      sceneRef.current,
      placedBoxes.current,
      roadSurfaceRef.current,
      extraOptions
    );

    if (newRoad) {
      historyRef.current.push({ type: 'create', object: newRoad });
      setCanUndo(true);
      applyTerrainForRoad(roadData.basePoints, roadWidthRef.current || 6);
      saveAndSyncBuildings();
    }
  };

  // Pohyb myši
  const handleMouseMove = (e) => {
    // Tree mode - ghost preview
    if (editorModeRef && editorModeRef.current === 'trees' && selectedTreeTypeRef && selectedTreeTypeRef.current) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      
      if (terrainManagerRef && terrainManagerRef.current) {
        const terrainMeshes = terrainManagerRef.current.getMeshes();
        if (terrainMeshes && terrainMeshes.length > 0) {
          const intersects = raycaster.current.intersectObjects(terrainMeshes, false);
          if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            const terrainHeight = getTerrainHeightAt ? getTerrainHeightAt(hitPoint) : hitPoint.y;
            
            const placementMode = treePlacementModeRef?.current || 'single';
            
            // Vytvořit nebo aktualizovat ghost
            if (treeGhostRef && !treeGhostRef.current && sceneRef && sceneRef.current) {
              if (placementMode === 'single') {
                // Ghost pro jeden strom
                const ghostGeometry = new THREE.ConeGeometry(treeCrownWidthRef.current / 2, treeHeightRef.current, 8);
                const ghostMaterial = new THREE.MeshBasicMaterial({
                  color: selectedTreeTypeRef.current === 'conifer' ? 0x2d5016 : 0x4a7c26,
                  transparent: true,
                  opacity: 0.5,
                  wireframe: true,
                });
                treeGhostRef.current = new THREE.Mesh(ghostGeometry, ghostMaterial);
                sceneRef.current.add(treeGhostRef.current);
              } else {
                // Ghost pro brush - kruh s lepší viditelností
                const brushRadius = treeBrushRadiusRef?.current || 15;
                const ghostGeometry = new THREE.RingGeometry(0.1, brushRadius, 32);
                const ghostMaterial = new THREE.MeshBasicMaterial({
                  color: 0x00ff00,
                  transparent: true,
                  opacity: 0.5, // Zvýšeno z 0.3 na 0.5 pro lepší viditelnost
                  side: THREE.DoubleSide,
                  depthWrite: false, // Aby nebyl problém s hloubkou
                });
                treeGhostRef.current = new THREE.Mesh(ghostGeometry, ghostMaterial);
                treeGhostRef.current.rotation.x = -Math.PI / 2;
                sceneRef.current.add(treeGhostRef.current);
              }
            }
            
            // Zkontrolovat, zda se změnil placement mode a přepnout ghost
            if (treeGhostRef && treeGhostRef.current && sceneRef && sceneRef.current) {
              const currentIsSingle = treeGhostRef.current.geometry.type === 'ConeGeometry';
              const shouldBeSingle = placementMode === 'single';
              
              if (currentIsSingle !== shouldBeSingle) {
                // Odstranit starý ghost
                sceneRef.current.remove(treeGhostRef.current);
                if (treeGhostRef.current.geometry) treeGhostRef.current.geometry.dispose();
                if (treeGhostRef.current.material) treeGhostRef.current.material.dispose();
                treeGhostRef.current = null;
                
                // Vytvořit nový ghost podle aktuálního módu
                if (shouldBeSingle) {
                  const ghostGeometry = new THREE.ConeGeometry(treeCrownWidthRef.current / 2, treeHeightRef.current, 8);
                  const ghostMaterial = new THREE.MeshBasicMaterial({
                    color: selectedTreeTypeRef.current === 'conifer' ? 0x2d5016 : 0x4a7c26,
                    transparent: true,
                    opacity: 0.5,
                    wireframe: true,
                  });
                  treeGhostRef.current = new THREE.Mesh(ghostGeometry, ghostMaterial);
                  sceneRef.current.add(treeGhostRef.current);
                } else {
                  const brushRadius = treeBrushRadiusRef?.current || 15;
                  const ghostGeometry = new THREE.RingGeometry(0.1, brushRadius, 32);
                  const ghostMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    transparent: true,
                    opacity: 0.5, // Zvýšeno z 0.3 na 0.5 pro lepší viditelnost
                    side: THREE.DoubleSide,
                    depthWrite: false, // Aby nebyl problém s hloubkou
                  });
                  treeGhostRef.current = new THREE.Mesh(ghostGeometry, ghostMaterial);
                  treeGhostRef.current.rotation.x = -Math.PI / 2;
                  sceneRef.current.add(treeGhostRef.current);
                }
              }
            }
            
            if (treeGhostRef && treeGhostRef.current) {
              if (placementMode === 'single') {
                treeGhostRef.current.position.set(hitPoint.x, terrainHeight, hitPoint.z);
                treeGhostRef.current.visible = true;
                // Aktualizovat velikost podle parametrů
                const currentHeight = treeGhostRef.current.geometry.parameters.height;
                const currentRadius = treeGhostRef.current.geometry.parameters.radius;
                if (Math.abs(currentHeight - treeHeightRef.current) > 0.1 || 
                    Math.abs(currentRadius - treeCrownWidthRef.current / 2) > 0.1) {
                  treeGhostRef.current.geometry.dispose();
                  treeGhostRef.current.geometry = new THREE.ConeGeometry(
                    treeCrownWidthRef.current / 2, 
                    treeHeightRef.current, 
                    8
                  );
                }
              } else {
                // Brush mode - kruh
                const brushRadius = treeBrushRadiusRef?.current || 15;
                treeGhostRef.current.position.set(hitPoint.x, terrainHeight + 0.1, hitPoint.z);
                treeGhostRef.current.visible = true;
                
                // Aktualizovat velikost kruhu podle poloměru štětce
                const currentRadius = treeGhostRef.current.geometry.parameters?.outerRadius;
                if (!currentRadius || Math.abs(currentRadius - brushRadius) > 0.1) {
                  treeGhostRef.current.geometry.dispose();
                  treeGhostRef.current.geometry = new THREE.RingGeometry(0.1, brushRadius, 32);
                }
                
                // Vypočítat počet stromů pro zobrazení (pro debug)
                const area = Math.PI * brushRadius * brushRadius;
                const density = treeBrushDensityRef?.current || 0.5;
                const treeCount = Math.max(1, Math.floor(area * density));
                // Můžeme zobrazit počet v nějakém UI elementu nebo jako text
              }
            }
          } else {
            if (treeGhostRef && treeGhostRef.current) {
              treeGhostRef.current.visible = false;
            }
          }
        }
      }
      return;
    }
    
    if (selectedShapeRef.current === 'road-builder') {
      if (mouseNeutralizedRef.current || !roadBuilderStateRef.current.isDrawing || !roadBuilderStateRef.current.startPoint) {
        return;
      }
      const point = projectPointerToTerrain(e);
      if (!point) return;
      const snappedPoint = snapPointToRoadNetwork(point);
      roadBuilderStateRef.current.currentPoint = snappedPoint.clone();
      updateRoadPreview(snappedPoint);
      setControlsPlacementMode(false);
      return;
    }

    if (!selectedShapeRef.current || mouseNeutralizedRef.current) {
      setControlsPlacementMode(false);
      return;
    }

    setControlsPlacementMode(true);
    if (selectedShapeRef.current !== 'track') {
      lastTrackSnapInfo = null;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    
    const groundIntersects = raycaster.current.intersectObject(ground);
    const currentGhost = ghostBoxRef.current;
    if (!currentGhost) return;

    if (groundIntersects.length > 0) {
      currentGhost.visible = true;
      const point = groundIntersects[0].point;
      
      let targetX = Math.round(point.x * 10) / 10;
      let targetZ = Math.round(point.z * 10) / 10;
      
      // Snapping pro ground objekty
      if (selectedShapeRef.current === 'ground') {
        const snapThreshold = 2;
        const groundWidth = 90;
        const groundDepth = 70;
        
        let closestSnapDistance = Infinity;
        let snapX = null;
        let snapZ = null;
        
        // Projít všechny existující ground a soccerfield objekty
        for (const box of placedBoxes.current) {
          let isGroundType = false;
          let boxPosX = box.position.x;
          let boxPosZ = box.position.z;
          let boxWidth = 0;
          let boxDepth = 0;
          
          // Zjistit zda je to ground nebo soccerfield
          if (box.userData && box.userData.type === 'ground') {
            isGroundType = true;
            boxWidth = 90;
            boxDepth = 70;
          } else if (box.userData && box.userData.type === 'soccerfield') {
            isGroundType = true;
            boxWidth = 90;
            boxDepth = 70;
          } else if (box.geometry && box.geometry.type === 'PlaneGeometry') {
            isGroundType = true;
            boxWidth = box.geometry.parameters.width;
            boxDepth = box.geometry.parameters.height;
          }
          
          if (!isGroundType) continue;
          
          // Spočítat hrany existujícího objektu
          const eastEdge = boxPosX + boxWidth / 2;
          const westEdge = boxPosX - boxWidth / 2;
          const southEdge = boxPosZ + boxDepth / 2;
          const northEdge = boxPosZ - boxDepth / 2;
          
          // Kontrola snapování k východní hraně (položit vlevo od ní)
          const distToEast = Math.abs(targetX - (eastEdge + groundWidth / 2));
          if (distToEast < snapThreshold && distToEast < closestSnapDistance) {
            const zOverlap = !(targetZ + groundDepth / 2 < northEdge || targetZ - groundDepth / 2 > southEdge);
            if (zOverlap) {
              closestSnapDistance = distToEast;
              snapX = eastEdge + groundWidth / 2;
              snapZ = boxPosZ;
            }
          }
          
          // Kontrola snapování k západní hraně (položit vpravo od ní)
          const distToWest = Math.abs(targetX - (westEdge - groundWidth / 2));
          if (distToWest < snapThreshold && distToWest < closestSnapDistance) {
            const zOverlap = !(targetZ + groundDepth / 2 < northEdge || targetZ - groundDepth / 2 > southEdge);
            if (zOverlap) {
              closestSnapDistance = distToWest;
              snapX = westEdge - groundWidth / 2;
              snapZ = boxPosZ;
            }
          }
          
          // Kontrola snapování k jižní hraně (položit nahoře od ní)
          const distToSouth = Math.abs(targetZ - (southEdge + groundDepth / 2));
          if (distToSouth < snapThreshold && distToSouth < closestSnapDistance) {
            const xOverlap = !(targetX + groundWidth / 2 < westEdge || targetX - groundWidth / 2 > eastEdge);
            if (xOverlap) {
              closestSnapDistance = distToSouth;
              snapX = boxPosX;
              snapZ = southEdge + groundDepth / 2;
            }
          }
          
          // Kontrola snapování k severní hraně (položit dole od ní)
          const distToNorth = Math.abs(targetZ - (northEdge - groundDepth / 2));
          if (distToNorth < snapThreshold && distToNorth < closestSnapDistance) {
            const xOverlap = !(targetX + groundWidth / 2 < westEdge || targetX - groundWidth / 2 > eastEdge);
            if (xOverlap) {
              closestSnapDistance = distToNorth;
              snapX = boxPosX;
              snapZ = northEdge - groundDepth / 2;
            }
          }
        }
        
        // Aplikovat snap pokud byl nalezen
        if (snapX !== null && snapZ !== null) {
          targetX = snapX;
          targetZ = snapZ;
        }
      }
      
      // Snapping pro track a track-curve objekty
      let snapMeta = null;
      let trackCenterOverride = null;
      if (selectedShapeRef.current === 'track' || selectedShapeRef.current === 'track-curve' || selectedShapeRef.current === 'track-curve-custom') {
        const snapThreshold = 3;
        
        let closestSnapDistance = Infinity;
        let snapX = null;
        let snapZ = null;
        let snapY = null;
        
        // Projít všechny existující track objekty
        for (const box of placedBoxes.current) {
          if (!box.userData || (box.userData.type !== 'track' && box.userData.type !== 'track-curve')) continue;
          
          const boxPosX = box.position.x;
          const boxPosZ = box.position.z;
          const boxRotZ = box.rotation.z;

          const endpointsData = box.userData.trackEndpoints;
          if (endpointsData) {
            for (const key of ['start', 'end']) {
              const endpoint = endpointsData[key];
              if (!endpoint || !endpoint.center) continue;
              const centerVec = pointToVector3(endpoint.center);
              if (!centerVec) continue;
              const dist = Math.hypot(targetX - centerVec.x, targetZ - centerVec.z);
              if (dist < snapThreshold && dist < closestSnapDistance) {
                closestSnapDistance = dist;
                snapX = centerVec.x;
                snapZ = centerVec.z;
                snapY = centerVec.y;
                snapMeta = { type: 'track-endpoint', endpointName: key, endpoint };
              }
            }
            if (snapMeta) {
              continue;
            }
          }
          
          if (box.userData.type === 'track') {
            // Použít skutečnou velikost z userData
            const existingTrackLength = box.userData.size[1];
            
            // Zjistit orientaci existující dráhy podle rotace
            const isHorizontal = Math.abs(Math.cos(boxRotZ)) > 0.5;
            
            if (isHorizontal) {
              // Horizontální dráha - snapovat vlevo nebo vpravo
              const distToRight = Math.abs(targetX - (boxPosX + existingTrackLength));
              if (distToRight < snapThreshold && distToRight < closestSnapDistance) {
                const zAlign = Math.abs(targetZ - boxPosZ);
                if (zAlign < 2) {
                  closestSnapDistance = distToRight;
                  snapX = boxPosX + existingTrackLength;
                  snapZ = boxPosZ;
                }
              }
              
              const distToLeft = Math.abs(targetX - (boxPosX - existingTrackLength));
              if (distToLeft < snapThreshold && distToLeft < closestSnapDistance) {
                const zAlign = Math.abs(targetZ - boxPosZ);
                if (zAlign < 2) {
                  closestSnapDistance = distToLeft;
                  snapX = boxPosX - existingTrackLength;
                  snapZ = boxPosZ;
                }
              }
            } else {
              // Vertikální dráha - snapovat nahoru nebo dolů
              const distToUp = Math.abs(targetZ - (boxPosZ + existingTrackLength));
              if (distToUp < snapThreshold && distToUp < closestSnapDistance) {
                const xAlign = Math.abs(targetX - boxPosX);
                if (xAlign < 2) {
                  closestSnapDistance = distToUp;
                  snapX = boxPosX;
                  snapZ = boxPosZ + existingTrackLength;
                }
              }
              
              const distToDown = Math.abs(targetZ - (boxPosZ - existingTrackLength));
              if (distToDown < snapThreshold && distToDown < closestSnapDistance) {
                const xAlign = Math.abs(targetX - boxPosX);
                if (xAlign < 2) {
                  closestSnapDistance = distToDown;
                  snapX = boxPosX;
                  snapZ = boxPosZ - existingTrackLength;
                }
              }
            }
          }
          
          // Pro zatáčku
          if (box.userData.type === 'track-curve') {
            // Použít skutečné rozměry z userData
            const curveWidth = box.userData.size[0];
            const curveRadius = box.userData.size[1];
            const innerRadius = curveRadius;
            const outerRadius = curveRadius + curveWidth;
            const middleRadius = curveRadius + curveWidth / 2;
            
            const rotY = box.rotation.y;
            
            // Pro napojení ROVNÝCH ČÁSTÍ:
            // Snap body jsou na středním poloměru
            const trackStart = {
              x: boxPosX + Math.cos(rotY) * middleRadius,
              z: boxPosZ + Math.sin(rotY) * middleRadius
            };
            const trackEnd = {
              x: boxPosX + Math.cos(rotY + Math.PI/2) * middleRadius,
              z: boxPosZ + Math.sin(rotY + Math.PI/2) * middleRadius
            };
            
            // 4 body pro napojení ZATÁČEK (vnitřní a vnější)
            const innerStart = {
              x: boxPosX + Math.cos(rotY) * innerRadius,
              z: boxPosZ + Math.sin(rotY) * innerRadius
            };
            const innerEnd = {
              x: boxPosX + Math.cos(rotY + Math.PI/2) * innerRadius,
              z: boxPosZ + Math.sin(rotY + Math.PI/2) * innerRadius
            };
            const outerStart = {
              x: boxPosX + Math.cos(rotY) * outerRadius,
              z: boxPosZ + Math.sin(rotY) * outerRadius
            };
            const outerEnd = {
              x: boxPosX + Math.cos(rotY + Math.PI/2) * outerRadius,
              z: boxPosZ + Math.sin(rotY + Math.PI/2) * outerRadius
            };
            
            // Všechny snap body
            const ends = [trackStart, trackEnd, innerStart, innerEnd, outerStart, outerEnd];
            
            for (const end of ends) {
              const dist = Math.sqrt(Math.pow(targetX - end.x, 2) + Math.pow(targetZ - end.z, 2));
              
              if (dist < snapThreshold && dist < closestSnapDistance) {
                closestSnapDistance = dist;
                snapX = end.x;
                snapZ = end.z;
              }
            }
          }
        }
        
        // Aplikovat snap pokud byl nalezen
        if (snapX !== null && snapZ !== null) {
          targetX = snapX;
          targetZ = snapZ;
          
          // Pro track: upravit pozici podle velikosti a rotace NOVÉ cesty
          if (selectedShapeRef.current === 'track') {
            const newTrackLength = trackSizeRef.current[1];
            if (snapMeta?.type === 'track-endpoint' && snapMeta.endpoint?.center) {
              const endpointCenter = pointToVector3(snapMeta.endpoint.center);
              let forwardVector = snapMeta.endpoint.forward ? pointToVector3(snapMeta.endpoint.forward) : null;
              if (!forwardVector || forwardVector.lengthSq() === 0) {
                forwardVector = getTrackDirectionVector(ghostRotation.current);
              }
              forwardVector.y = 0;
              if (forwardVector.lengthSq() === 0) {
                forwardVector.set(0, 0, 1);
              } else {
                forwardVector.normalize();
              }
              const effectiveForward = forwardVector.clone();
              if (snapMeta.endpointName === 'start') {
                effectiveForward.multiplyScalar(-1);
              }
              const offset = effectiveForward.clone().multiplyScalar(newTrackLength / 2);
              const newCenter = endpointCenter.clone();
              if (snapMeta.endpointName === 'end') {
                newCenter.add(offset);
              } else {
                newCenter.sub(offset);
              }
              const slopePercent = trackSlopeRef?.current ?? 0;
              const totalDelta = (slopePercent / 100) * newTrackLength;
              const centerY = snapMeta.endpointName === 'end'
                ? endpointCenter.y + totalDelta / 2
                : endpointCenter.y - totalDelta / 2;
              newCenter.y = centerY;
              targetX = newCenter.x;
              targetZ = newCenter.z;
              trackCenterOverride = newCenter;
              const newAngle = Math.atan2(effectiveForward.x, effectiveForward.z);
              ghostRotation.current = newAngle;
              if (currentGhost) {
                currentGhost.rotation.z = newAngle;
              }
            } else {
              const rotation = ghostRotation.current;
              const normalizedRotation = ((rotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
              const isHorizontal = Math.abs(Math.cos(normalizedRotation)) > 0.5;
              if (isHorizontal) {
                const direction = Math.cos(normalizedRotation) > 0 ? 1 : -1;
                targetX = snapX + direction * (newTrackLength / 2);
              } else {
                const direction = Math.sin(normalizedRotation) > 0 ? 1 : -1;
                targetZ = snapZ + direction * (newTrackLength / 2);
              }
            }
          }
          lastTrackSnapInfo = snapMeta;
        } else {
          lastTrackSnapInfo = null;
        }
      }
      
      if (trackCenterOverride) {
        currentGhost.position.copy(trackCenterOverride);
      } else {
        currentGhost.position.x = targetX;
        currentGhost.position.z = targetZ;
      }
      const terrainBaseY = sampleTerrainHeight(currentGhost.position.x, currentGhost.position.z);
      
      if (selectedShapeRef.current === 'ground' || selectedShapeRef.current === 'soccerfield') {
        currentGhost.position.y = terrainBaseY;
      } else if (selectedShapeRef.current === 'track') {
        const slopePercent = trackSlopeRef?.current ?? 0;
        const length = trackSizeRef.current[1];
        if (lastTrackSnapInfo?.type === 'track-endpoint' && lastTrackSnapInfo.endpoint?.center) {
          const totalDelta = (slopePercent / 100) * length;
          const endpointY = lastTrackSnapInfo.endpoint.center.y || 0;
          currentGhost.position.y = endpointY + totalDelta / 2;
        } else if (Math.abs(slopePercent) > 0.0001 && length > 0) {
          const trackDir = getTrackDirectionVector(ghostRotation.current);
          const halfLength = length / 2;
          const startX = targetX - trackDir.x * halfLength;
          const startZ = targetZ - trackDir.z * halfLength;
          const startHeight = sampleTerrainHeight(startX, startZ);
          const totalDelta = (slopePercent / 100) * length;
          currentGhost.position.y = startHeight + TRACK_SURFACE_OFFSET + totalDelta / 2;
        } else {
          currentGhost.position.y = terrainBaseY + TRACK_SURFACE_OFFSET;
        }
      } else if (selectedShapeRef.current === 'track-curve' || selectedShapeRef.current === 'track-curve-custom') {
        currentGhost.position.y = terrainBaseY + TRACK_SURFACE_OFFSET;
      } else if (selectedShapeRef.current === 'box-curve') {
        // Box-curve má výšku z boxCurveSizeRef[2]
        const ghostHeight = boxCurveSizeRef.current[2];
        const minY = terrainBaseY + ghostHeight / 2;
        let targetY = minY;
        
        for (const box of placedBoxes.current) {
          const dx = Math.abs(currentGhost.position.x - box.position.x);
          const dz = Math.abs(currentGhost.position.z - box.position.z);
          
          let boxWidth, boxHeight, boxDepth;
          
          if (!box.geometry) {
            if (box.userData && box.userData.type === 'soccerfield') {
              boxWidth = 90;
              boxHeight = 0.1;
              boxDepth = 70;
            } else if (box.userData && box.userData.type === 'door' && box.userData.size) {
              [boxWidth, boxHeight, boxDepth] = box.userData.size;
            } else {
              continue;
            }
          } else if (box.geometry.type === 'BoxGeometry') {
            boxWidth = box.geometry.parameters.width;
            boxHeight = box.geometry.parameters.height;
            boxDepth = box.geometry.parameters.depth;
          } else if (box.geometry.type === 'CylinderGeometry') {
            boxWidth = box.geometry.parameters.radiusTop * 2;
            boxHeight = box.geometry.parameters.height;
            boxDepth = box.geometry.parameters.radiusTop * 2;
          } else if (box.geometry.type === 'PlaneGeometry') {
            boxWidth = box.geometry.parameters.width;
            boxHeight = 0.1;
            boxDepth = box.geometry.parameters.height;
          } else {
            continue;
          }
          
          if (dx < boxWidth / 2 && dz < boxDepth / 2) {
            const potentialY = box.position.y + boxHeight / 2 + ghostHeight / 2 + 0.01;
            if (potentialY > targetY) {
              targetY = potentialY;
            }
          }
        }
        
        currentGhost.position.y = Math.max(targetY, minY);
      } else {
        let ghostHeight;
        if (selectedShapeRef.current === 'box' || selectedShapeRef.current === 'door') {
          ghostHeight = currentGhost.geometry.parameters.height;
        } else if (selectedShapeRef.current === 'cylinder') {
          ghostHeight = currentGhost.geometry.parameters.height;
        }
        const minY = terrainBaseY + (ghostHeight ? ghostHeight / 2 : 0);
        let targetY = minY;
        
        for (const box of placedBoxes.current) {
          const dx = Math.abs(currentGhost.position.x - box.position.x);
          const dz = Math.abs(currentGhost.position.z - box.position.z);
          
          let boxWidth, boxHeight, boxDepth;
          
          // Kontrola zda je to Group (např. soccerfield) nebo má geometry
          if (!box.geometry) {
            // Je to Group, použijeme userData
            if (box.userData && box.userData.type === 'soccerfield') {
              boxWidth = 90;
              boxHeight = 0.1;
              boxDepth = 70;
            } else if (box.userData && box.userData.type === 'door' && box.userData.size) {
              [boxWidth, boxHeight, boxDepth] = box.userData.size;
            } else {
              continue;
            }
          } else if (box.geometry.type === 'BoxGeometry') {
            boxWidth = box.geometry.parameters.width;
            boxHeight = box.geometry.parameters.height;
            boxDepth = box.geometry.parameters.depth;
          } else if (box.geometry.type === 'CylinderGeometry') {
            boxWidth = box.geometry.parameters.radiusTop * 2;
            boxHeight = box.geometry.parameters.height;
            boxDepth = box.geometry.parameters.radiusTop * 2;
          } else if (box.geometry.type === 'PlaneGeometry') {
            boxWidth = box.geometry.parameters.width;
            boxHeight = 0.1;
            boxDepth = box.geometry.parameters.height;
          } else {
            continue;
          }
          
          if (dx < boxWidth / 2 && dz < boxDepth / 2) {
            const potentialY = box.position.y + boxHeight / 2 + (ghostHeight ? ghostHeight / 2 : 0) + 0.01;
            if (potentialY > targetY) {
              targetY = potentialY;
            }
          }
        }
        
        currentGhost.position.y = Math.max(targetY, minY);
      }
      
      let size;
      if (selectedShapeRef.current === 'box') {
        size = boxSizeRef.current;
      } else if (selectedShapeRef.current === 'cylinder') {
        size = cylinderSizeRef.current;
      } else if (selectedShapeRef.current === 'ground' || selectedShapeRef.current === 'soccerfield') {
        size = [90, 70];
      } else if (selectedShapeRef.current === 'track') {
        size = trackSizeRef.current;
      } else if (selectedShapeRef.current === 'track-curve') {
        size = trackCurveSizeRef.current;
      } else if (selectedShapeRef.current === 'box-curve') {
        size = boxCurveSizeRef.current;
      } else if (selectedShapeRef.current === 'door') {
        size = doorSizeRef.current;
      }
      
      const hasCollision = checkCollision(currentGhost.position, size, selectedShapeRef.current, placedBoxes.current);
      if (hasCollision) {
        currentGhost.material.color.setHex(0xff0000);
      } else {
        currentGhost.material.color.setHex(selectedColorRef.current);
      }
    } else {
      currentGhost.visible = false;
    }
  };

  // Kliknutí
  let lastClickTime = 0;

  const handleClick = (e) => {
    // Zkontrolovat, zda je aktivní tree mode
    if (editorModeRef && editorModeRef.current === 'trees' && selectedTreeTypeRef && selectedTreeTypeRef.current) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      
      // Raycast na terén
      if (terrainManagerRef && terrainManagerRef.current) {
        const terrainMeshes = terrainManagerRef.current.getMeshes();
        if (terrainMeshes && terrainMeshes.length > 0) {
          const intersects = raycaster.current.intersectObjects(terrainMeshes, false);
          if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            const placementMode = treePlacementModeRef?.current || 'single';
            
            if (treeManagerRef && treeManagerRef.current) {
              if (placementMode === 'single') {
                // Umístit jeden strom
                treeManagerRef.current.addTree({
                  type: selectedTreeTypeRef.current,
                  position: hitPoint,
                  height: treeHeightRef.current,
                  crownWidth: treeCrownWidthRef.current,
                });
              } else {
                // Brush mode - umístit více stromů
                const brushRadius = treeBrushRadiusRef?.current || 15;
                const density = treeBrushDensityRef?.current || 0.5;
                const area = Math.PI * brushRadius * brushRadius;
                const treeCount = Math.max(1, Math.floor(area * density)); // Minimálně 1 strom
                
                console.log(`Brush mode: radius=${brushRadius}, density=${density}, area=${area.toFixed(2)}, treeCount=${treeCount}`);
                
                // Generovat náhodné pozice v kruhu s lepším rozložením
                const placedTrees = [];
                for (let i = 0; i < treeCount; i++) {
                  let attempts = 0;
                  let treePos;
                  let validPosition = false;
                  
                  // Zkusit najít validní pozici (max 10 pokusů)
                  while (!validPosition && attempts < 10) {
                    const angle = Math.random() * Math.PI * 2;
                    // Použít sqrt pro rovnoměrnější rozložení v kruhu
                    const radius = Math.sqrt(Math.random()) * brushRadius;
                    const offsetX = Math.cos(angle) * radius;
                    const offsetZ = Math.sin(angle) * radius;
                    treePos = new THREE.Vector3(
                      hitPoint.x + offsetX,
                      hitPoint.y,
                      hitPoint.z + offsetZ
                    );
                    
                    // Získat výšku terénu na této pozici
                    const terrainHeight = getTerrainHeightAt ? getTerrainHeightAt(treePos) : hitPoint.y;
                    treePos.y = terrainHeight;
                    
                    // Zkontrolovat minimální vzdálenost od ostatních stromů (volitelné)
                    validPosition = true;
                    for (const placed of placedTrees) {
                      if (treePos.distanceTo(placed) < 1.0) {
                        validPosition = false;
                        break;
                      }
                    }
                    attempts++;
                  }
                  
                  if (validPosition && treePos) {
                    placedTrees.push(treePos.clone());
                    
                    // Přidat malou variaci výšky a velikosti pro přirozenost
                    const heightVariation = treeHeightRef.current * (0.8 + Math.random() * 0.4);
                    const crownVariation = treeCrownWidthRef.current * (0.8 + Math.random() * 0.4);
                    
                    treeManagerRef.current.addTree({
                      type: selectedTreeTypeRef.current,
                      position: treePos,
                      height: heightVariation,
                      crownWidth: crownVariation,
                    });
                  }
                }
                
                console.log(`Placed ${placedTrees.length} trees out of ${treeCount} requested`);
              }
              // Aktualizovat LOD (bez frameCount, protože není k dispozici)
              treeManagerRef.current.updateLOD(0);
            }
          }
        }
      }
      return;
    }
    
    if (selectedShapeRef.current === 'road-builder') {
      return;
    }
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    
    if (mouseNeutralizedRef.current || !selectedShapeRef.current) {
      const now = performance.now();
      const isDoubleClick = now - lastClickTime < 350;
      lastClickTime = now;
      if (!isDoubleClick) {
        return;
      }
      
      const intersects = raycaster.current.intersectObjects(placedBoxes.current, true);
      
      if (intersects.length > 0) {
        let parentMesh = intersects[0].object;
        while (parentMesh && !placedBoxes.current.includes(parentMesh)) {
          parentMesh = parentMesh.parent;
        }
        
        if (!parentMesh) return;
        
        if (selectedObjectRef.current) {
          const wireframe = findWireframe(selectedObjectRef.current);
          if (wireframe) wireframe.material.color.setHex(0xffffff);
        }
        
        const wireframe = findWireframe(parentMesh);
        if (wireframe) wireframe.material.color.setHex(0xffff00);
        selectedObjectRef.current = parentMesh;
        setSelectedObject(parentMesh);
      } else {
        if (selectedObjectRef.current) {
          const wireframe = findWireframe(selectedObjectRef.current);
          if (wireframe) wireframe.material.color.setHex(0xffffff);
          selectedObjectRef.current = null;
          setSelectedObject(null);
        }
      }
      return;
    }
    
    const currentGhost = ghostBoxRef.current;
    if (!selectedShapeRef.current || !currentGhost || !currentGhost.visible) return;
    
    const position = currentGhost.position.clone();
    
    let size;
    if (selectedShapeRef.current === 'box') {
      size = boxSizeRef.current;
    } else if (selectedShapeRef.current === 'cylinder') {
      size = cylinderSizeRef.current;
    } else if (selectedShapeRef.current === 'ground') {
      size = [90, 70];
    } else if (selectedShapeRef.current === 'soccerfield') {
      size = [90, 70];
    } else if (selectedShapeRef.current === 'track') {
      size = trackSizeRef.current;
    } else if (selectedShapeRef.current === 'track-curve') {
      size = trackCurveSizeRef.current;
    } else if (selectedShapeRef.current === 'track-curve-custom') {
      size = trackCurveCustomSizeRef.current;
    } else if (selectedShapeRef.current === 'box-curve') {
      size = boxCurveSizeRef.current;
    } else if (selectedShapeRef.current === 'door') {
      size = doorSizeRef.current;
    }

    let trackSlopeConfig = null;
    if (selectedShapeRef.current === 'track' && size && size.length >= 2) {
      const slopePercent = trackSlopeRef?.current ?? 0;
      const length = size[1];
      const rotation = ghostRotation.current;
      const trackDir = getTrackDirectionVector(rotation);
      const dirX = trackDir.x;
      const dirZ = trackDir.z;
      const halfLength = length / 2;
      const startX = position.x - dirX * halfLength;
      const startZ = position.z - dirZ * halfLength;
      let startBaseHeight;
      if (lastTrackSnapInfo?.type === 'track-endpoint' && lastTrackSnapInfo.endpoint?.center) {
        const endpointY = lastTrackSnapInfo.endpoint.center.y || 0;
        startBaseHeight = endpointY - TRACK_SURFACE_OFFSET;
      } else {
        startBaseHeight = sampleTerrainHeight(startX, startZ);
      }
      const totalDelta = (slopePercent / 100) * length;
      position.y = startBaseHeight + TRACK_SURFACE_OFFSET + totalDelta / 2;
      trackSlopeConfig = {
        slopePercent,
        startHeight: startBaseHeight,
        length,
        width: size[0],
        rotation,
        totalDelta
      };
    }
    
    const hasCollision = checkCollision(position, size, selectedShapeRef.current, placedBoxes.current);
    if (hasCollision) {
      return;
    }
    
    // Speciální zpracování pro fotbalové hříště
    if (selectedShapeRef.current === 'soccerfield') {
      const fieldGroup = createSoccerField();
      fieldGroup.position.copy(position);
      const baseY = sampleTerrainHeight(fieldGroup.position.x, fieldGroup.position.z);
      fieldGroup.position.y = baseY;
      fieldGroup.userData = {
        type: 'soccerfield',
        size: [90, 70],
        color: 0x4a7c26,
        material: 'standard'
      };
      fieldGroup.userData.snapToTerrain = true;
      fieldGroup.userData.terrainOffset = fieldGroup.position.y - baseY;
      sceneRef.current.add(fieldGroup);
      placedBoxes.current.push(fieldGroup);
      saveAndSyncBuildings();
      
      // Přidat do historie pro undo
      historyRef.current.push({ type: 'create', object: fieldGroup });
      setCanUndo(true);
    } else {
      const extraOptions = {};
      if (selectedShapeRef.current === 'door') {
        extraOptions.hinge = doorOptionsRef.current?.hinge;
        extraOptions.isOpen = doorOptionsRef.current?.isOpen;
      } else if (selectedShapeRef.current === 'track-curve-custom') {
        extraOptions.curveAngle = trackCurveCustomAngleRef?.current ?? 45;
      } else if (selectedShapeRef.current === 'track') {
        extraOptions.trackSlopePercent = trackSlopeRef?.current ?? 0;
        const trackDir = getTrackDirectionVector(ghostRotation.current);
        const halfLength = size[1] / 2;
        const startBase = trackSlopeConfig
          ? trackSlopeConfig.startHeight
          : sampleTerrainHeight(position.x - trackDir.x * halfLength, position.z - trackDir.z * halfLength);
        const totalDelta = trackSlopeConfig ? trackSlopeConfig.totalDelta : 0;
        const startCenter = new THREE.Vector3(
          position.x - trackDir.x * halfLength,
          startBase + TRACK_SURFACE_OFFSET,
          position.z - trackDir.z * halfLength
        );
        const endCenter = new THREE.Vector3(
          position.x + trackDir.x * halfLength,
          startBase + TRACK_SURFACE_OFFSET + totalDelta,
          position.z + trackDir.z * halfLength
        );
        const up = new THREE.Vector3(0, 1, 0);
        const rightVec = new THREE.Vector3().copy(up).cross(trackDir).normalize();
        if (rightVec.lengthSq() === 0) {
          rightVec.set(1, 0, 0);
        }
        const halfWidth = (size[0] || 0) / 2;
        const startLeft = startCenter.clone().addScaledVector(rightVec, -halfWidth);
        const startRight = startCenter.clone().addScaledVector(rightVec, halfWidth);
        const endLeft = endCenter.clone().addScaledVector(rightVec, -halfWidth);
        const endRight = endCenter.clone().addScaledVector(rightVec, halfWidth);
        extraOptions.trackEndpoints = {
          start: {
            center: { x: startCenter.x, y: startCenter.y, z: startCenter.z },
            left: { x: startLeft.x, y: startLeft.y, z: startLeft.z },
            right: { x: startRight.x, y: startRight.y, z: startRight.z },
            forward: { x: trackDir.x, y: trackDir.y, z: trackDir.z },
          },
          end: {
            center: { x: endCenter.x, y: endCenter.y, z: endCenter.z },
            left: { x: endLeft.x, y: endLeft.y, z: endLeft.z },
            right: { x: endRight.x, y: endRight.y, z: endRight.z },
            forward: { x: trackDir.x, y: trackDir.y, z: trackDir.z },
          },
        };
      }

      const newObject = createRealObject(
        selectedShapeRef.current,
        position, 
        ghostRotation.current, 
        size,
        selectedColorRef.current,
        selectedMaterialRef.current,
        withWindowsRef.current,
        sceneRef.current,
        placedBoxes.current,
        roadSurfaceRef.current,
        extraOptions
      );
      if (
        selectedShapeRef.current === 'track' &&
        trackSlopeConfig &&
        terrainManagerRef?.current &&
        size &&
        Math.abs(trackSlopeConfig.slopePercent) > 0.0001
      ) {
        const trackDir = getTrackDirectionVector(ghostRotation.current);
        terrainManagerRef.current.applySlopeForTrack({
          center: newObject.position,
          length: size[1],
          width: size[0],
          rotation: ghostRotation.current,
          slopePercent: trackSlopeConfig.slopePercent,
          baseHeight: trackSlopeConfig.startHeight,
          directionVector: trackDir
        });
        terrainManagerRef.current.saveDirtyChunks();
      }
      saveAndSyncBuildings();
      
      // Přidat do historie pro undo
      historyRef.current.push({ type: 'create', object: newObject });
      setCanUndo(true);

      if (newObject && newObject.userData) {
        const baseY = sampleTerrainHeight(newObject.position.x, newObject.position.z);
        newObject.userData.snapToTerrain = true;
        newObject.userData.terrainOffset = newObject.position.y - baseY;
      }
      if (selectedShapeRef.current === 'track') {
        lastTrackSnapInfo = null;
      }
    }
  };

  // Klávesy
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedObjectRef.current) {
      const snapshot = createDeletionSnapshot(selectedObjectRef.current);
      if (snapshot) {
        historyRef.current.push({ type: 'delete', data: snapshot });
        setCanUndo(true);
      }
      const index = placedBoxes.current.indexOf(selectedObjectRef.current);
      if (index > -1) {
        placedBoxes.current.splice(index, 1);
      }
      
      if (sceneRef.current) {
        sceneRef.current.remove(selectedObjectRef.current);
      }
      disposeObject(selectedObjectRef.current);
      
      selectedObjectRef.current = null;
      setSelectedObject(null);
      saveAndSyncBuildings();
      return;
    }
    
    if (!selectedShapeRef.current || mouseNeutralizedRef.current) return;

    const currentGhost = ghostBoxRef.current;
    if (!currentGhost) return;

    if ((e.key === 'q' || e.key === 'Q') && selectedShapeRef.current !== 'ground' && selectedShapeRef.current !== 'soccerfield') {
      ghostRotation.current -= Math.PI / 2;
      if (selectedShapeRef.current === 'track') {
        currentGhost.rotation.z = ghostRotation.current;
      } else if (selectedShapeRef.current === 'track-curve' || selectedShapeRef.current === 'track-curve-custom') {
        currentGhost.rotation.y = ghostRotation.current;
      } else {
        currentGhost.rotation.y = ghostRotation.current;
      }
    } else if ((e.key === 'e' || e.key === 'E') && selectedShapeRef.current !== 'ground' && selectedShapeRef.current !== 'soccerfield') {
      ghostRotation.current += Math.PI / 2;
      if (selectedShapeRef.current === 'track') {
        currentGhost.rotation.z = ghostRotation.current;
      } else if (selectedShapeRef.current === 'track-curve' || selectedShapeRef.current === 'track-curve-custom') {
        currentGhost.rotation.y = ghostRotation.current;
      } else {
        currentGhost.rotation.y = ghostRotation.current;
      }
    } else if (e.key === 'Escape') {
      resetRoadBuilderState();
      selectedShapeRef.current = null;
      setSelectedShape(null);
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    if (selectedObjectRef.current) {
      const wireframe = findWireframe(selectedObjectRef.current);
      if (wireframe) wireframe.material.color.setHex(0xffffff);
      selectedObjectRef.current = null;
      setSelectedObject(null);
    }
    }
  };

  // Pravé tlačítko myši
  const handleMouseDown = (e) => {
    if (e.button === 0 && selectedShapeRef.current === 'road-builder') {
      if (mouseNeutralizedRef.current) return;
      const startPoint = projectPointerToTerrain(e);
      if (!startPoint) return;
      const snappedStart = snapPointToRoadNetwork(startPoint.clone());
      roadBuilderStateRef.current.isDrawing = true;
      roadBuilderStateRef.current.startPoint = snappedStart.clone();
      roadBuilderStateRef.current.currentPoint = snappedStart.clone();
      ensureRoadPreview();
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      e.preventDefault();
      return;
    }

    if (e.button === 2) {
      if (roadBuilderStateRef.current.isDrawing) {
        resetRoadBuilderState();
      }
      mouseNeutralizedRef.current = true;
      setMouseNeutralized(true);
      const currentGhost = ghostBoxRef.current;
      if (currentGhost) {
        currentGhost.visible = false;
      }
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }
  };

  const handleMouseUp = (e) => {
    if (e.button === 0 && selectedShapeRef.current === 'road-builder') {
      if (!roadBuilderStateRef.current.isDrawing || !roadBuilderStateRef.current.startPoint) {
        resetRoadBuilderState();
        return;
      }
      const endPoint = projectPointerToTerrain(e);
      if (endPoint) {
        const snappedEnd = snapPointToRoadNetwork(endPoint.clone());
        finalizeRoadSegment(roadBuilderStateRef.current.startPoint.clone(), snappedEnd.clone());
      }
      resetRoadBuilderState();
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
      return;
    }

    if (e.button === 2) {
      mouseNeutralizedRef.current = false;
      setMouseNeutralized(false);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Přidání event listenerů
  renderer.domElement.addEventListener('mousemove', handleMouseMove);
  renderer.domElement.addEventListener('click', handleClick);
  renderer.domElement.addEventListener('mousedown', handleMouseDown);
  renderer.domElement.addEventListener('mouseup', handleMouseUp);
  renderer.domElement.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeyDown);

  // Cleanup funkce
  return () => {
    renderer.domElement.removeEventListener('mousemove', handleMouseMove);
    renderer.domElement.removeEventListener('click', handleClick);
    renderer.domElement.removeEventListener('mousedown', handleMouseDown);
    renderer.domElement.removeEventListener('mouseup', handleMouseUp);
    renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Vytvoří čáry fotbalového hříště
 * @param {THREE.Scene} scene - Scéna
 */
export const createFieldLines = (scene) => {
  const createLine = (points, color = 0xffffff) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    return new THREE.Line(geometry, material);
  };

  // Vnější čáry
  const outerLines = createLine([
    new THREE.Vector3(-20, 0.05, -13),
    new THREE.Vector3(20, 0.05, -13),
    new THREE.Vector3(20, 0.05, 13),
    new THREE.Vector3(-20, 0.05, 13),
    new THREE.Vector3(-20, 0.05, -13)
  ]);
  scene.add(outerLines);

  // Středová čára
  const centerLine = createLine([
    new THREE.Vector3(0, 0.05, -13),
    new THREE.Vector3(0, 0.05, 13)
  ]);
  scene.add(centerLine);

  // Středový kruh
  const circlePoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(
      Math.cos(angle) * 4,
      0.05,
      Math.sin(angle) * 4
    ));
  }
  const centerCircle = createLine(circlePoints);
  scene.add(centerCircle);

  // Pokutová území
  const penaltyAreaLeft = createLine([
    new THREE.Vector3(-20, 0.05, -8),
    new THREE.Vector3(-14, 0.05, -8),
    new THREE.Vector3(-14, 0.05, 8),
    new THREE.Vector3(-20, 0.05, 8)
  ]);
  scene.add(penaltyAreaLeft);

  const penaltyAreaRight = createLine([
    new THREE.Vector3(20, 0.05, -8),
    new THREE.Vector3(14, 0.05, -8),
    new THREE.Vector3(14, 0.05, 8),
    new THREE.Vector3(20, 0.05, 8)
  ]);
  scene.add(penaltyAreaRight);

  // Malá vápna
  const goalAreaLeft = createLine([
    new THREE.Vector3(-20, 0.05, -4),
    new THREE.Vector3(-17, 0.05, -4),
    new THREE.Vector3(-17, 0.05, 4),
    new THREE.Vector3(-20, 0.05, 4)
  ]);
  scene.add(goalAreaLeft);

  const goalAreaRight = createLine([
    new THREE.Vector3(20, 0.05, -4),
    new THREE.Vector3(17, 0.05, -4),
    new THREE.Vector3(17, 0.05, 4),
    new THREE.Vector3(20, 0.05, 4)
  ]);
  scene.add(goalAreaRight);

  // Pokutové body
  const penaltySpotGeometry = new THREE.CircleGeometry(0.15, 16);
  const penaltySpotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  const penaltySpotLeft = new THREE.Mesh(penaltySpotGeometry, penaltySpotMaterial);
  penaltySpotLeft.rotation.x = -Math.PI / 2;
  penaltySpotLeft.position.set(-14, 0.05, 0);
  scene.add(penaltySpotLeft);

  const penaltySpotRight = new THREE.Mesh(penaltySpotGeometry, penaltySpotMaterial);
  penaltySpotRight.rotation.x = -Math.PI / 2;
  penaltySpotRight.position.set(14, 0.05, 0);
  scene.add(penaltySpotRight);

  // Středový bod
  const centerSpot = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  centerSpot.rotation.x = -Math.PI / 2;
  centerSpot.position.set(0, 0.05, 0);
  scene.add(centerSpot);
};

/**
 * Vytvoří fotbalové branky
 * @param {THREE.Scene} scene - Scéna
 */
export const createGoals = (scene) => {
  const createGoal = (x, rotationY) => {
    const goalGroup = new THREE.Group();
    
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.7,
      roughness: 0.3
    });

    // Přední tyče
    const frontLeftPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.5, 16),
      postMaterial
    );
    frontLeftPost.position.set(-1.5, 0.75, 0);
    frontLeftPost.castShadow = true;
    goalGroup.add(frontLeftPost);

    const frontRightPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.5, 16),
      postMaterial
    );
    frontRightPost.position.set(1.5, 0.75, 0);
    frontRightPost.castShadow = true;
    goalGroup.add(frontRightPost);

    // Horní tyč (břevno)
    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3, 16),
      postMaterial
    );
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 1.5, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

    // Zadní konstrukce
    const backLeftPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16),
      postMaterial
    );
    backLeftPost.position.set(-1.5, 0.75, -2);
    goalGroup.add(backLeftPost);

    const backRightPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16),
      postMaterial
    );
    backRightPost.position.set(1.5, 0.75, -2);
    goalGroup.add(backRightPost);

    const backCrossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3, 16),
      postMaterial
    );
    backCrossbar.rotation.z = Math.PI / 2;
    backCrossbar.position.set(0, 1.5, -2);
    goalGroup.add(backCrossbar);

    // Spojovací tyče
    const topLeftConnector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2, 16),
      postMaterial
    );
    topLeftConnector.rotation.x = Math.PI / 2;
    topLeftConnector.position.set(-1.5, 1.5, -1);
    goalGroup.add(topLeftConnector);

    const topRightConnector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2, 16),
      postMaterial
    );
    topRightConnector.rotation.x = Math.PI / 2;
    topRightConnector.position.set(1.5, 1.5, -1);
    goalGroup.add(topRightConnector);

    const bottomBackBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 3, 16),
      postMaterial
    );
    bottomBackBar.rotation.z = Math.PI / 2;
    bottomBackBar.position.set(0, 0, -2);
    goalGroup.add(bottomBackBar);

    // Síť
    const netMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      wireframe: true
    });

    const backNet = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 1.5, 15, 8),
      netMaterial
    );
    backNet.position.set(0, 0.75, -2);
    goalGroup.add(backNet);

    const leftNet = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.5, 10, 8),
      netMaterial
    );
    leftNet.rotation.y = Math.PI / 2;
    leftNet.position.set(-1.5, 0.75, -1);
    goalGroup.add(leftNet);

    const rightNet = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 1.5, 10, 8),
      netMaterial
    );
    rightNet.rotation.y = Math.PI / 2;
    rightNet.position.set(1.5, 0.75, -1);
    goalGroup.add(rightNet);

    const topNet = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 2, 15, 10),
      netMaterial
    );
    topNet.rotation.x = Math.PI / 2;
    topNet.position.set(0, 1.5, -1);
    goalGroup.add(topNet);

    goalGroup.position.x = x;
    goalGroup.rotation.y = rotationY;
    
    return goalGroup;
  };

  scene.add(createGoal(-20, Math.PI / 2));
  scene.add(createGoal(20, -Math.PI / 2));
};
