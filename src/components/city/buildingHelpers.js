import * as THREE from 'three';
import { createMaterial } from './materialHelpers';
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

const TRACK_SURFACE_OFFSET = 0.15;

const disposeMaterial = (material) => {
  if (!material) return;
  if (material.map) material.map.dispose();
  material.dispose();
};

export const disposeObject = (object) => {
  if (!object) return;
  object.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(child.material);
      }
    }
  });
};

const formatValue = (value) => (typeof value === 'number' && Number.isFinite(value) ? value.toFixed(3) : value ?? 'null');

const createEntryKey = (entry) => {
  const { type, position, rotation, size, color, material } = entry;
  const posKey = position ? `${formatValue(position.x)}_${formatValue(position.y)}_${formatValue(position.z)}` : 'pos-null';
  const rotKey = rotation ? `${formatValue(rotation.x)}_${formatValue(rotation.y)}_${formatValue(rotation.z)}` : 'rot-null';
  const sizeKey = Array.isArray(size) ? size.map(formatValue).join('_') : 'size-null';
  const slopeValue = typeof entry.trackSlopePercent === 'number' ? entry.trackSlopePercent : 0;
  const slopeKey = formatValue(slopeValue);
  const curveAngleValue = typeof entry.curveAngle === 'number' ? entry.curveAngle : 0;
  const curveAngleKey = formatValue(curveAngleValue);
  const roadKey = Array.isArray(entry.roadPath) && entry.roadPath.length > 0
    ? `${formatValue(entry.roadPath[0].x)}_${formatValue(entry.roadPath[0].z)}_${formatValue(entry.roadPath[entry.roadPath.length - 1].x)}_${formatValue(entry.roadPath[entry.roadPath.length - 1].z)}`
    : 'road-null';
  const trackKey = entry.trackEndpoints
    ? `${formatValue(entry.trackEndpoints.start?.x)}_${formatValue(entry.trackEndpoints.start?.z)}_${formatValue(entry.trackEndpoints.end?.x)}_${formatValue(entry.trackEndpoints.end?.z)}`
    : 'track-null';
  return [type ?? 'unknown', posKey, rotKey, sizeKey, color ?? 'color-null', material ?? 'mat-null', slopeKey, curveAngleKey, roadKey, trackKey].join('|');
};

const createDoorGroup = ({ size, color, materialType, hinge = 'left', isOpen = false }) => {
  const width = size?.[0] ?? 1;
  const height = size?.[1] ?? 2;
  const depth = size?.[2] ?? 0.2;
  const normalizedHinge = hinge === 'right' ? 'right' : 'left';

  const doorGeometry = new THREE.BoxGeometry(width, height, depth);
  const doorMaterial = createMaterial(materialType, color, false);
  const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
  doorMesh.castShadow = true;
  doorMesh.receiveShadow = true;
  doorMesh.userData.isDoorPanel = true;

  const edges = new THREE.EdgesGeometry(doorGeometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  doorMesh.add(wireframe);

  const pivot = new THREE.Group();
  doorMesh.position.x = normalizedHinge === 'left' ? width / 2 : -width / 2;
  pivot.add(doorMesh);

  const openAngle = isOpen ? (Math.PI / 2) * (normalizedHinge === 'left' ? 1 : -1) : 0;
  pivot.rotation.y = openAngle;

  const doorGroup = new THREE.Group();
  doorGroup.add(pivot);

  doorGroup.userData = {
    type: 'door',
    size: [width, height, depth],
    color,
    material: materialType,
    withWindows: false,
    doorConfig: {
      hinge: normalizedHinge,
      isOpen,
      openAngle
    },
    doorRuntime: {
      pivot,
      panel: doorMesh
    }
  };

  return doorGroup;
};

const ROAD_SURFACE_COLORS = {
  asphalt: 0x2f2e2c,
  tartan: 0xb8442e,
  gravel: 0x8b7355,
  dirt: 0x6b4423,
};

const cloneVector3 = (vectorLike = {}) => ({
  x: typeof vectorLike.x === 'number' ? vectorLike.x : 0,
  y: typeof vectorLike.y === 'number' ? vectorLike.y : 0,
  z: typeof vectorLike.z === 'number' ? vectorLike.z : 0,
});

const createRoadMaterial = (surface = 'asphalt') => {
  const color = ROAD_SURFACE_COLORS[surface] ?? ROAD_SURFACE_COLORS.asphalt;
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0.05,
  });
};

const buildRoadGeometry = (pathPoints = [], width = 6) => {
  if (!Array.isArray(pathPoints) || pathPoints.length < 2) {
    return null;
  }

  const absolutePoints = pathPoints.map((point) => new THREE.Vector3(point.x, point.y, point.z));
  const center = new THREE.Vector3();
  absolutePoints.forEach((point) => center.add(point));
  center.multiplyScalar(1 / absolutePoints.length);

  const relativePoints = absolutePoints.map((point) => point.clone().sub(center));
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const totalLengths = [0];
  let accumulated = 0;

  for (let i = 1; i < absolutePoints.length; i++) {
    accumulated += absolutePoints[i - 1].distanceTo(absolutePoints[i]);
    totalLengths.push(accumulated);
  }

  const halfWidth = width / 2;
  for (let i = 0; i < relativePoints.length; i++) {
    const current = relativePoints[i];
    const prev = relativePoints[i - 1] || relativePoints[i];
    const next = relativePoints[i + 1] || relativePoints[i];

    const dir = next.clone().sub(prev).setY(0);
    if (dir.lengthSq() === 0) {
      dir.set(1, 0, 0);
    } else {
      dir.normalize();
    }
    const right = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

    const leftVertex = current.clone().addScaledVector(right, -halfWidth);
    const rightVertex = current.clone().addScaledVector(right, halfWidth);

    vertices.push(leftVertex.x, leftVertex.y, leftVertex.z);
    vertices.push(rightVertex.x, rightVertex.y, rightVertex.z);

    normals.push(0, 1, 0, 0, 1, 0);

    const vCoord = totalLengths[i] * 0.1;
    uvs.push(0, vCoord);
    uvs.push(1, vCoord);
  }

  for (let i = 0; i < relativePoints.length - 1; i++) {
    const base = i * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { geometry, center, totalLength: accumulated };
};

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

const clonePoint = (point) => {
  if (!point) return undefined;
  return {
    x: Number(point.x) || 0,
    y: Number(point.y) || 0,
    z: Number(point.z) || 0,
  };
};

const vectorToObject = (vector) => ({
  x: Number(vector.x) || 0,
  y: Number(vector.y) || 0,
  z: Number(vector.z) || 0,
});

const buildEndpointData = (centerVec, forwardVec, width = 0) => {
  if (!centerVec || !forwardVec) return undefined;
  const forward = forwardVec.clone();
  forward.y = 0;
  if (forward.lengthSq() === 0) {
    forward.set(0, 0, 1);
  } else {
    forward.normalize();
  }
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().copy(up).cross(forward).normalize();
  if (right.lengthSq() === 0) {
    right.set(1, 0, 0);
  }
  const halfWidth = width / 2;
  const leftPoint = centerVec.clone().addScaledVector(right, -halfWidth);
  const rightPoint = centerVec.clone().addScaledVector(right, halfWidth);
  return {
    center: vectorToObject(centerVec),
    left: vectorToObject(leftPoint),
    right: vectorToObject(rightPoint),
    forward: vectorToObject(forward),
  };
};

const cloneEndpoint = (endpoint) => {
  if (!endpoint) return undefined;
  return {
    center: clonePoint(endpoint.center),
    left: clonePoint(endpoint.left),
    right: clonePoint(endpoint.right),
    forward: clonePoint(endpoint.forward),
    baseHeight: typeof endpoint.baseHeight === 'number' ? endpoint.baseHeight : undefined,
    offset: clonePoint(endpoint.offset),
    edgeType: endpoint.edgeType,
    width: endpoint.width,
  };
};

const computeTrackEndpointsFromMesh = (mesh) => {
  if (!mesh || !mesh.userData || !mesh.userData.size) {
    return null;
  }
  mesh.updateMatrixWorld(true);
  if (mesh.userData.type === 'track') {
    const length = mesh.userData.size[1];
    const width = mesh.userData.size[0];
    if (!length) return null;
    const direction = getTrackDirectionVector(mesh.rotation?.z || 0);
    const halfLength = length / 2;
    const slopePercent = mesh.userData.trackSlopePercent || 0;
    const totalDelta = (slopePercent / 100) * length;
    const startCenter = new THREE.Vector3(
      mesh.position.x - direction.x * halfLength,
      mesh.position.y - totalDelta / 2,
      mesh.position.z - direction.z * halfLength
    );
    const endCenter = new THREE.Vector3(
      mesh.position.x + direction.x * halfLength,
      mesh.position.y + totalDelta / 2,
      mesh.position.z + direction.z * halfLength
    );
    const startData = buildEndpointData(startCenter, direction.clone(), width);
    const endData = buildEndpointData(endCenter, direction.clone(), width);
    if (startData) {
      startData.baseHeight = startCenter.y - TRACK_SURFACE_OFFSET;
      startData.offset = vectorToObject(startCenter.clone().sub(mesh.position));
      startData.edgeType = 'start';
      startData.width = width;
    }
    if (endData) {
      endData.baseHeight = endCenter.y - TRACK_SURFACE_OFFSET;
      endData.offset = vectorToObject(endCenter.clone().sub(mesh.position));
      endData.edgeType = 'end';
      endData.width = width;
    }
    return {
      start: startData,
      end: endData,
    };
  }
  if (mesh.userData.type === 'track-curve' || mesh.userData.type === 'track-curve-custom') {
    const width = mesh.userData.size[0];
    const innerRadius = mesh.userData.size[1];
    if (!Number.isFinite(width) || !Number.isFinite(innerRadius)) {
      return null;
    }
    const middleRadius = innerRadius + width / 2;
    // Pro custom zatáčku použít úhel z userData, jinak Math.PI/2 (90°)
    const curveAngleRadians = mesh.userData.type === 'track-curve-custom' && typeof mesh.userData.curveAngle === 'number'
      ? (mesh.userData.curveAngle * Math.PI) / 180
      : Math.PI / 2;
    
    // Pro vycentrovanou geometrii: začátek je v úhlu -curveAngleRadians/2, konec v +curveAngleRadians/2
    const halfAngle = curveAngleRadians / 2;
    const localStart = new THREE.Vector3(
      Math.cos(-halfAngle) * middleRadius,
      0,
      Math.sin(-halfAngle) * middleRadius
    );
    const localEnd = new THREE.Vector3(
      Math.cos(halfAngle) * middleRadius,
      0,
      Math.sin(halfAngle) * middleRadius
    );
    const quaternion = new THREE.Quaternion();
    mesh.getWorldQuaternion(quaternion);
    const matrixWorld = mesh.matrixWorld.clone();
    const startCenter = localStart.applyMatrix4(matrixWorld);
    const endCenter = localEnd.applyMatrix4(matrixWorld);
    const startForward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
    startForward.y = 0;
    if (startForward.lengthSq() === 0) {
      startForward.set(0, 0, 1);
    } else {
      startForward.normalize();
    }
    // Směr na konci zatáčky je kolmý na směr začátku, otočený o úhel zatáčky
    const endForward = new THREE.Vector3(
      -Math.sin(curveAngleRadians),
      0,
      Math.cos(curveAngleRadians)
    ).applyQuaternion(quaternion);
    endForward.y = 0;
    if (endForward.lengthSq() === 0) {
      endForward.set(0, 0, 1);
    } else {
      endForward.normalize();
    }
    const startData = buildEndpointData(startCenter, startForward, width);
    const endData = buildEndpointData(endCenter, endForward, width);
    if (startData) {
      startData.baseHeight = startCenter.y - TRACK_SURFACE_OFFSET;
      startData.offset = vectorToObject(startCenter.clone().sub(mesh.position));
      startData.edgeType = 'start';
      startData.width = width;
    }
    if (endData) {
      endData.baseHeight = endCenter.y - TRACK_SURFACE_OFFSET;
      endData.offset = vectorToObject(endCenter.clone().sub(mesh.position));
      endData.edgeType = 'end';
      endData.width = width;
    }
    return {
      start: startData,
      end: endData,
    };
  }
  return null;
};

/**
 * Vytvoří kompletní fotbalové hříště jako skupinu
 * @returns {THREE.Group} Skupina s celým hřištěm
 */
export const createSoccerField = () => {
  const fieldGroup = new THREE.Group();
  
  // Seedovaný random generátor
  class SeededRandom {
    constructor(seed = 12345) {
      this.seed = seed;
    }
    next() {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    }
  }

  // Vytvoření grass textury
  const createGrassTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    const rng = new SeededRandom(42);
    
    context.fillStyle = '#4a7c26';
    context.fillRect(0, 0, 512, 512);
    
    const grassColors = ['#5d8f2f', '#6ba832', '#4a7c26', '#7da83f', '#3d6b1f'];
    
    for (let i = 0; i < 3000; i++) {
      const x = rng.next() * 512;
      const y = rng.next() * 512;
      const color = grassColors[Math.floor(rng.next() * grassColors.length)];
      const length = 2 + rng.next() * 6;
      const width = 0.5 + rng.next() * 1.5;
      
      context.fillStyle = color;
      context.fillRect(x, y, width, length);
      
      if (rng.next() > 0.7) {
        context.fillStyle = '#6ba832';
        context.fillRect(x + rng.next() * 2 - 1, y, 0.5, length * 0.7);
      }
    }
    
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (rng.next() - 0.5) * 20;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    context.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    
    return texture;
  };

  const grassTexture = createGrassTexture();
  const fieldMaterial = new THREE.MeshStandardMaterial({ 
    map: grassTexture,
    roughness: 0.9,
    metalness: 0.0,
    color: 0xb5e5b5
  });

  // Hlavní trávník
  const groundRng = new SeededRandom(456);
  const groundGeometry = new THREE.PlaneGeometry(90, 70, 150, 120);
  const positions = groundGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const height = (groundRng.next() - 0.5) * 0.12;
    positions.setZ(i, height);
  }
  groundGeometry.computeVertexNormals();
  
  const ground = new THREE.Mesh(groundGeometry, fieldMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  fieldGroup.add(ground);

  // Pruhy
  const stripeMaterial = new THREE.MeshStandardMaterial({ 
    map: grassTexture,
    roughness: 0.9,
    metalness: 0.0
  });

  const stripeRng = new SeededRandom(789);
  const stripeGeometry = new THREE.PlaneGeometry(4, 26, 50, 80);
  const stripePositions = stripeGeometry.attributes.position;
  for (let i = 0; i < stripePositions.count; i++) {
    const height = (stripeRng.next() - 0.5) * 0.08;
    stripePositions.setZ(i, height);
  }
  stripeGeometry.computeVertexNormals();
  
  for (let i = -18; i <= 18; i += 8) {
    const stripe = new THREE.Mesh(stripeGeometry.clone(), stripeMaterial);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(i, 0.01, 0);
    stripe.receiveShadow = true;
    fieldGroup.add(stripe);
  }

  // Stébla trávy
  const grassBladeRng = new SeededRandom(999);
  const grassBladeGeometry = new THREE.ConeGeometry(0.02, 0.3, 3);
  const grassBladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d8f2f,
    roughness: 0.8
  });

  const grassCount = 1200;
  const grassMesh = new THREE.InstancedMesh(grassBladeGeometry, grassBladeMaterial, grassCount);
  grassMesh.castShadow = true;
  grassMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < grassCount; i++) {
    dummy.position.set(
      (grassBladeRng.next() - 0.5) * 88,
      0.15,
      (grassBladeRng.next() - 0.5) * 68
    );
    dummy.rotation.z = (grassBladeRng.next() - 0.5) * 0.3;
    dummy.scale.y = 0.5 + grassBladeRng.next() * 0.8;
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
  }
  grassMesh.instanceMatrix.needsUpdate = true;
  fieldGroup.add(grassMesh);
  
  // Čáry hříště
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
  fieldGroup.add(outerLines);

  // Středová čára
  const centerLine = createLine([
    new THREE.Vector3(0, 0.05, -13),
    new THREE.Vector3(0, 0.05, 13)
  ]);
  fieldGroup.add(centerLine);

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
  fieldGroup.add(centerCircle);

  // Pokutová území
  const penaltyAreaLeft = createLine([
    new THREE.Vector3(-20, 0.05, -8),
    new THREE.Vector3(-14, 0.05, -8),
    new THREE.Vector3(-14, 0.05, 8),
    new THREE.Vector3(-20, 0.05, 8)
  ]);
  fieldGroup.add(penaltyAreaLeft);

  const penaltyAreaRight = createLine([
    new THREE.Vector3(20, 0.05, -8),
    new THREE.Vector3(14, 0.05, -8),
    new THREE.Vector3(14, 0.05, 8),
    new THREE.Vector3(20, 0.05, 8)
  ]);
  fieldGroup.add(penaltyAreaRight);

  // Malá vápna
  const goalAreaLeft = createLine([
    new THREE.Vector3(-20, 0.05, -4),
    new THREE.Vector3(-17, 0.05, -4),
    new THREE.Vector3(-17, 0.05, 4),
    new THREE.Vector3(-20, 0.05, 4)
  ]);
  fieldGroup.add(goalAreaLeft);

  const goalAreaRight = createLine([
    new THREE.Vector3(20, 0.05, -4),
    new THREE.Vector3(17, 0.05, -4),
    new THREE.Vector3(17, 0.05, 4),
    new THREE.Vector3(20, 0.05, 4)
  ]);
  fieldGroup.add(goalAreaRight);

  // Pokutové body
  const penaltySpotGeometry = new THREE.CircleGeometry(0.15, 16);
  const penaltySpotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  const penaltySpotLeft = new THREE.Mesh(penaltySpotGeometry, penaltySpotMaterial);
  penaltySpotLeft.rotation.x = -Math.PI / 2;
  penaltySpotLeft.position.set(-14, 0.05, 0);
  fieldGroup.add(penaltySpotLeft);

  const penaltySpotRight = new THREE.Mesh(penaltySpotGeometry, penaltySpotMaterial);
  penaltySpotRight.rotation.x = -Math.PI / 2;
  penaltySpotRight.position.set(14, 0.05, 0);
  fieldGroup.add(penaltySpotRight);

  // Středový bod
  const centerSpot = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  centerSpot.rotation.x = -Math.PI / 2;
  centerSpot.position.set(0, 0.05, 0);
  fieldGroup.add(centerSpot);
  
  // Branky
  const createGoal = (x, rotationY) => {
    const goalGroup = new THREE.Group();
    
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.7,
      roughness: 0.3
    });

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

    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3, 16),
      postMaterial
    );
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 1.5, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

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

  fieldGroup.add(createGoal(-20, Math.PI / 2));
  fieldGroup.add(createGoal(20, -Math.PI / 2));
  
  return fieldGroup;
};

/**
 * Uloží všechny stavby do localStorage
 * @param {Array} placedBoxes - Pole umístěných objektů
 */
export const saveBuildings = (placedBoxes, mapKey = 'cityBuildings') => {
  const uniqueEntries = [];
  const seenKeys = new Set();

  placedBoxes.forEach(box => {
    const entry = {
      type: box.userData.type,
      position: { x: box.position.x, y: box.position.y, z: box.position.z },
      rotation: { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z },
      size: box.userData.size,
      color: box.userData.color,
      material: box.userData.material,
      withWindows: box.userData.withWindows || false,
      roadSurface: box.userData.roadSurface,
      roadPath: box.userData.roadPath || null,
      roadWidth: box.userData.roadWidth || null,
      trackEndpoints: box.userData.trackEndpoints
        ? {
            start: cloneEndpoint(box.userData.trackEndpoints.start),
            end: cloneEndpoint(box.userData.trackEndpoints.end),
          }
        : null,
      trackSlopePercent: typeof box.userData.trackSlopePercent === 'number' ? box.userData.trackSlopePercent : 0,
      curveAngle: typeof box.userData.curveAngle === 'number' ? box.userData.curveAngle : null,
      drawings: box.userData.drawings || [],
      doorConfig: box.userData.doorConfig || null,
      terrainOffset: typeof box.userData.terrainOffset === 'number' ? box.userData.terrainOffset : null,
      snapToTerrain: !!box.userData.snapToTerrain,
    };
    const key = createEntryKey(entry);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    uniqueEntries.push(entry);
  });

  localStorage.setItem(mapKey, JSON.stringify(uniqueEntries));
};

/**
 * Přidá okna k objektu typu box
 * @param {THREE.Mesh} mesh - Mesh objektu
 * @param {Array} size - Rozměry objektu [width, height, depth]
 */
const addWindowsToMesh = (mesh, size) => {
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
};

/**
 * Načte stavby z localStorage
 * @param {THREE.Scene} scene - Three.js scéna
 * @param {Array} placedBoxes - Pole pro uložení načtených objektů
 * @returns {number} Počet načtených staveb
 */
export const loadBuildings = (scene, placedBoxes, mapKey = 'cityBuildings') => {
  const savedData = localStorage.getItem(mapKey);
  if (!savedData) return 0;
  
  const buildingsData = JSON.parse(savedData);
  const seenKeys = new Set();

  buildingsData.forEach(data => {
    const key = createEntryKey(data);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    // Speciální zpracování pro fotbalové hříště
    if (data.type === 'soccerfield') {
      const fieldGroup = createSoccerField();
      fieldGroup.position.set(data.position.x, data.position.y, data.position.z);
      fieldGroup.userData = {
        type: 'soccerfield',
        size: [90, 70],
        color: 0x4a7c26,
        material: 'standard',
        snapToTerrain: data.snapToTerrain ?? false,
        terrainOffset: typeof data.terrainOffset === 'number' ? data.terrainOffset : 0,
      };
      scene.add(fieldGroup);
      placedBoxes.push(fieldGroup);
      return;
    }
    
    if (data.type === 'door') {
      const doorGroup = createDoorGroup({
        size: data.size,
        color: data.color ?? 0xffffff,
        materialType: data.material || 'standard',
        hinge: data.doorConfig?.hinge,
        isOpen: data.doorConfig?.isOpen
      });
      doorGroup.position.set(data.position.x, data.position.y, data.position.z);
      doorGroup.rotation.set(data.rotation.x || 0, data.rotation.y || 0, data.rotation.z || 0);
      doorGroup.userData.snapToTerrain = data.snapToTerrain ?? false;
      doorGroup.userData.terrainOffset = typeof data.terrainOffset === 'number' ? data.terrainOffset : 0;
      scene.add(doorGroup);
      placedBoxes.push(doorGroup);
      return;
    }
    
    if (data.type === 'road') {
      const roadPath = data.roadPath || [];
      const width = data.roadWidth || (Array.isArray(data.size) ? data.size[0] : 6);
      createRealObject(
        'road',
        new THREE.Vector3(0, 0, 0),
        0,
        [width, Array.isArray(data.size) ? data.size[1] : undefined],
        data.color ?? 0x2f2e2c,
        data.material || 'standard',
        false,
        scene,
        placedBoxes,
        data.roadSurface || 'asphalt',
        {
          pathPoints: roadPath,
          roadWidth: width,
        }
      );
      return;
    }
    
    let geometry;
    let material;
    
    if (data.type === 'box') {
      geometry = new THREE.BoxGeometry(...data.size);
      material = createMaterial(data.material, data.color, false);
    } else if (data.type === 'cylinder') {
      geometry = new THREE.CylinderGeometry(data.size[0], data.size[0], data.size[1], 32);
      material = createMaterial(data.material, data.color, false);
    } else if (data.type === 'ground') {
      // Vytvoření grass textury pro zeminu
      class SeededRandom {
        constructor(seed = 12345) {
          this.seed = seed;
        }
        next() {
          this.seed = (this.seed * 9301 + 49297) % 233280;
          return this.seed / 233280;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      const rng = new SeededRandom(42);
      
      context.fillStyle = '#4a7c26';
      context.fillRect(0, 0, 512, 512);
      
      const grassColors = ['#5d8f2f', '#6ba832', '#4a7c26', '#7da83f', '#3d6b1f'];
      
      for (let i = 0; i < 3000; i++) {
        const x = rng.next() * 512;
        const y = rng.next() * 512;
        const grassColor = grassColors[Math.floor(rng.next() * grassColors.length)];
        const length = 2 + rng.next() * 6;
        const width = 0.5 + rng.next() * 1.5;
        
        context.fillStyle = grassColor;
        context.fillRect(x, y, width, length);
        
        if (rng.next() > 0.7) {
          context.fillStyle = '#6ba832';
          context.fillRect(x + rng.next() * 2 - 1, y, 0.5, length * 0.7);
        }
      }
      
      const imageData = context.getImageData(0, 0, 512, 512);
      const imgData = imageData.data;
      
      for (let i = 0; i < imgData.length; i += 4) {
        const noise = (rng.next() - 0.5) * 20;
        imgData[i] = Math.max(0, Math.min(255, imgData[i] + noise));
        imgData[i + 1] = Math.max(0, Math.min(255, imgData[i + 1] + noise));
        imgData[i + 2] = Math.max(0, Math.min(255, imgData[i + 2] + noise));
      }
      
      context.putImageData(imageData, 0, 0);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(6, 6);
      
      const groundRng = new SeededRandom(456 + Math.random() * 1000);
      geometry = new THREE.PlaneGeometry(90, 70, 150, 120);
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const height = (groundRng.next() - 0.5) * 0.12;
        positions.setZ(i, height);
      }
      geometry.computeVertexNormals();
      
      material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.9,
        metalness: 0.0,
        color: 0xb5e5b5
      });
    } else if (data.type === 'track' || data.type === 'track-curve' || data.type === 'track-curve-custom') {
      // Vytvoření textury cesty podle typu povrchu
      class SeededRandom {
        constructor(seed = 12345) {
          this.seed = seed;
        }
        next() {
          this.seed = (this.seed * 9301 + 49297) % 233280;
          return this.seed / 233280;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      const rng = new SeededRandom(123);
      
      // Základní barva a barvy částic podle typu povrchu
      const roadSurfaceType = data.roadSurface || 'tartan'; // Fallback na tartan pro staré uložené soubory
      let baseColor, particleColors, particleCount, particleSize;
      
      if (roadSurfaceType === 'tartan') {
        // Hnědočervená tartan dráha
        baseColor = '#b8442e';
        particleColors = ['#c5503a', '#a63e2e', '#b8442e', '#d15840', '#9a3626'];
        particleCount = 5000;
        particleSize = [0.5, 2];
      } else if (roadSurfaceType === 'asphalt') {
        // Tmavě šedý asfalt
        baseColor = '#333333';
        particleColors = ['#2a2a2a', '#3c3c3c', '#444444', '#282828', '#383838'];
        particleCount = 4000;
        particleSize = [0.3, 1.5];
      } else if (roadSurfaceType === 'gravel') {
        // Šedohnědý štěrk
        baseColor = '#8B7355';
        particleColors = ['#9a8164', '#7a6345', '#8B7355', '#b09470', '#6a533f'];
        particleCount = 6000;
        particleSize = [1, 3.5];
      } else if (roadSurfaceType === 'dirt') {
        // Hnědá bahnitá cesta
        baseColor = '#6B4423';
        particleColors = ['#7a5030', '#5c3a1f', '#6B4423', '#8a5f38', '#4d2f15'];
        particleCount = 4500;
        particleSize = [0.7, 2.5];
      }
      
      context.fillStyle = baseColor;
      context.fillRect(0, 0, 512, 512);
      
      // Přidání textury částic
      for (let i = 0; i < particleCount; i++) {
        const x = rng.next() * 512;
        const y = rng.next() * 512;
        const particleColor = particleColors[Math.floor(rng.next() * particleColors.length)];
        const size = particleSize[0] + rng.next() * (particleSize[1] - particleSize[0]);
        
        context.fillStyle = particleColor;
        context.fillRect(x, y, size, size);
      }
      
      // Bílé čáry pouze pro tartan
      if (roadSurfaceType === 'tartan') {
        context.strokeStyle = '#ffffff';
        context.lineWidth = 3;
        
        // Horizontální (podél dráhy) - 7 čar mezi 8 drahami
        for (let i = 1; i < 8; i++) {
          const y = (512 / 8) * i;
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(512, y);
          context.stroke();
        }
      }
      
      // Šum pro realističtější vzhled
      const imageData = context.getImageData(0, 0, 512, 512);
      const imgData = imageData.data;
      
      for (let i = 0; i < imgData.length; i += 4) {
        const noise = (rng.next() - 0.5) * 15;
        imgData[i] = Math.max(0, Math.min(255, imgData[i] + noise));
        imgData[i + 1] = Math.max(0, Math.min(255, imgData[i + 1] + noise));
        imgData[i + 2] = Math.max(0, Math.min(255, imgData[i + 2] + noise));
      }
      
      context.putImageData(imageData, 0, 0);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      if (data.type === 'track') {
        texture.repeat.set(2, 1);
        
        const trackRng = new SeededRandom(789 + Math.random() * 1000);
        geometry = new THREE.PlaneGeometry(data.size[0], data.size[1], 40, 40);
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const height = (trackRng.next() - 0.5) * 0.03;
          positions.setZ(i, height);
        }
        if (data.size[1] > 0 && Math.abs(data.trackSlopePercent || 0) > 0.0001) {
          const length = data.size[1];
          const totalDelta = (data.trackSlopePercent / 100) * length;
          for (let i = 0; i < positions.count; i++) {
            const localY = positions.getY(i);
            const progress = (localY + length / 2) / length;
            const heightOffset = (progress - 0.5) * totalDelta;
            positions.setZ(i, positions.getZ(i) + heightOffset);
          }
          positions.needsUpdate = true;
        }
        geometry.computeVertexNormals();
      } else if (data.type === 'track-curve-custom') {
        // Geometrie - zakřivený segment s libovolným úhlem (1-89°)
        const curveSegments = 40;
        const widthSegments = 40;
        const innerRadius = data.size[1];
        const outerRadius = innerRadius + data.size[0];
        const curveAngleDegrees = data.curveAngle || 45;
        const curveAngleRadians = (curveAngleDegrees * Math.PI) / 180;
        const middleRadius = (innerRadius + outerRadius) / 2;
        
        // Vypočítat střed oblouku pro vycentrování geometrie
        const centerAngle = curveAngleRadians / 2;
        const centerOffsetX = Math.cos(centerAngle) * middleRadius;
        const centerOffsetZ = Math.sin(centerAngle) * middleRadius;
        
        const arcLength = curveAngleRadians * middleRadius;
        texture.repeat.set(arcLength / 10, 1);
        
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
        
        const trackRng = new SeededRandom(789 + Math.random() * 1000);
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const height = (trackRng.next() - 0.5) * 0.03;
          positions.setY(i, positions.getY(i) + height);
        }
        geometry.computeVertexNormals();
      } else if (data.type === 'track-curve') {
        // Geometrie - zakřivený segment (90° oblouk)
        const curveSegments = 40;
        const widthSegments = 40;
        const innerRadius = data.size[1];
        const outerRadius = innerRadius + data.size[0];
        
        texture.repeat.set(Math.PI, 1);
        
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
        
        const trackRng = new SeededRandom(789 + Math.random() * 1000);
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const height = (trackRng.next() - 0.5) * 0.03;
          positions.setY(i, positions.getY(i) + height);
        }
        geometry.computeVertexNormals();
      }
      
      material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.8,
        metalness: 0.0,
        side: (data.type === 'track-curve' || data.type === 'track-curve-custom') ? THREE.DoubleSide : THREE.FrontSide
      });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (data.type === 'ground' || data.type === 'track' || data.type === 'track-curve' || data.type === 'track-curve-custom') {
      // Zemina a dráhy nemají hrany
    } else {
      // Přidání hran
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
      
      // Přidání oken pro boxy
      if (data.type === 'box' && data.withWindows) {
        addWindowsToMesh(mesh, data.size);
      }
    }
    
    mesh.userData = {
      type: data.type,
      size: data.size,
      color: data.color,
      material: data.material,
      withWindows: data.withWindows || false,
      roadSurface: data.roadSurface,
      trackSlopePercent: data.trackSlopePercent || 0,
      drawings: data.drawings || [],
      snapToTerrain: data.snapToTerrain ?? false,
      terrainOffset: typeof data.terrainOffset === 'number' ? data.terrainOffset : 0,
    };
    if (data.type === 'track-curve-custom' && typeof data.curveAngle === 'number') {
      mesh.userData.curveAngle = data.curveAngle;
    }
    if (data.type === 'track' || data.type === 'track-curve' || data.type === 'track-curve-custom') {
      if (data.trackEndpoints) {
        mesh.userData.trackEndpoints = {
          start: cloneEndpoint(data.trackEndpoints.start),
          end: cloneEndpoint(data.trackEndpoints.end)
        };
      } else {
        const endpoints = computeTrackEndpointsFromMesh(mesh);
        if (endpoints) {
          mesh.userData.trackEndpoints = {
            start: cloneEndpoint(endpoints.start),
            end: cloneEndpoint(endpoints.end)
          };
        }
      }
    }
    
    // Načíst kresby jako plane meshe
    if (data.drawings && data.drawings.length > 0 && data.type === 'box') {
      data.drawings.forEach(drawingData => {
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
        
        if (texture) {
          const planeGeometry = new THREE.PlaneGeometry(data.size[0], data.size[2]);
          const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: true
          });
          
          const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
          
          // Načíst pozici pokud existuje
          if (drawingData.position) {
            planeMesh.position.set(
              drawingData.position.x,
              data.size[1] / 2 + 0.01,
              drawingData.position.z
            );
          } else {
            planeMesh.position.y = data.size[1] / 2 + 0.01;
          }
          
          planeMesh.rotation.x = -Math.PI / 2;
          planeMesh.renderOrder = 999; // Vykreslit navrch přes průhledné objekty
          planeMesh.userData = {
            isDrawing: true,
            drawingId: drawingData.id,
            drawingType: drawingData.type,
            textureParams: drawingData.textureParams
          };
          
          mesh.add(planeMesh);
        }
      });
    }
    
    scene.add(mesh);
    placedBoxes.push(mesh);
  });
  
  return placedBoxes.length;
};

/**
 * Smaže všechny stavby ze scény
 * @param {THREE.Scene} scene - Three.js scéna
 * @param {Array} placedBoxes - Pole umístěných objektů
 * @param {Object} selectedObjectRef - Reference na vybraný objekt
 * @param {Function} setSelectedObject - State setter pro vybraný objekt
 */
export const clearAllBuildings = (scene, placedBoxes, selectedObjectRef, setSelectedObject, mapKey = 'cityBuildings') => {
  if (!window.confirm('Opravdu chceš smazat všechny objekty?')) return false;
  
  placedBoxes.forEach(box => {
    if (scene) scene.remove(box);
    disposeObject(box);
  });
  
  placedBoxes.length = 0;
  localStorage.removeItem(mapKey);
  
  if (selectedObjectRef.current) {
    selectedObjectRef.current = null;
    setSelectedObject(null);
  }
  
  return true;
};

/**
 * Vytvoří skutečný objekt a přidá ho do scény
 * @param {string} shape - Typ tvaru ('box' nebo 'cylinder')
 * @param {THREE.Vector3} position - Pozice objektu
 * @param {number} rotationY - Rotace kolem osy Y
 * @param {Array} size - Velikost objektu
 * @param {number} color - Barva objektu
 * @param {string} materialType - Typ materiálu
 * @param {boolean} addWindows - Zda přidat okna
 * @param {THREE.Scene} scene - Three.js scéna
 * @param {Array} placedBoxes - Pole umístěných objektů
 * @returns {THREE.Mesh} Vytvořený mesh
 */
export const createRealObject = (shape, position, rotationY, size, color, materialType, addWindows, scene, placedBoxes, roadSurface = 'tartan', extraOptions = {}) => {
  let geometry;
  let material;
  let mesh = null;
  let roadMetadata = null;
  
  if (shape === 'box') {
    geometry = new THREE.BoxGeometry(...size);
    material = createMaterial(materialType, color, false);
  } else if (shape === 'cylinder') {
    geometry = new THREE.CylinderGeometry(size[0], size[0], size[1], 32);
    material = createMaterial(materialType, color, false);
  } else if (shape === 'ground') {
    // Vytvoření grass textury pro zeminu
    class SeededRandom {
      constructor(seed = 12345) {
        this.seed = seed;
      }
      next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
      }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    const rng = new SeededRandom(42);
    
    context.fillStyle = '#4a7c26';
    context.fillRect(0, 0, 512, 512);
    
    const grassColors = ['#5d8f2f', '#6ba832', '#4a7c26', '#7da83f', '#3d6b1f'];
    
    for (let i = 0; i < 3000; i++) {
      const x = rng.next() * 512;
      const y = rng.next() * 512;
      const grassColor = grassColors[Math.floor(rng.next() * grassColors.length)];
      const length = 2 + rng.next() * 6;
      const width = 0.5 + rng.next() * 1.5;
      
      context.fillStyle = grassColor;
      context.fillRect(x, y, width, length);
      
      if (rng.next() > 0.7) {
        context.fillStyle = '#6ba832';
        context.fillRect(x + rng.next() * 2 - 1, y, 0.5, length * 0.7);
      }
    }
    
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (rng.next() - 0.5) * 20;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    context.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    
    const groundRng = new SeededRandom(456 + Math.random() * 1000);
    geometry = new THREE.PlaneGeometry(90, 70, 150, 120);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = (groundRng.next() - 0.5) * 0.12;
      positions.setZ(i, height);
    }
    geometry.computeVertexNormals();
    
    material = new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.9,
      metalness: 0.0,
      color: 0xb5e5b5
    });
  } else if (shape === 'track' || shape === 'track-curve' || shape === 'track-curve-custom') {
    // Vytvoření textury běžecké dráhy
    class SeededRandom {
      constructor(seed = 12345) {
        this.seed = seed;
      }
      next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
      }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    const rng = new SeededRandom(123);
    
    // Základní barva a barvy částic podle typu povrchu
    let baseColor, particleColors, particleCount, particleSize;
    
    if (roadSurface === 'tartan') {
      // Hnědočervená tartan dráha
      baseColor = '#b8442e';
      particleColors = ['#c5503a', '#a63e2e', '#b8442e', '#d15840', '#9a3626'];
      particleCount = 5000;
      particleSize = [0.5, 2];
    } else if (roadSurface === 'asphalt') {
      // Tmavě šedý asfalt
      baseColor = '#333333';
      particleColors = ['#2a2a2a', '#3c3c3c', '#444444', '#282828', '#383838'];
      particleCount = 4000;
      particleSize = [0.3, 1.5];
    } else if (roadSurface === 'gravel') {
      // Šedohnědý štěrk
      baseColor = '#8B7355';
      particleColors = ['#9a8164', '#7a6345', '#8B7355', '#b09470', '#6a533f'];
      particleCount = 6000;
      particleSize = [1, 3.5];
    } else if (roadSurface === 'dirt') {
      // Hnědá bahnitá cesta
      baseColor = '#6B4423';
      particleColors = ['#7a5030', '#5c3a1f', '#6B4423', '#8a5f38', '#4d2f15'];
      particleCount = 4500;
      particleSize = [0.7, 2.5];
    }
    
    context.fillStyle = baseColor;
    context.fillRect(0, 0, 512, 512);
    
    // Přidání textury částic
    for (let i = 0; i < particleCount; i++) {
      const x = rng.next() * 512;
      const y = rng.next() * 512;
      const particleColor = particleColors[Math.floor(rng.next() * particleColors.length)];
      const size = particleSize[0] + rng.next() * (particleSize[1] - particleSize[0]);
      
      context.fillStyle = particleColor;
      context.fillRect(x, y, size, size);
    }
    
    // Bílé čáry pouze pro tartan
    if (roadSurface === 'tartan') {
      context.strokeStyle = '#ffffff';
      context.lineWidth = 3;
      
      // Horizontální (podél dráhy) - 7 čar mezi 8 drahami
      for (let i = 1; i < 8; i++) {
        const y = (512 / 8) * i;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(512, y);
        context.stroke();
      }
    }
    
    // Šum pro realističtější vzhled
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (rng.next() - 0.5) * 15;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    context.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    if (shape === 'track') {
      // Geometrie - rovný segment dráhy
      geometry = new THREE.PlaneGeometry(size[0], size[1], 40, 40);
      texture.repeat.set(1, 2);
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI / 2;
    } else if (shape === 'track-curve-custom') {
      // Geometrie - zakřivený segment s libovolným úhlem (1-89°)
      const curveSegments = 40;
      const widthSegments = 40;
      const innerRadius = size[1];
      const outerRadius = innerRadius + size[0];
      const curveAngleDegrees = extraOptions.curveAngle || 45; // Úhel ve stupních
      const curveAngleRadians = (curveAngleDegrees * Math.PI) / 180; // Převod na radiány
      const middleRadius = (innerRadius + outerRadius) / 2;
      
      // Vypočítat střed oblouku pro vycentrování geometrie
      const centerAngle = curveAngleRadians / 2;
      const centerOffsetX = Math.cos(centerAngle) * middleRadius;
      const centerOffsetZ = Math.sin(centerAngle) * middleRadius;
      
      // Délka oblouku = curveAngleRadians * průměrný_poloměr
      const arcLength = curveAngleRadians * middleRadius;
      // Pro stejnou hustotu čar jako na rovné části
      texture.repeat.set(arcLength / 10, 1);
      
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
          // UV: u = pozice podél oblouku, v = pozice napříč šířkou
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
    } else {
      // Geometrie - zakřivený segment (90° oblouk) - původní track-curve
      const curveSegments = 40;
      const widthSegments = 40;
      const innerRadius = size[1];
      const outerRadius = innerRadius + size[0];
      
      // Délka oblouku = (PI/2) * průměrný_poloměr = (PI/2) * 10 ≈ 15.7
      // Pro stejnou hustotu čar jako na rovné části (10 délka, repeat 2)
      // zatáčka (15.7 délka) potřebuje repeat ≈ PI
      texture.repeat.set(Math.PI, 1);
      
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
    }
    
    // Mírné nerovnosti povrchu
    const trackRng = new SeededRandom(789 + Math.random() * 1000);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = (trackRng.next() - 0.5) * 0.03;
      if (shape === 'track') {
        // Pro rovnou dráhu (která se otočí X osou) měníme Z
        positions.setZ(i, positions.getZ(i) + height);
      } else {
        // Pro zatáčku (která je v XZ rovině) měníme Y
        positions.setY(i, positions.getY(i) + height);
      }
    }
    if (shape === 'track' && size[1] > 0 && Math.abs(extraOptions.trackSlopePercent || 0) > 0.0001) {
      const slopePercent = extraOptions.trackSlopePercent;
      const length = size[1];
      const totalDelta = (slopePercent / 100) * length;
      for (let i = 0; i < positions.count; i++) {
        const localY = positions.getY(i);
        const progress = (localY + length / 2) / length;
        const heightOffset = (progress - 0.5) * totalDelta;
        positions.setZ(i, positions.getZ(i) + heightOffset);
      }
      positions.needsUpdate = true;
    }
    geometry.computeVertexNormals();
    
    material = new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.8,
      metalness: 0.0,
      side: (shape === 'track-curve' || shape === 'track-curve-custom') ? THREE.DoubleSide : THREE.FrontSide
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
    
    material = createMaterial(materialType, color, false);
    material.side = THREE.DoubleSide;
  } else if (shape === 'door') {
    mesh = createDoorGroup({
      size,
      color,
      materialType,
      hinge: extraOptions.hinge,
      isOpen: extraOptions.isOpen
    });
  } else if (shape === 'road') {
    const pathPoints = extraOptions.pathPoints;
    const requestedWidth = extraOptions.roadWidth || size?.[0] || 6;
    const roadGeometry = buildRoadGeometry(pathPoints, requestedWidth);
    if (!roadGeometry) {
      console.warn('Road requires path points');
      return null;
    }
    material = createRoadMaterial(roadSurface || 'asphalt');
    mesh = new THREE.Mesh(roadGeometry.geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.position.copy(roadGeometry.center);
    mesh.rotation.x = 0;
    mesh.rotation.y = 0;
    mesh.userData = mesh.userData || {};
    mesh.userData.roadCenter = {
      x: roadGeometry.center.x,
      y: roadGeometry.center.y,
      z: roadGeometry.center.z
    };
    mesh.userData.roadTotalLength = roadGeometry.totalLength;
    roadMetadata = {
      width: requestedWidth,
      totalLength: roadGeometry.totalLength,
      pathPoints: Array.isArray(pathPoints) ? pathPoints : [],
    };
  }
  
  if (!mesh) {
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (shape === 'ground' || shape === 'track') {
      mesh.rotation.x = -Math.PI / 2;
    } else if (shape === 'track-curve' || shape === 'track-curve-custom' || shape === 'box-curve') {
      // Zatáčka je už vytvořená v XZ rovině, neotáčíme ji
    } else {
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
      
      if (shape === 'box' && addWindows) {
        addWindowsToMesh(mesh, size);
      }
    }
  }
  
  // Nastavení pozice a rotace
  if (shape !== 'road') {
    mesh.position.copy(position);
  }
  if (shape === 'ground') {
    // Ground zůstává na y=0
  } else if (shape === 'track') {
    // Rotace okolo vertikální osy (po položení na zem je to osa Z)
    mesh.rotation.z = rotationY;
  } else if (shape === 'track-curve' || shape === 'track-curve-custom') {
    // Rotace okolo vertikální osy Y (zatáčka je už v XZ rovině)
    mesh.rotation.y = rotationY;
  } else if (shape === 'box-curve') {
    // Box-curve - rotace okolo vertikální osy Y
    mesh.rotation.y = rotationY;
    // Posunout nahoru aby byl celý nad zemí
    mesh.position.y = size[2] / 2;
  } else if (shape === 'road') {
    // orientaci řešíme při tvorbě geometrie
  } else {
    mesh.rotation.y = rotationY;
  }
  
  if (!mesh.userData) {
    mesh.userData = {};
  }
  
  mesh.userData.type = shape;
  mesh.userData.size = shape === 'ground' ? [90, 70] : size;
  mesh.userData.color = color;
  mesh.userData.material = materialType;
  mesh.userData.withWindows = addWindows;
  if (shape === 'track' || shape === 'track-curve' || shape === 'track-curve-custom' || shape === 'road') {
    mesh.userData.roadSurface = roadSurface;
  } else {
    mesh.userData.roadSurface = undefined;
  }

  if (shape === 'road' && roadMetadata) {
    mesh.userData.size = [roadMetadata.width, roadMetadata.totalLength];
    mesh.userData.roadWidth = roadMetadata.width;
    mesh.userData.roadPath = roadMetadata.pathPoints.map((point) => ({
      x: point.x,
      y: point.y,
      z: point.z
    }));
  } else if (shape === 'track') {
    mesh.userData.roadWidth = undefined;
    mesh.userData.roadPath = undefined;
  }
  if (shape === 'track-curve-custom') {
    // Uložit úhel zatáčky pro custom zatáčku
    const curveAngleDegrees = extraOptions.curveAngle || 45;
    mesh.userData.curveAngle = curveAngleDegrees;
  }
  if (shape === 'track' || shape === 'track-curve' || shape === 'track-curve-custom') {
    const slopePercentValue = extraOptions.trackSlopePercent || 0;
    mesh.userData.trackSlopePercent = slopePercentValue;
    if (extraOptions.trackEndpoints) {
      const { start, end } = extraOptions.trackEndpoints;
      mesh.userData.trackEndpoints = {
        start: cloneEndpoint(start),
        end: cloneEndpoint(end),
      };
    } else {
      const endpoints = computeTrackEndpointsFromMesh(mesh);
      if (endpoints) {
        mesh.userData.trackEndpoints = {
          start: cloneEndpoint(endpoints.start),
          end: cloneEndpoint(endpoints.end),
        };
      } else {
        mesh.userData.trackEndpoints = undefined;
      }
    }
  } else {
    mesh.userData.trackSlopePercent = extraOptions.trackSlopePercent || 0;
    mesh.userData.trackEndpoints = undefined;
  }
  
  if (shape !== 'door') {
    mesh.userData.doorConfig = undefined;
  } else {
    mesh.userData.withWindows = false;
  }
  
  // Speciální logika pro track - rozpadnout zeminu pod ním PŘED přidáním
  if (shape === 'track' || shape === 'track-curve' || shape === 'track-curve-custom') {
    breakGroundUnderTrack(mesh, position, scene, placedBoxes);
  }
  
  scene.add(mesh);
  placedBoxes.push(mesh);
  saveBuildings(placedBoxes);
  return mesh;
};

/**
 * Rozpadne zeminu pod dráhou
 * @param {THREE.Mesh} trackMesh - Mesh dráhy
 * @param {THREE.Vector3} trackPosition - Pozice dráhy
 * @param {THREE.Scene} scene - Scéna
 * @param {Array} placedBoxes - Pole objektů
 */
const breakGroundUnderTrack = (trackMesh, trackPosition, scene, placedBoxes) => {
  let trackWidth, trackDepth;
  
  if (trackMesh.userData.type === 'track-curve') {
    // Pro zatáčku: size[0] = šířka, size[1] = poloměr
    // Celkový průměr = 2 * (vnitřní poloměr + šířka)
    const totalDiameter = 2 * (trackMesh.userData.size[1] + trackMesh.userData.size[0]);
    trackWidth = totalDiameter;
    trackDepth = totalDiameter;
  } else {
    // Pro rovnou cestu: size[0] = šířka, size[1] = délka
    trackWidth = trackMesh.userData.size[0];
    trackDepth = trackMesh.userData.size[1];
  }
  
  // Najít všechny grounds které se překrývají s trackem
  const groundsToBreak = [];
  
  for (let i = placedBoxes.length - 1; i >= 0; i--) {
    const obj = placedBoxes[i];
    
    // Kontrola jestli je to ground
    if (obj.userData && obj.userData.type === 'ground') {
      const groundWidth = 90;
      const groundDepth = 70;
      
      // Kontrola překrytí
      const dx = Math.abs(trackPosition.x - obj.position.x);
      const dz = Math.abs(trackPosition.z - obj.position.z);
      
      const overlapX = dx < (groundWidth / 2 + trackWidth / 2);
      const overlapZ = dz < (groundDepth / 2 + trackDepth / 2);
      
      if (overlapX && overlapZ) {
        groundsToBreak.push({ index: i, obj: obj });
      }
    }
  }
  
  // Pro každý ground co se překrývá, smazat ho
  for (const { index, obj } of groundsToBreak) {
    // Smazat z pole
    placedBoxes.splice(index, 1);
    
    // Dispose
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
    
    // Odstranit ze scény
    scene.remove(obj);
  }
};
