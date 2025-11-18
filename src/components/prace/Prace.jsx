import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as THREE from 'three';
import { Player } from './Player.js';

export default function Prace() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // ========== SCENE ==========
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Světle modrá
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // ========== CAMERA ==========
    const camera = new THREE.PerspectiveCamera(
      60, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );

    // ========== RENDERER ==========
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ========== SVĚTLA ==========
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 50, 50);
    sun.castShadow = true;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 200;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    // ========== PODLAHA ==========
    const groundSize = 100;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cb342,  // Zelená tráva
      roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Přidat šachovnici na podlahu (aby bylo vidět pohyb)
    const checkerSize = 2;
    for (let x = -groundSize/2; x < groundSize/2; x += checkerSize * 2) {
      for (let z = -groundSize/2; z < groundSize/2; z += checkerSize * 2) {
        const tile = new THREE.Mesh(
          new THREE.PlaneGeometry(checkerSize, checkerSize),
          new THREE.MeshStandardMaterial({ 
            color: 0x689f38,  // Tmavší zelená
            roughness: 0.8 
          })
        );
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(x + checkerSize, 0.01, z + checkerSize);
        tile.receiveShadow = true;
        scene.add(tile);
      }
    }

    // ========== OBJEKTY VE SCÉNĚ ==========
    // Velká červená krabice
    const box1 = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.MeshStandardMaterial({ color: 0xff3333 })
    );
    box1.position.set(10, 1.5, -10);
    box1.castShadow = true;
    box1.receiveShadow = true;
    scene.add(box1);

    // Modrý válec
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 4, 16),
      new THREE.MeshStandardMaterial({ color: 0x3333ff })
    );
    cylinder.position.set(-10, 2, -5);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add(cylinder);

    // Žlutá koule
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffff33 })
    );
    sphere.position.set(0, 1.5, -15);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    // Oranžová zeď
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(40, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0xff9933 })
    );
    wall.position.set(0, 4, -30);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);

    // Pomocné osy (malé, aby nebyly moc rušivé)
    const axes = new THREE.AxesHelper(3);
    axes.position.set(0, 0.1, 0);
    scene.add(axes);
    
    // 🔥 VELKÉ OSY - aby bylo vidět pohyb!
    const bigAxes = new THREE.AxesHelper(20);
    bigAxes.position.set(0, 0.2, 0);
    scene.add(bigAxes);
    
    // 🔥 GRID - čtvercová síť aby bylo vidět pohyb!
    const gridHelper = new THREE.GridHelper(50, 25, 0xff0000, 0x444444);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);
    
    console.log('✅ Přidány viditelné markery pro sledování pohybu');

    // ========== HRÁČ ==========
    const player = new Player(scene, 0, 0.01, 5);
    player.create();
    // NEPOUŽÍVÁME setCamera - kamera bude fixní!
    playerRef.current = player;

    console.log('🎮 Third-person scéna vytvořena! VERZE: 2024-11-01-DEBUG');
    
    // ========== FIXNÍ KAMERA ==========
    // Kamera na PEVNÉ pozici - NIKDY se nepohybuje!
    camera.position.set(15, 20, 15);
    camera.lookAt(0, 0, 0); // Dívá se na střed scény
    
    console.log('📷 FIXNÍ kamera nastavena na:', camera.position);

    // ========== OVLÁDÁNÍ ==========
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      
      // 🔥 DEBUG - VŽDY logovat každý stisk
      console.log('⌨️ KEYDOWN:', key, '| Všechny aktivní:', Object.keys(keysRef.current).filter(k => keysRef.current[k]));
      
      if (key === 'escape') {
        navigate('/game');
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
      console.log('⌨️ KEYUP:', key);
    };

    // Registrace na document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    console.log('✅ Keyboard listenery REGISTROVÁNY!');

    // ========== ANIMAČNÍ SMYČKA ==========
    let animationId;
    let lastTime = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Převést na sekundy
      lastTime = currentTime;

      // Animovat objekty (aby bylo vidět, že to běží)
      box1.rotation.y += 0.01;
      cylinder.rotation.y += 0.015;
      sphere.position.y = 1.5 + Math.sin(currentTime * 0.002) * 0.5;

      // Update hráče (BEZ kamery - kamera je fixní!)
      if (playerRef.current) {
        playerRef.current.update(keysRef.current, deltaTime);
      }
      
      // Renderer vykreslí scénu s FIXNÍ kamerou
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // ========== RESIZE ==========
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // ========== CLEANUP ==========
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      playerRef.current = null;
      initializedRef.current = false;
    };
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* HORNÍ LIŠTA */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-900/95 to-transparent pointer-events-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/game')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors bg-slate-800/90 px-4 py-2 rounded-lg pointer-events-auto shadow-lg"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Zpět do hry</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              🏭 Práce - Sklad
            </h1>
            <p className="text-green-400 text-sm font-semibold mt-1">
              Third-Person View
            </p>
          </div>
          
          <div className="w-32" /> {/* Spacer pro centrovani */}
        </div>
      </div>

      {/* CANVAS KONTEJNER */}
      <div ref={containerRef} className="w-full h-full" />

      {/* NÁPOVĚDA */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl pointer-events-none z-10 shadow-2xl border border-white/10">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-bold text-green-400">WASD</span>
          <span className="text-gray-400">Pohyb</span>
          <span className="text-gray-600">|</span>
          <span className="font-bold text-blue-400">SPACE</span>
          <span className="text-gray-400">Skok</span>
          <span className="text-gray-600">|</span>
          <span className="font-bold text-red-400">ESC</span>
          <span className="text-gray-400">Zpět</span>
        </div>
      </div>

      {/* INFO PANEL */}
      <div className="absolute top-24 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-xl pointer-events-none z-10 shadow-xl border border-white/10">
        <h3 className="font-bold text-green-400 mb-2">📋 Kontrola:</h3>
        <ul className="text-xs space-y-1 text-gray-300">
          <li>✅ Kamera sleduje hráče</li>
          <li>✅ Vidíš postavu shora</li>
          <li>✅ Pohyb WASD</li>
          <li>✅ Objekty ve scéně</li>
          <li>✅ Stíny a osvětlení</li>
        </ul>
      </div>
    </div>
  );
}
