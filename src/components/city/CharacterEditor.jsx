import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function CharacterEditor() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const headRef = useRef(null);
  const headGroupRef = useRef(null);
  
  // State pro úpravy hlavy
  const [skinColor, setSkinColor] = useState('#ffdbac');
  const [headWidth, setHeadWidth] = useState(1.0);
  const [headHeight, setHeadHeight] = useState(1.2);
  const [headDepth, setHeadDepth] = useState(1.0);
  const [eyeSize, setEyeSize] = useState(0.15);
  const [noseSize, setNoseSize] = useState(0.12);
  const [mouthWidth, setMouthWidth] = useState(0.3);

  // Funkce pro vytvoření hlavy
  const createHead = (scene) => {
    const headGroup = new THREE.Group();
    
    // Hlavní hlava - sphere
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor),
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    headGroup.add(head);
    headRef.current = head;
    
    // Oči (2 malé sphere)
    const eyeGeometry = new THREE.SphereGeometry(eyeSize, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.2, 0.85);
    leftEye.castShadow = true;
    headGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.2, 0.85);
    rightEye.castShadow = true;
    headGroup.add(rightEye);
    
    // Zorničky
    const pupilGeometry = new THREE.SphereGeometry(eyeSize * 0.5, 16, 16);
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.3
    });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.3, 0.2, 0.95);
    leftPupil.castShadow = true;
    headGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.3, 0.2, 0.95);
    rightPupil.castShadow = true;
    headGroup.add(rightPupil);
    
    // Nos (malý kuželík)
    const noseGeometry = new THREE.ConeGeometry(noseSize, noseSize * 1.5, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor).multiplyScalar(0.9),
      roughness: 0.8,
      metalness: 0.1
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, -0.1, 0.9);
    nose.rotation.x = Math.PI;
    nose.castShadow = true;
    headGroup.add(nose);
    
    // Ústa (elipsa)
    const mouthGeometry = new THREE.TorusGeometry(mouthWidth, 0.05, 8, 16, Math.PI);
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
      metalness: 0.1
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.5, 0.85);
    mouth.rotation.x = Math.PI;
    mouth.castShadow = true;
    headGroup.add(mouth);
    
    // Uši (2 malé sphere)
    const earGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const earMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor).multiplyScalar(0.95),
      roughness: 0.7,
      metalness: 0.1
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.9, 0, 0);
    leftEar.scale.set(0.5, 1, 0.8);
    leftEar.castShadow = true;
    headGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.9, 0, 0);
    rightEar.scale.set(0.5, 1, 0.8);
    rightEar.castShadow = true;
    headGroup.add(rightEar);
    
    headGroup.position.y = 0;
    headGroupRef.current = headGroup;
    scene.add(headGroup);
    
    return { headGroup, head };
  };

  // useEffect pro vytvoření scény
  useEffect(() => {
    if (!containerRef.current) return;

    // Scéna
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Kamera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Osvětlení
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 3, -5);
    scene.add(backLight);

    // Podlaha
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2d44,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Mřížka
    const gridHelper = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    // Vytvoření hlavy
    createHead(scene);

    // Responsivita
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animační smyčka
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (controls) controls.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // useEffect pro aktualizaci hlavy při změně parametrů
  useEffect(() => {
    if (!headRef.current || !headGroupRef.current) return;
    
    // Aktualizace škály hlavy
    headRef.current.scale.set(headWidth, headHeight, headDepth);
    
    // Aktualizace barvy pleti
    headRef.current.material.color.set(skinColor);
    
    // Aktualizace nosů a úst podle škály
    const children = headGroupRef.current.children;
    
    // Aktualizace pozic očí podle šířky hlavy
    children.forEach((child, index) => {
      if (index === 1) { // levé oko
        child.position.x = -0.3 * headWidth;
        child.scale.set(eyeSize / 0.15, eyeSize / 0.15, eyeSize / 0.15);
      }
      if (index === 2) { // pravé oko
        child.position.x = 0.3 * headWidth;
        child.scale.set(eyeSize / 0.15, eyeSize / 0.15, eyeSize / 0.15);
      }
      if (index === 3) { // levá zornice
        child.position.x = -0.3 * headWidth;
        child.scale.set(eyeSize / 0.15, eyeSize / 0.15, eyeSize / 0.15);
      }
      if (index === 4) { // pravá zornice
        child.position.x = 0.3 * headWidth;
        child.scale.set(eyeSize / 0.15, eyeSize / 0.15, eyeSize / 0.15);
      }
      if (index === 5) { // nos
        child.scale.set(noseSize / 0.12, noseSize / 0.12, noseSize / 0.12);
        child.material.color.set(new THREE.Color(skinColor).multiplyScalar(0.9));
      }
      if (index === 6) { // ústa
        child.scale.set(mouthWidth / 0.3, 1, 1);
      }
      if (index === 7) { // levé ucho
        child.position.x = -0.9 * headWidth;
        child.material.color.set(new THREE.Color(skinColor).multiplyScalar(0.95));
      }
      if (index === 8) { // pravé ucho
        child.position.x = 0.9 * headWidth;
        child.material.color.set(new THREE.Color(skinColor).multiplyScalar(0.95));
      }
    });
  }, [skinColor, headWidth, headHeight, headDepth, eyeSize, noseSize, mouthWidth]);

  const handleBackToMap = () => {
    navigate('/city-map');
  };

  // Přednastavené barvy pleti
  const skinTones = [
    { name: 'Světlá', color: '#ffdbac' },
    { name: 'Béžová', color: '#f1c27d' },
    { name: 'Hnědá', color: '#c68642' },
    { name: 'Tmavá', color: '#8d5524' },
    { name: 'Velmi tmavá', color: '#5c3317' },
  ];

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Levý panel s nástroji */}
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm shadow-2xl overflow-y-auto z-10 border-r border-purple-500/30">
        <div className="p-6 space-y-6">
          {/* Hlavička */}
          <div className="text-center pb-4 border-b border-purple-500/30">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              👤 Editor postav
            </h2>
            <p className="text-gray-400 text-sm mt-2">Prototyp - Hlava</p>
          </div>

          {/* Barva pleti */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              🎨 Barva pleti
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {skinTones.map((tone) => (
                <button
                  key={tone.color}
                  onClick={() => setSkinColor(tone.color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                    skinColor === tone.color 
                      ? 'border-purple-400 shadow-lg shadow-purple-500/50' 
                      : 'border-gray-600 hover:border-purple-300'
                  }`}
                  style={{ backgroundColor: tone.color }}
                  title={tone.name}
                />
              ))}
            </div>
            <input
              type="color"
              value={skinColor}
              onChange={(e) => setSkinColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rozměry hlavy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              📏 Rozměry hlavy
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>Šířka</span>
                <span className="text-purple-400 font-mono">{headWidth.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={headWidth}
                onChange={(e) => setHeadWidth(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>Výška</span>
                <span className="text-purple-400 font-mono">{headHeight.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.01"
                value={headHeight}
                onChange={(e) => setHeadHeight(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>Hloubka</span>
                <span className="text-purple-400 font-mono">{headDepth.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={headDepth}
                onChange={(e) => setHeadDepth(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Rysy obličeje */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              👀 Rysy obličeje
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>Velikost očí</span>
                <span className="text-purple-400 font-mono">{eyeSize.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.08"
                max="0.25"
                step="0.01"
                value={eyeSize}
                onChange={(e) => setEyeSize(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>Velikost nosu</span>
                <span className="text-purple-400 font-mono">{noseSize.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.06"
                max="0.20"
                step="0.01"
                value={noseSize}
                onChange={(e) => setNoseSize(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>Šířka úst</span>
                <span className="text-purple-400 font-mono">{mouthWidth.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.15"
                max="0.50"
                step="0.01"
                value={mouthWidth}
                onChange={(e) => setMouthWidth(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Rychlé presety */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              ⚡ Rychlé presety
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setHeadWidth(1.0);
                  setHeadHeight(1.2);
                  setHeadDepth(1.0);
                  setEyeSize(0.15);
                  setNoseSize(0.12);
                  setMouthWidth(0.3);
                }}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all"
              >
                Výchozí
              </button>
              <button
                onClick={() => {
                  setHeadWidth(1.2);
                  setHeadHeight(1.0);
                  setHeadDepth(1.1);
                  setEyeSize(0.12);
                  setNoseSize(0.15);
                  setMouthWidth(0.4);
                }}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
              >
                Široká
              </button>
              <button
                onClick={() => {
                  setHeadWidth(0.8);
                  setHeadHeight(1.4);
                  setHeadDepth(0.9);
                  setEyeSize(0.18);
                  setNoseSize(0.10);
                  setMouthWidth(0.25);
                }}
                className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all"
              >
                Úzká
              </button>
              <button
                onClick={() => {
                  setHeadWidth(1.1);
                  setHeadHeight(1.1);
                  setHeadDepth(1.1);
                  setEyeSize(0.20);
                  setNoseSize(0.08);
                  setMouthWidth(0.35);
                }}
                className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-all"
              >
                Kulatá
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 <strong>Tip:</strong> Použij myš k otáčení kamery kolem hlavy. 
              Kolečkem můžeš přibližovat a oddalovat.
            </p>
          </div>
        </div>
      </div>

      {/* Horní panel */}
      <div className="absolute top-0 left-80 right-0 bg-gray-900/95 backdrop-blur-sm shadow-lg z-10 border-b border-purple-500/30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToMap}
              className="px-4 py-2 rounded-lg border-2 border-purple-600 bg-purple-900/50 hover:bg-purple-800/50 font-semibold transition-all text-white"
            >
              ← Zpět na mapu
            </button>
            <h1 className="text-2xl font-bold text-white">🏗️ 3D Editor postav</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <strong>Prototyp:</strong> Hlava
            </div>
          </div>
        </div>
      </div>

      {/* 3D scéna */}
      <div 
        ref={containerRef} 
        className="absolute top-16 left-80 right-0 bottom-0"
        style={{ width: 'calc(100vw - 20rem)', height: 'calc(100vh - 4rem)' }}
      />
    </div>
  );
}
