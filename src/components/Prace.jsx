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
  const pointerLockedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Ensure container has size and dark bg for debugging
    containerRef.current.style.background = '#0b1220';

    // Scene & camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 20, 400);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x87CEEB, 1);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Player
    const player = new Player(scene, 0, 0.01, 8);
    player.create?.();
    player.setCamera(camera);
    playerRef.current = player;

    // Helpers (must see SOMETHING even if camera fails to rotate)
    const axes = new THREE.AxesHelper(2);
    scene.add(axes);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(20, 50, 20);
    sun.castShadow = true;
    scene.add(sun);

    // Ground + checker
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x9aa7b1, roughness: 1 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Big moving cube as an obvious visual
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xff5533 })
    );
    cube.position.set(0, 1, -6);
    cube.castShadow = true;
    scene.add(cube);

    // Far wall to show parallax
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(400, 60, 2),
      new THREE.MeshStandardMaterial({ color: 0x446688 })
    );
    wall.position.set(0, 30, -150);
    wall.receiveShadow = true;
    scene.add(wall);

    // Input
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (e.key === 'Escape') {
        if (document.pointerLockElement) document.exitPointerLock();
        return;
      }
      keysRef.current[k] = true;
    };
    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Pointer lock
    const handleClick = () => {
      if (!document.pointerLockElement) renderer.domElement.requestPointerLock();
    };
    const handlePLC = () => {
      pointerLockedRef.current = (document.pointerLockElement === renderer.domElement);
      console.log(pointerLockedRef.current ? '🔒 Kurzor zamčen' : '🔓 Kurzor odemčen');
    };
    const handleMouseMove = (e) => {
      if (!pointerLockedRef.current) return;
      if (playerRef.current) {
        playerRef.current.rotate(e.movementX, e.movementY);
      }
    };
    containerRef.current.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePLC);
    document.addEventListener('mousemove', handleMouseMove);

    // Animation
    let rafId = 0;
    const animate = () => {
      // Rotate cube so it's obviously animating
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.005;

      if (playerRef.current) {
        playerRef.current.update(keysRef.current);
        camera.updateMatrixWorld(true);
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current) containerRef.current.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePLC);
      if (containerRef.current && renderer.domElement) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      playerRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/game')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors bg-slate-800/80 px-4 py-2 rounded-lg pointer-events-auto"
          >
            <ArrowLeft size={20} />
            <span>Zpět</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">🎮 First Person Controller</h1>
            <p className="text-green-400 text-sm font-semibold">Klikni do okna a jeď WASD + myš</p>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-full pointer-events-auto relative z-0" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded pointer-events-none z-10">
        WASD, Space, myš. Esc = uvolnit kurzor.
      </div>
    </div>
  );
}