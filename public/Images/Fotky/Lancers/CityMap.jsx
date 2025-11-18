import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function CityBuilder() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
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
  const selectedMaterialRef = useRef('standard');
  
  const [buildingCount, setBuildingCount] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null); // 'box' nebo 'cylinder'
  const [boxSize, setBoxSize] = useState([1, 1, 1]); // [width, height, depth]
  const [cylinderSize, setCylinderSize] = useState([0.5, 1]); // [radius, height]
  const [selectedColor, setSelectedColor] = useState(0xffffff); // Defaultně bílá
  const [selectedMaterial, setSelectedMaterial] = useState('standard'); // Typ materiálu
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [mouseNeutralized, setMouseNeutralized] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [withWindows, setWithWindows] = useState(false); // Okna pro boxy
  const withWindowsRef = useRef(false);

  // Funkce pro smazání všech staveb
  const clearAllBuildings = () => {
    if (!window.confirm('Opravdu chceš smazat všechny objekty?')) return;
    
    placedBoxes.current.forEach(box => {
      if (sceneRef.current) sceneRef.current.remove(box);
      if (box.geometry) box.geometry.dispose();
      if (box.material) box.material.dispose();
    });
    
    placedBoxes.current = [];
    setBuildingCount(0);
    localStorage.removeItem('cityBuildings');
    
    if (selectedObjectRef.current) {
      selectedObjectRef.current = null;
      setSelectedObject(null);
    }
  };

  // Funkce pro uložení staveb do localStorage
  const saveBuildings = () => {
    const buildingsData = placedBoxes.current.map(box => ({
      type: box.userData.type,
      position: { x: box.position.x, y: box.position.y, z: box.position.z },
      rotation: { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z },
      size: box.userData.size,
      color: box.userData.color,
      material: box.userData.material
    }));
    localStorage.setItem('cityBuildings', JSON.stringify(buildingsData));
  };

  // Funkce pro načtení staveb z localStorage
  const loadBuildings = (scene) => {
    const savedData = localStorage.getItem('cityBuildings');
    if (!savedData) return;
    
    const buildingsData = JSON.parse(savedData);
    buildingsData.forEach(data => {
      let geometry;
      if (data.type === 'box') {
        geometry = new THREE.BoxGeometry(...data.size);
      } else if (data.type === 'cylinder') {
        geometry = new THREE.CylinderGeometry(data.size[0], data.size[0], data.size[1], 32);
      }
      
      const material = createMaterial(data.material, data.color, false);
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(data.position.x, data.position.y, data.position.z);
      mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
      
      // Přidání oken pro boxy
      if (data.type === 'box' && data.withWindows) {
        const [width, height, depth] = data.size;
        const windowSize = Math.min(width, height, depth) * 0.15;
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const rows = Math.max(2, Math.floor(height / (windowSize * 2)));
        const cols = Math.max(2, Math.floor(width / (windowSize * 2)));
        
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const windowGeo = new THREE.BoxGeometry(windowSize, windowSize, 0.02);
            
            const window1 = new THREE.Mesh(windowGeo, windowMaterial);
            window1.position.set(
              -width/2 + windowSize + j * (width - windowSize*2)/(cols-1),
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              depth/2 + 0.01
            );
            mesh.add(window1);
            
            const window2 = new THREE.Mesh(windowGeo, windowMaterial);
            window2.position.set(
              -width/2 + windowSize + j * (width - windowSize*2)/(cols-1),
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              -depth/2 - 0.01
            );
            mesh.add(window2);
          }
        }
        
        const colsSide = Math.max(2, Math.floor(depth / (windowSize * 2)));
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < colsSide; j++) {
            const windowGeo = new THREE.BoxGeometry(0.02, windowSize, windowSize);
            
            const window3 = new THREE.Mesh(windowGeo, windowMaterial);
            window3.position.set(
              width/2 + 0.01,
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              -depth/2 + windowSize + j * (depth - windowSize*2)/(colsSide-1)
            );
            mesh.add(window3);
            
            const window4 = new THREE.Mesh(windowGeo, windowMaterial);
            window4.position.set(
              -width/2 - 0.01,
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              -depth/2 + windowSize + j * (depth - windowSize*2)/(colsSide-1)
            );
            mesh.add(window4);
          }
        }
      }
      
      mesh.userData = {
        type: data.type,
        size: data.size,
        color: data.color,
        material: data.material,
        withWindows: data.withWindows || false
      };
      
      scene.add(mesh);
      placedBoxes.current.push(mesh);
    });
    
    setBuildingCount(placedBoxes.current.length);
  };

  // Funkce pro vytvoření materiálu
  const createMaterial = (materialType, color, forGhost = false) => {
    const baseOptions = {
      color: color,
    };
    
    if (forGhost) {
      baseOptions.transparent = true;
      baseOptions.opacity = 0.5;
    }
    
    switch (materialType) {
      case 'metallic':
        return new THREE.MeshStandardMaterial({
          ...baseOptions,
          metalness: 0.9,
          roughness: 0.2
        });
      case 'matte':
        return new THREE.MeshLambertMaterial(baseOptions);
      case 'glass':
        return new THREE.MeshPhysicalMaterial({
          ...baseOptions,
          transparent: true,
          opacity: forGhost ? 0.3 : 0.4,
          roughness: 0.1,
          transmission: 0.9,
          thickness: 0.5
        });
      case 'neon':
        return new THREE.MeshStandardMaterial({
          ...baseOptions,
          emissive: color,
          emissiveIntensity: 0.5,
          roughness: 0.3
        });
      case 'wood':
        return new THREE.MeshStandardMaterial({
          ...baseOptions,
          roughness: 0.8,
          metalness: 0.1
        });
      case 'plastic':
        return new THREE.MeshPhongMaterial({
          ...baseOptions,
          shininess: 120,
          specular: 0x444444
        });
      case 'ice':
        return new THREE.MeshPhysicalMaterial({
          color: forGhost ? color : new THREE.Color(color).lerp(new THREE.Color(0xaaddff), 0.3),
          transparent: true,
          opacity: forGhost ? 0.4 : 0.7,
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.6,
          thickness: 0.8,
          ior: 1.31,
          reflectivity: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1
        });
      case 'standard':
      default:
        return new THREE.MeshPhongMaterial({
          ...baseOptions,
          shininess: 100
        });
    }
  };

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

    // Vytvoření OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.1; // Zabránit pohledu pod zem
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

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
    const createGhost = (shape, size, color, materialType) => {
      let geometry;
      if (shape === 'box') {
        geometry = new THREE.BoxGeometry(...size);
      } else if (shape === 'cylinder') {
        geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], 32);
      }
      
      const material = createMaterial(materialType, color, true);
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
    
    let ghostObject = createGhost('box', [1, 1, 1], 0xffffff, 'standard');
    ghostBoxRef.current = ghostObject;

    // Osvětlení
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Slunce pozice
    const sunPosition = new THREE.Vector3(15, 15, 10);
    
    // Directional light jako slunce
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

    // Vizuální slunce
    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(sunPosition);
    scene.add(sun);
    
    // Glow efekt pro slunce
    const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(sunPosition);
    scene.add(glow);

    // Funkce pro kontrolu kolize
    const checkCollision = (position, size, shape) => {
      const tolerance = 0.01; // Malá tolerance pro zaokrouhlení floatů
      
      for (const box of placedBoxes.current) {
        const dx = Math.abs(position.x - box.position.x);
        const dz = Math.abs(position.z - box.position.z);
        const dy = Math.abs(position.y - box.position.y);
        
        // Získat rozměry existujícího objektu
        let boxWidth, boxHeight, boxDepth;
        if (box.geometry.type === 'BoxGeometry') {
          boxWidth = box.geometry.parameters.width;
          boxHeight = box.geometry.parameters.height;
          boxDepth = box.geometry.parameters.depth;
        } else if (box.geometry.type === 'CylinderGeometry') {
          boxWidth = box.geometry.parameters.radiusTop * 2;
          boxHeight = box.geometry.parameters.height;
          boxDepth = box.geometry.parameters.radiusTop * 2;
        }
        
        // Získat rozměry nového objektu
        let newWidth, newHeight, newDepth;
        if (shape === 'box') {
          [newWidth, newHeight, newDepth] = size;
        } else if (shape === 'cylinder') {
          newWidth = size[0] * 2;
          newHeight = size[1];
          newDepth = size[0] * 2;
        }
        
        // Kontrola PŘEKRYTÍ (ne dotýkání) - objekty se mohou dotýkat
        const overlapX = dx < (boxWidth / 2 + newWidth / 2 - tolerance);
        const overlapY = dy < (boxHeight / 2 + newHeight / 2 - tolerance);
        const overlapZ = dz < (boxDepth / 2 + newDepth / 2 - tolerance);
        
        if (overlapX && overlapY && overlapZ) {
          return true; // Kolize!
        }
      }
      
      return false; // Bez kolize
    };

    // Funkce pro vytvoření skutečného objektu
    const createRealObject = (shape, position, rotationY, size, color, materialType, addWindows = false) => {
      let geometry;
      if (shape === 'box') {
        geometry = new THREE.BoxGeometry(...size);
      } else if (shape === 'cylinder') {
        geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], 32);
      }
      
      const material = createMaterial(materialType, color, false);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Přidání hran
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
      
      // Přidání oken pro boxy
      if (shape === 'box' && addWindows) {
        const [width, height, depth] = size;
        const windowSize = Math.min(width, height, depth) * 0.15;
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const rows = Math.max(2, Math.floor(height / (windowSize * 2)));
        const cols = Math.max(2, Math.floor(width / (windowSize * 2)));
        
        // Okna na přední a zadní straně
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const windowGeo = new THREE.BoxGeometry(windowSize, windowSize, 0.02);
            
            // Přední strana
            const window1 = new THREE.Mesh(windowGeo, windowMaterial);
            window1.position.set(
              -width/2 + windowSize + j * (width - windowSize*2)/(cols-1),
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              depth/2 + 0.01
            );
            mesh.add(window1);
            
            // Zadní strana
            const window2 = new THREE.Mesh(windowGeo, windowMaterial);
            window2.position.set(
              -width/2 + windowSize + j * (width - windowSize*2)/(cols-1),
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              -depth/2 - 0.01
            );
            mesh.add(window2);
          }
        }
        
        // Okna na bočních stranách
        const colsSide = Math.max(2, Math.floor(depth / (windowSize * 2)));
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < colsSide; j++) {
            const windowGeo = new THREE.BoxGeometry(0.02, windowSize, windowSize);
            
            // Pravá strana
            const window3 = new THREE.Mesh(windowGeo, windowMaterial);
            window3.position.set(
              width/2 + 0.01,
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              -depth/2 + windowSize + j * (depth - windowSize*2)/(colsSide-1)
            );
            mesh.add(window3);
            
            // Levá strana
            const window4 = new THREE.Mesh(windowGeo, windowMaterial);
            window4.position.set(
              -width/2 - 0.01,
              -height/2 + windowSize + i * (height - windowSize*2)/(rows-1),
              -depth/2 + windowSize + j * (depth - windowSize*2)/(colsSide-1)
            );
            mesh.add(window4);
          }
        }
      }
      
      // Nastavení pozice a rotace
      mesh.position.copy(position);
      mesh.rotation.y = rotationY;
      
      mesh.userData = {
        type: shape,
        size: size,
        color: color,
        material: materialType,
        withWindows: addWindows
      };
      
      scene.add(mesh);
      placedBoxes.current.push(mesh);
      saveBuildings();
      return mesh;
    };

    // Pohyb myši
    const handleMouseMove = (e) => {
      if (!selectedShapeRef.current || mouseNeutralizedRef.current) {
        // Povolit orbit controls
        if (controlsRef.current) controlsRef.current.enabled = true;
        return;
      }

      // Zakázat orbit controls při stavění
      if (controlsRef.current) controlsRef.current.enabled = false;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      
      // Raycast pouze na ground pro horizontální pozici
      const groundIntersects = raycaster.current.intersectObject(ground);

      const currentGhost = ghostBoxRef.current;
      if (!currentGhost) return;

      if (groundIntersects.length > 0) {
        currentGhost.visible = true;
        const point = groundIntersects[0].point;
        
        // Horizontální pozice z groundu
        currentGhost.position.x = Math.round(point.x * 2) / 2; // Snapping na 0.5
        currentGhost.position.z = Math.round(point.z * 2) / 2;
        
        // Získat výšku ghostu
        let ghostHeight;
        if (selectedShapeRef.current === 'box') {
          ghostHeight = currentGhost.geometry.parameters.height;
        } else if (selectedShapeRef.current === 'cylinder') {
          ghostHeight = currentGhost.geometry.parameters.height;
        }
        
        // Defaultně na ground
        let targetY = ghostHeight / 2;
        
        // Detekce objektů pod ghostem pro stavění nahoru
        for (const box of placedBoxes.current) {
          const dx = Math.abs(currentGhost.position.x - box.position.x);
          const dz = Math.abs(currentGhost.position.z - box.position.z);
          
          // Získat rozměry objektu
          let boxWidth, boxHeight, boxDepth;
          if (box.geometry.type === 'BoxGeometry') {
            boxWidth = box.geometry.parameters.width;
            boxHeight = box.geometry.parameters.height;
            boxDepth = box.geometry.parameters.depth;
          } else if (box.geometry.type === 'CylinderGeometry') {
            boxWidth = box.geometry.parameters.radiusTop * 2;
            boxHeight = box.geometry.parameters.height;
            boxDepth = box.geometry.parameters.radiusTop * 2;
          }
          
          // Pokud je ghost nad objektem, umístit ho nahoru
          if (dx < boxWidth / 2 && dz < boxDepth / 2) {
            const potentialY = box.position.y + boxHeight / 2 + ghostHeight / 2 + 0.01;
            if (potentialY > targetY) {
              targetY = potentialY;
            }
          }
        }
        
        currentGhost.position.y = targetY;
        
        // Kontrola kolize a změna barvy
        let size;
        if (selectedShapeRef.current === 'box') {
          size = boxSizeRef.current;
        } else if (selectedShapeRef.current === 'cylinder') {
          size = cylinderSizeRef.current;
        }
        
        const hasCollision = checkCollision(currentGhost.position, size, selectedShapeRef.current);
        if (hasCollision) {
          currentGhost.material.color.setHex(0xff0000); // Červená při kolizi
        } else {
          currentGhost.material.color.setHex(selectedColorRef.current); // Původní barva
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
      
      // Kontrola kolize - pokud je kolize, nestavíme
      const hasCollision = checkCollision(position, size, selectedShapeRef.current);
      if (hasCollision) {
        return; // Zabránit stavbě při kolizi
      }
      
      createRealObject(
        selectedShapeRef.current,
        position, 
        ghostRotation.current, 
        size,
        selectedColorRef.current,
        selectedMaterialRef.current,
        withWindowsRef.current
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
        saveBuildings();
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
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
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
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
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

    // Načíst uložené budovy
    loadBuildings(scene);

    // Animační smyčka
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
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
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
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
    
    // Deaktivovat orbit controls při výběru tvaru
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
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
    
    const material = createMaterial(selectedMaterial, selectedColor, true);
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
  }, [selectedShape, boxSize, cylinderSize, selectedColor, selectedMaterial]);

  // Aktualizace refs při změně state
  useEffect(() => {
    boxSizeRef.current = boxSize;
    cylinderSizeRef.current = cylinderSize;
    selectedColorRef.current = selectedColor;
    selectedMaterialRef.current = selectedMaterial;
    withWindowsRef.current = withWindows;
  }, [boxSize, cylinderSize, selectedColor, selectedMaterial, withWindows]);

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

            {/* 2.5 OKNA (pouze pro boxy) */}
            {selectedShape === 'box' && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-gray-300">🪟 Okna</h3>
                <button
                  onClick={() => setWithWindows(!withWindows)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    withWindows
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{withWindows ? '🪟' : '🔲'}</div>
                  <div className="text-sm">{withWindows ? 'S okny' : 'Bez oken'}</div>
                </button>
              </div>
            )}

            {/* 3. BARVA */}
            {selectedShape && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-gray-300">🎨 Barva</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={`#${selectedColor.toString(16).padStart(6, '0')}`}
                    onChange={(e) => {
                      const hex = e.target.value.replace('#', '');
                      setSelectedColor(parseInt(hex, 16));
                    }}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-600"
                  />
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">Vybraná barva:</div>
                    <div 
                      className="w-full h-8 rounded border-2 border-gray-600"
                      style={{ backgroundColor: `#${selectedColor.toString(16).padStart(6, '0')}` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. MATERIÁL */}
            {selectedShape && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-gray-300">✨ Materiál</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedMaterial('standard')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'standard'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🔲</div>
                    <div className="text-xs">Standard</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('metallic')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'metallic'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">⚙️</div>
                    <div className="text-xs">Kovový</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('matte')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'matte'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🧱</div>
                    <div className="text-xs">Matný</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('glass')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'glass'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">💎</div>
                    <div className="text-xs">Sklo</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('neon')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'neon'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">💡</div>
                    <div className="text-xs">Neon</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('wood')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'wood'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🪵</div>
                    <div className="text-xs">Dřevo</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('plastic')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'plastic'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🔷</div>
                    <div className="text-xs">Plast</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedMaterial('ice')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMaterial === 'ice'
                        ? 'border-blue-500 bg-blue-900/50'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🧊</div>
                    <div className="text-xs">Led</div>
                  </button>
                </div>
              </div>
            )}

            {/* Tlačítko pro zrušení výběru */}
            {selectedShape && (
              <button
                onClick={() => {
                  selectedShapeRef.current = null;
                  setSelectedShape(null);
                  if (controlsRef.current) {
                    controlsRef.current.enabled = true;
                  }
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
            
            {!selectedShape && (
              <>
                <div className="flex items-center gap-2">
                  🖱️ <strong>Levé tlačítko + tažení:</strong> Otáčení kamery
                </div>
                <div className="flex items-center gap-2">
                  🖱️ <strong>Kolečko:</strong> Přiblížení/oddálení
                </div>
                <div className="flex items-center gap-2">
                  🖱️ <strong>Pravé tlačítko + tažení:</strong> Posun kamery
                </div>
              </>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                📦 Objekty: {buildingCount}
              </div>
              <button
                onClick={clearAllBuildings}
                className="px-4 py-2 rounded-lg border-2 border-red-600 bg-red-900/50 hover:bg-red-800/50 font-semibold transition-all"
              >
                🗑️ Smazat vše
              </button>
            </div>
          </div>
        </div>

        {/* 3D scéna */}
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}
