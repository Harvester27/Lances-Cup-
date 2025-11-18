// src/SceneSetup.js
import { THREE } from './three.js';
import { FieldUtils } from './FieldUtils.js';

export class SceneSetup {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    
    // 🔥 NOVÉ: Uložení reference na FieldUtils pro external přístup k net animations
    this.fieldUtils = FieldUtils;
  }

  createScene() {
    // Scéna
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    this.scene = scene;
    return scene;
  }

  createCamera(width, height) {
    // Kamera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 35, 50);
    camera.lookAt(0, 0, 0);
    this.camera = camera;
    return camera;
  }

  createRenderer(width, height) {
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    this.renderer = renderer;
    return renderer;
  }

  createClock() {
    const clock = new THREE.Clock();
    this.clock = clock;
    return clock;
  }

  setupLighting(scene) {
    // Osvětlení
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 30, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -80;
    directionalLight.shadow.camera.right = 80;
    directionalLight.shadow.camera.top = 80;
    directionalLight.shadow.camera.bottom = -80;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const warmLight = new THREE.DirectionalLight(0xffaa44, 0.3);
    warmLight.position.set(-10, 20, -5);
    scene.add(warmLight);
  }

  createField(scene) {
    // 🔥 UPRAVENO: Vytvoření hřiště s podporou net animations
    FieldUtils.createField(scene);
    FieldUtils.createFieldLines(scene);
    FieldUtils.createGoals(scene);
    
    // 🔥 NOVÉ: Log potvrzující integraci síťového systému
    console.log('✅ Field created with net animation system integrated');
  }

  createGridHelper(scene, placementMode) {
    // Grid overlay pro režim umístění
    let gridHelper = null;
    if (placementMode) {
      gridHelper = new THREE.GridHelper(80, 40, 0x00ff00, 0x888888);
      gridHelper.position.y = 0.01;
      gridHelper.material.opacity = 0.3;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
    }
    return gridHelper;
  }

  setupResizeHandler(camera, renderer) {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // 🔥 NOVÉ: Cleanup log
    console.log('🧹 SceneSetup disposed');
  }
}