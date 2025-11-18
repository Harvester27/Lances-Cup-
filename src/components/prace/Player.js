// Player.js - THIRD PERSON Controller (pohled shora/zezadu)

import * as THREE from 'three';

export class Player {
  constructor(scene, x = 0, y = 0, z = 0) {
    this.scene = scene;
    this.camera = null;
    
    // 3D postava (mesh)
    this.mesh = null;
    this.bodyHeight = 1.8;
    this.bodyRadius = 0.3;
    
    // Pozice
    this.position = new THREE.Vector3(x, y, z);
    
    // Pohyb
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.moveSpeed = 8;
    this.jumpPower = 7;
    this.gravity = -20;
    this.onGround = false;
    
    // Rotace postavy
    this.rotation = 0; // Kam se dívá postava
    this.targetRotation = 0; // Kam se má otočit
    
    // Kamera offset (kde je kamera vzhledem k hráči)
    this.cameraDistance = 8;
    this.cameraHeight = 5;
  }

  create() {
    // ========== 3D POSTAVA ==========
    // Tělo (válec)
    const bodyGeometry = new THREE.CylinderGeometry(
      this.bodyRadius,
      this.bodyRadius,
      this.bodyHeight,
      16
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,  // Zelená
      roughness: 0.7,
      metalness: 0.3
    });
    
    this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Přidat "hlavu" (koule nahoře) aby bylo vidět kam se dívá
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFEB3B,  // Žlutá hlava
      roughness: 0.5,
      metalness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = this.bodyHeight / 2 + 0.4;
    head.castShadow = true;
    this.mesh.add(head);
    
    // Přidat "nos" (malá červená koule) aby bylo vidět směr
    const noseGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0, 0.5);
    head.add(nose);
    
    // Nastav pozici
    this.mesh.position.copy(this.position);
    this.mesh.position.y += this.bodyHeight / 2;
    
    this.scene.add(this.mesh);
    
    console.log('✅ Player vytvořen (THIRD PERSON) na pozici:', this.position);
  }

  setCamera(camera) {
    this.camera = camera;
    this.updateCameraPosition();
    console.log('📷 Kamera připojena k hráči (THIRD PERSON VIEW)');
  }

  // Update každý frame
  update(keys, deltaTime = 0.016) {
    if (!this.camera) return;
    
    // 🔥 DEBUG - logovat každých 60 framů
    if (!this._frameCount) this._frameCount = 0;
    this._frameCount++;
    
    const shouldLog = this._frameCount % 30 === 0; // Log každých 30 framů
    
    if (shouldLog) {
      const activeKeys = Object.keys(keys).filter(k => keys[k]);
      console.log('🎮 PLAYER UPDATE - Aktivní klávesy:', activeKeys, '| keys:', keys);
      console.log('📍 Position:', this.position.x.toFixed(2), this.position.y.toFixed(2), this.position.z.toFixed(2));
      console.log('💨 Velocity:', this.velocity.x.toFixed(2), this.velocity.y.toFixed(2), this.velocity.z.toFixed(2));
    }
    
    // ========== POHYB ==========
    const moveDir = new THREE.Vector3(0, 0, 0);
    let isMoving = false;
    
    // WASD pohyb - relativní ke kameře
    if (keys['w']) { 
      moveDir.z -= 1; 
      isMoving = true; 
      if (shouldLog) console.log('⬆️ W stisknuto! moveDir.z =', moveDir.z); 
    }
    if (keys['s']) { 
      moveDir.z += 1; 
      isMoving = true; 
      if (shouldLog) console.log('⬇️ S stisknuto! moveDir.z =', moveDir.z); 
    }
    if (keys['a']) { 
      moveDir.x -= 1; 
      isMoving = true; 
      if (shouldLog) console.log('⬅️ A stisknuto! moveDir.x =', moveDir.x); 
    }
    if (keys['d']) { 
      moveDir.x += 1; 
      isMoving = true; 
      if (shouldLog) console.log('➡️ D stisknuto! moveDir.x =', moveDir.x); 
    }
    
    // Normalizace
    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.velocity.x = moveDir.x * this.moveSpeed;
      this.velocity.z = moveDir.z * this.moveSpeed;
      
      // Otočit postavu směrem pohybu
      this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
    } else {
      // Zpomalení
      this.velocity.x *= 0.85;
      this.velocity.z *= 0.85;
    }
    
    // Plynulé otáčení postavy
    let rotDiff = this.targetRotation - this.rotation;
    // Normalize angle difference
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    this.rotation += rotDiff * 0.15;
    
    // ========== SKOK ==========
    if (keys[' '] && this.onGround) {
      this.velocity.y = this.jumpPower;
      this.onGround = false;
    }
    
    // ========== GRAVITACE ==========
    if (!this.onGround) {
      this.velocity.y += this.gravity * deltaTime;
    }
    
    // ========== APLIKACE POHYBU ==========
    if (shouldLog && (this.velocity.x !== 0 || this.velocity.z !== 0)) {
      console.log('🚀 PŘED pohybem - pos:', this.position.x.toFixed(2), this.position.z.toFixed(2), '| vel:', this.velocity.x.toFixed(2), this.velocity.z.toFixed(2), '| deltaTime:', deltaTime.toFixed(3));
    }
    
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    if (shouldLog && (this.velocity.x !== 0 || this.velocity.z !== 0)) {
      console.log('🎯 PO pohybu - pos:', this.position.x.toFixed(2), this.position.z.toFixed(2));
    }
    
    // ========== KOLIZE S PODLAHOU ==========
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.onGround = true;
    }
    
    // ========== UPDATE MESHE ==========
    if (this.mesh) {
      const oldMeshPos = { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z };
      
      this.mesh.position.copy(this.position);
      this.mesh.position.y += this.bodyHeight / 2;
      this.mesh.rotation.y = this.rotation;
      
      if (shouldLog && (this.velocity.x !== 0 || this.velocity.z !== 0)) {
        console.log('🎭 MESH update - old:', oldMeshPos.x.toFixed(2), oldMeshPos.z.toFixed(2), '→ new:', this.mesh.position.x.toFixed(2), this.mesh.position.z.toFixed(2));
      }
    }
    
    // KAMERA SE UŽ NEUPDATE - je fixní v Prace.jsx!
  }

  updateCameraPosition() {
    if (!this.camera) return;
    
    // 🎥 FIXNÍ KAMERA - isometrický pohled
    // Kamera je na fixní pozici (10, 15, 10) a sleduje hráče
    this.camera.position.set(
      this.position.x + 10,
      15,
      this.position.z + 10
    );
    
    // Kamera se dívá na hráče
    const lookAtPoint = new THREE.Vector3(
      this.position.x,
      this.position.y + this.bodyHeight / 2,
      this.position.z
    );
    this.camera.lookAt(lookAtPoint);
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
