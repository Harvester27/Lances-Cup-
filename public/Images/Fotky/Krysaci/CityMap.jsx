import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CityBuilder() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
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
  const selectedColorRef = useRef(0xffffff);
  
  const [buildingCount, setBuildingCount] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null); // 'box' nebo 'cylinder'
  const [boxSize, setBoxSize] = useState([1, 1, 1]); // [width, height, depth]
  const [cylinderSize, setCylinderSize] = useState([0.5, 1]); // [radius, height]
  const [selectedColor, setSelectedColor] = useState(0xffffff); // Defaultně bílá
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [mouseNeutralized, setMouseNeutralized] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);

  // Paleta barev
  const colorPalette = [
    { name: 'Bílá', color: 0xffffff },
    { name: 'Červená', color: 0xff0000 },
    { name: 'Modrá', color: 0x0000ff },
    { name: 'Zelená', color: 0x00ff00 },
    { name: 'Žlutá', color: 0xffff00 },
    { name: 'Oranžová', color: 0xff8800 },
    { name: 'Fialová', color: 0x9900ff },
    { name: 'Růžová', color: 0xff69b4 },
    { name: 'Tyrkysová', color: 0x00ffff },
    { name: 'Hnědá', color: 0x8b4513 },
    { name: 'Šedá', color: 0x808080 },
    { name: 'Černá', color: 0x000000 },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // Vytvoření scény
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    // Vytvoření kamery
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Vytvoření rendereru
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Vytvoření trávníku
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d5016,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    groundRef.current = ground;

    // Přidání světlejších pruhů na trávník
    const stripeGeometry = new THREE.PlaneGeometry(30, 2);
    for (let i = -7; i <= 7; i += 2) {
      const stripe = new THREE.Mesh(
        stripeGeometry,
        new THREE.MeshPhongMaterial({
          color: 0x3d6b1f,
          side: THREE.DoubleSide
        })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.y = 0.01;
      stripe.position.z = i;
      stripe.receiveShadow = true;
      scene.add(stripe);
    }

    // Vytvoření ghost objektu
    const createGhost = (shape, size, color) => {
      let geometry;
      if (shape === 'box') {
        geometry = new THREE.BoxGeometry(...size);
      } else if (shape === 'cylinder') {
        geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], 32);
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.5
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Přidání hran
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
      
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    };
    
    let ghostObject = createGhost('box', [1, 1, 1], 0xffffff);
    ghostBoxRef.current = ghostObject;

    // Osvětlení
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Funkce pro vytvoření skutečného objektu
    const createRealObject = (shape, position, rotationY, size, color) => {
      let geometry;
      if (shape === 'box') {
        geometry = new THREE.BoxGeometry(...size);
      } else if (shape === 'cylinder') {
        geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], 32);
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Přidání hran
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
      
      // Nastavení pozice a rotace
      mesh.position.copy(position);
      mesh.rotation.y = rotationY;
      
      scene.add(mesh);
      placedBoxes.current.push(mesh);
      return mesh;
    };

    // Pohyb myši
    const handleMouseMove = (e) => {
      if (!selectedShapeRef.current || mouseNeutralizedRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      
      // Raycast na ground a všechny umístěné objekty
      const allObjects = [ground, ...placedBoxes.current];
      const intersects = raycaster.current.intersectObjects(allObjects);

      const currentGhost = ghostBoxRef.current;
      if (!currentGhost) return;

      if (intersects.length > 0) {
        currentGhost.visible = true;
        const intersect = intersects[0];
        const point = intersect.point;
        
        // Pokud je to objekt (ne ground), stavíme na jeho vrchol
        if (intersect.object !== ground) {
          currentGhost.position.x = intersect.object.position.x;
          currentGhost.position.z = intersect.object.position.z;
          
          // Získat výšku podle tvaru
          let objectHeight;
          if (intersect.object.geometry.type === 'BoxGeometry') {
            objectHeight = intersect.object.geometry.parameters.height;
          } else if (intersect.object.geometry.type === 'CylinderGeometry') {
            objectHeight = intersect.object.geometry.parameters.height;
          }
          
          let ghostHeight;
          if (selectedShapeRef.current === 'box') {
            ghostHeight = currentGhost.geometry.parameters.height;
          } else if (selectedShapeRef.current === 'cylinder') {
            ghostHeight = currentGhost.geometry.parameters.height;
          }
          
          currentGhost.position.y = intersect.object.position.y + objectHeight / 2 + ghostHeight / 2;
        } else {
          // Stavění na ground
          currentGhost.position.x = Math.round(point.x * 10) / 10;
          currentGhost.position.z = Math.round(point.z * 10) / 10;
          
          let ghostHeight;
          if (selectedShapeRef.current === 'box') {
            ghostHeight = currentGhost.geometry.parameters.height;
          } else if (selectedShapeRef.current === 'cylinder') {
            ghostHeight = currentGhost.geometry.parameters.height;
          }
          
          currentGhost.position.y = ghostHeight / 2;
        }
      } else {
        currentGhost.visible = false;
      }
    };

    // Kliknutí
    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      // Pokud je myš neutralizovaná NEBO není vybraný tvar, označujeme objekty
      if (mouseNeutralizedRef.current || !selectedShapeRef.current) {
        const intersects = raycaster.current.intersectObjects(placedBoxes.current);
        
        if (intersects.length > 0) {
          // Zrušit předchozí označení
          if (selectedObjectRef.current) {
            selectedObjectRef.current.material.emissive.setHex(0x000000);
          }
          
          // Označit nový objekt
          const newSelected = intersects[0].object;
          newSelected.material.emissive.setHex(0x555555);
          selectedObjectRef.current = newSelected;
          setSelectedObject(newSelected);
        } else {
          // Kliknutí mimo objekt - zrušit označení
          if (selectedObjectRef.current) {
            selectedObjectRef.current.material.emissive.setHex(0x000000);
            selectedObjectRef.current = null;
            setSelectedObject(null);
          }
        }
        return;
      }
      
      const currentGhost = ghostBoxRef.current;
      // Jinak stavíme
      if (!selectedShapeRef.current || !currentGhost || !currentGhost.visible) return;
      
      const position = currentGhost.position.clone();
      
      // Získat aktuální velikost podle tvaru
      let size;
      if (selectedShapeRef.current === 'box') {
        size = boxSizeRef.current;
      } else if (selectedShapeRef.current === 'cylinder') {
        size = cylinderSizeRef.current;
      }
      
      createRealObject(
        selectedShapeRef.current,
        position, 
        ghostRotation.current, 
        size,
        selectedColorRef.current
      );
      setBuildingCount(prev => prev + 1);
    };

    // Klávesy
    const handleKeyDown = (e) => {
      // Delete klávesa pro smazání označeného objektu
      if (e.key === 'Delete' && selectedObjectRef.current) {
        const index = placedBoxes.current.indexOf(selectedObjectRef.current);
        if (index > -1) {
          placedBoxes.current.splice(index, 1);
        }
        
        scene.remove(selectedObjectRef.current);
        selectedObjectRef.current.geometry.dispose();
        selectedObjectRef.current.material.dispose();
        
        selectedObjectRef.current = null;
        setSelectedObject(null);
        setBuildingCount(prev => Math.max(0, prev - 1));
        return;
      }
      
      if (!selectedShapeRef.current || mouseNeutralizedRef.current) return;

      const currentGhost = ghostBoxRef.current;
      if (!currentGhost) return;

      if (e.key === 'q' || e.key === 'Q') {
        ghostRotation.current -= Math.PI / 2;
        currentGhost.rotation.y = ghostRotation.current;
      } else if (e.key === 'e' || e.key === 'E') {
        ghostRotation.current += Math.PI / 2;
        currentGhost.rotation.y = ghostRotation.current;
      } else if (e.key === 'Escape') {
        selectedShapeRef.current = null;
        setSelectedShape(null);
        if (selectedObjectRef.current) {
          selectedObjectRef.current.material.emissive.setHex(0x000000);
          selectedObjectRef.current = null;
          setSelectedObject(null);
        }
      }
    };

    // Pravé tlačítko myši
    const handleMouseDown = (e) => {
      if (e.button === 2) {
        mouseNeutralizedRef.current = true;
        setMouseNeutralized(true);
        const currentGhost = ghostBoxRef.current;
        if (currentGhost) {
          currentGhost.visible = false;
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        mouseNeutralizedRef.current = false;
        setMouseNeutralized(false);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Animační smyčka
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Event listenery
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Responsivita
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handler pro výběr tvaru
  const handleShapeSelect = (shape) => {
    selectedShapeRef.current = shape;
    setSelectedShape(shape);
    ghostRotation.current = 0;
    
    // Zrušit označený objekt
    if (selectedObjectRef.current) {
      selectedObjectRef.current.material.emissive.setHex(0x000000);
      selectedObjectRef.current = null;
      setSelectedObject(null);
    }
  };

  // useEffect pro aktualizaci ghost objektu při změně nastavení
  useEffect(() => {
    if (!ghostBoxRef.current || !sceneRef.current) return;
    
    if (!selectedShape) {
      ghostBoxRef.current.visible = false;
      return;
    }

    const scene = sceneRef.current;
    const oldGhost = ghostBoxRef.current;
    
    // Odstranit starý ghost
    scene.remove(oldGhost);
    if (oldGhost.geometry) oldGhost.geometry.dispose();
    if (oldGhost.material) oldGhost.material.dispose();
    
    // Vytvořit nový ghost podle aktuálního nastavení
    let geometry;
    if (selectedShape === 'box') {
      geometry = new THREE.BoxGeometry(...boxSize);
    } else if (selectedShape === 'cylinder') {
      geometry = new THREE.CylinderGeometry(cylinderSize[0], cylinderSize[0], cylinderSize[1], 32);
    }
    
    const material = new THREE.MeshPhongMaterial({
      color: selectedColor,
      transparent: true,
      opacity: 0.5
    });
    const newGhost = new THREE.Mesh(geometry, material);
    
    // Přidat hrany
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    newGhost.add(wireframe);
    
    newGhost.visible = false;
    newGhost.rotation.y = ghostRotation.current;
    scene.add(newGhost);
    ghostBoxRef.current = newGhost;
  }, [selectedShape, boxSize, cylinderSize, selectedColor]);

  // Aktualizace refs při změně state
  useEffect(() => {
    boxSizeRef.current = boxSize;
    cylinderSizeRef.current = cylinderSize;
    selectedColorRef.current = selectedColor;
  }, [boxSize, cylinderSize, selectedColor]);

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
            {/* 1. VÝBĚR TVARU */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-300">📐 Tvar objektu</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleShapeSelect('box')}
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
                  onClick={() => handleShapeSelect('cylinder')}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    selectedShape === 'cylinder'
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-1">⭕</div>
                  <div className="font-semibold">Válec</div>
                </button>
              </div>
            </div>

            {/* 2. VELIKOST */}
            {selectedShape && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-gray-300">📏 Velikost</h3>
                
                {selectedShape === 'box' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Šířka (X): {boxSize[0].toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={boxSize[0]}
                        onChange={(e) => setBoxSize([parseFloat(e.target.value), boxSize[1], boxSize[2]])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Výška (Y): {boxSize[1].toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={boxSize[1]}
                        onChange={(e) => setBoxSize([boxSize[0], parseFloat(e.target.value), boxSize[2]])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Hloubka (Z): {boxSize[2].toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={boxSize[2]}
                        onChange={(e) => setBoxSize([boxSize[0], boxSize[1], parseFloat(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                
                {selectedShape === 'cylinder' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Poloměr: {cylinderSize[0].toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={cylinderSize[0]}
                        onChange={(e) => setCylinderSize([parseFloat(e.target.value), cylinderSize[1]])}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Výška: {cylinderSize[1].toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={cylinderSize[1]}
                        onChange={(e) => setCylinderSize([cylinderSize[0], parseFloat(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. BARVA */}
            {selectedShape && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-gray-300">🎨 Barva</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colorPalette.map((colorItem) => (
                    <button
                      key={colorItem.color}
                      onClick={() => setSelectedColor(colorItem.color)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        selectedColor === colorItem.color
                          ? 'border-blue-400 scale-110'
                          : 'border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: `#${colorItem.color.toString(16).padStart(6, '0')}` }}
                      title={colorItem.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tlačítko pro zrušení výběru */}
            {selectedShape && (
              <button
                onClick={() => {
                  selectedShapeRef.current = null;
                  setSelectedShape(null);
                  if (selectedObjectRef.current) {
                    selectedObjectRef.current.material.emissive.setHex(0x000000);
                    selectedObjectRef.current = null;
                    setSelectedObject(null);
                  }
                }}
                className="w-full p-3 rounded-lg border-2 border-red-600 bg-red-900/50 hover:bg-red-800/50 text-center"
              >
                ❌ Zrušit výběr
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hlavní oblast */}
      <div className="flex-1 flex flex-col">
        {/* Horní lišta */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 text-white">
          <h1 className="text-2xl font-bold mb-2">🏗️ Stavitel měst</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              {selectedShape ? (
                <>
                  <span className="text-green-400">✓</span>
                  <strong>Vybraný tvar:</strong> {selectedShape === 'box' ? '📦 Obdélník' : '⭕ Válec'}
                </>
              ) : (
                <>
                  <span className="text-blue-400">🎯</span>
                  <strong>Vyber tvar z levého panelu</strong> nebo <strong>označ objekt a Delete smaž</strong>
                </>
              )}
            </div>
            
            {mouseNeutralized && selectedShape && (
              <div className="flex items-center gap-2 text-blue-400">
                <strong>🖱️ REŽIM VÝBĚRU</strong>
              </div>
            )}
            
            {selectedObject && (
              <div className="flex items-center gap-2 text-red-400">
                <strong>🎯 Objekt označen</strong> (Delete pro smazání)
              </div>
            )}
            
            {selectedShape && !mouseNeutralized && (
              <>
                <div className="flex items-center gap-2">
                  🖱️ <strong>Levé tlačítko:</strong> Postav
                </div>
                <div className="flex items-center gap-2">
                  🖱️ <strong>Pravé tlačítko:</strong> Režim výběru
                </div>
                <div className="flex items-center gap-2">
                  ⌨️ <strong>Q/E:</strong> Otáčení
                </div>
                <div className="flex items-center gap-2">
                  <strong>ESC:</strong> Zrušit výběr
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-green-400 font-semibold ml-auto">
              📦 Objekty: {buildingCount}
            </div>
          </div>
        </div>

        {/* 3D scéna */}
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}
