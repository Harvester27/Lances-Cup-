// src/FieldUtils.js
import { THREE } from './three.js';

// Použijeme seedovaný random generátor pro konzistentní trávu
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export const FieldUtils = {
  createField(scene) {
    // Vytvoření grass textury se seedovaným randomem
    const createGrassTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      // Seedovaný random pro konzistentní texturu
      const rng = new SeededRandom(42);
      
      context.fillStyle = '#2d5016';
      context.fillRect(0, 0, 512, 512);
      
      const grassColors = ['#3d6b1f', '#4a7c26', '#2a4d14', '#5d8f2f', '#1e3d0c'];
      
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
      
      // Aplikuj šum se seedovaným randomem
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
      texture.repeat.set(8, 8);
      
      return texture;
    };

    const grassTexture = createGrassTexture();
    const fieldMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture,
      roughness: 0.9,
      metalness: 0.0
    });

    // Okolní trávník - používáme seedovaný random pro výšku
    const surroundingRng = new SeededRandom(123);
    const surroundingGeometry = new THREE.PlaneGeometry(80, 60, 200, 200);
    const surroundingPositions = surroundingGeometry.attributes.position;
    for (let i = 0; i < surroundingPositions.count; i++) {
      const height = (surroundingRng.next() - 0.5) * 0.15;
      surroundingPositions.setZ(i, height);
    }
    surroundingGeometry.computeVertexNormals();
    
    const surroundingField = new THREE.Mesh(surroundingGeometry, fieldMaterial);
    surroundingField.rotation.x = -Math.PI / 2;
    surroundingField.receiveShadow = true;
    surroundingField.position.y = -0.01;
    scene.add(surroundingField);

    // Hrací plocha - používáme seedovaný random
    const fieldRng = new SeededRandom(456);
    const fieldGeometry = new THREE.PlaneGeometry(40, 26, 100, 100);
    const positions = fieldGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = (fieldRng.next() - 0.5) * 0.1;
      positions.setZ(i, height);
    }
    fieldGeometry.computeVertexNormals();
    
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    scene.add(field);

    // Pruhy na trávníku
    const stripeMaterial = new THREE.MeshStandardMaterial({ 
      map: grassTexture,
      roughness: 0.9,
      metalness: 0.0,
      color: 0x9fdf9f
    });

    const stripeRng = new SeededRandom(789);
    const stripeGeometry = new THREE.PlaneGeometry(4, 26, 50, 50);
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
      scene.add(stripe);
    }

    // Stébla trávy - používáme seedovaný random pro pozice
    const grassBladeRng = new SeededRandom(999);
    const grassBladeGeometry = new THREE.ConeGeometry(0.02, 0.3, 3);
    const grassBladeMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a7c26,
      roughness: 0.8
    });

    // Vytvoříme instanced mesh pro lepší výkon
    const grassCount = 800;
    const grassMesh = new THREE.InstancedMesh(grassBladeGeometry, grassBladeMaterial, grassCount);
    grassMesh.castShadow = true;
    grassMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < grassCount; i++) {
      dummy.position.set(
        (grassBladeRng.next() - 0.5) * 75,
        0.15,
        (grassBladeRng.next() - 0.5) * 55
      );
      dummy.rotation.z = (grassBladeRng.next() - 0.5) * 0.3;
      dummy.scale.y = 0.5 + grassBladeRng.next() * 0.8;
      dummy.updateMatrix();
      grassMesh.setMatrixAt(i, dummy.matrix);
    }
    grassMesh.instanceMatrix.needsUpdate = true;
    scene.add(grassMesh);
  },

  createFieldLines(scene) {
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
  },

  createGoals(scene) {
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
  }
};