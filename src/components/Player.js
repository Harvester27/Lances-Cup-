// Player.js - Nový First Person Controller s 3D postavou

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
    this.moveSpeed = 5;
    this.jumpPower = 7;
    this.gravity = -20;
    this.onGround = false;
    
    // Rotace (kam se díváš)
    this.yaw = 0;    // Otáčení doleva/doprava
    this.pitch = 0;  // Nahoru/dolů
    this.mouseSensitivity = 0.002;
  }

  create() {
    // ========== 3D POSTAVA ==========
    // Tělo (válec)
    const bodyGeometry = new THREE.CylinderGeometry(
      this.bodyRadius,    // radius nahoře
      this.bodyRadius,    // radius dole
      this.bodyHeight,    // výška
      16                   // segments
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,  // Zelená
      roughness: 0.7,
      metalness: 0.3
    });
    
    this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Nastav pozici
    this.mesh.position.copy(this.position);
    this.mesh.position.y += this.bodyHeight / 2; // Střed válce
    
    this.scene.add(this.mesh);
    
    console.log('✅ Player vytvořen na pozici:', this.position);
  }

  setCamera(camera) {
    this.camera = camera;
    this.updateCameraPosition();
    console.log('📷 Kamera připojena k hráči');
  }

  // Otáčení pohledu (myš)
  rotate(mouseX, mouseY) {
    this.yaw -= mouseX * this.mouseSensitivity;
    this.pitch -= mouseY * this.mouseSensitivity;
    
    // Omezení pitch (nemůžeš se dívat úplně nahoru/dolů)
    const maxPitch = Math.PI / 2 - 0.1;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  // Update každý frame
  update(keys, deltaTime = 0.016) {
    if (!this.camera) return;
    
    // ========== POHYB ==========
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    // Směr pohledu (bez pitch - jen horizontální)
    forward.set(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    );
    
    right.set(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );
    
    // Vstup z klávesnice
    const moveDir = new THREE.Vector3(0, 0, 0);
    
    if (keys['w']) moveDir.add(forward);
    if (keys['s']) moveDir.sub(forward);
    if (keys['d']) moveDir.add(right);
    if (keys['a']) moveDir.sub(right);
    
    // Normalizace (aby diagonální pohyb nebyl rychlejší)
    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.velocity.x = moveDir.x * this.moveSpeed;
      this.velocity.z = moveDir.z * this.moveSpeed;
    } else {
      // Zpomalení
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }
    
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
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // ========== KOLIZE S PODLAHOU ==========
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.onGround = true;
    }
    
    // ========== UPDATE MESHE ==========
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.position.y += this.bodyHeight / 2;
      
      // Otáčení těla podle směru pohybu
      if (this.velocity.x !== 0 || this.velocity.z !== 0) {
        this.mesh.rotation.y = this.yaw;
      }
    }
    
    // ========== UPDATE KAMERY ==========
    this.updateCameraPosition();
  }

  updateCameraPosition() {
    if (!this.camera) return;
    
    // Kamera je nad hlavou hráče
    this.camera.position.copy(this.position);
    this.camera.position.y += this.bodyHeight + 0.2; // Trochu nad hlavou
    
    // Rotace kamery
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}