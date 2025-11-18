// Player.js - 3D postava hráče (připraveno na rozšíření)

import * as THREE from 'three';

export class Player3D {
  constructor(scene, x = 0, y = 0, z = 0) {
    this.scene = scene;
    this.mesh = null;
    this.x = x;
    this.y = y;
    this.z = z;
    this.speed = 0.1;
    
    this.createPlayer();
  }

  createPlayer() {
    // Jednoduchá postava jako skupina objektů
    const group = new THREE.Group();
    
    // Tělo (kvádr)
    const bodyGeometry = new THREE.BoxGeometry(0.5, 1, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);
    
    // Hlava (koule)
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.25;
    head.castShadow = true;
    group.add(head);
    
    group.position.set(this.x, this.y, this.z);
    this.mesh = group;
    this.scene.add(group);
  }

  update(keys) {
    if (!this.mesh) return;
    
    // Pohyb - WASD
    if (keys['w'] || keys['W']) {
      this.mesh.position.z -= this.speed;
    }
    if (keys['s'] || keys['S']) {
      this.mesh.position.z += this.speed;
    }
    if (keys['a'] || keys['A']) {
      this.mesh.position.x -= this.speed;
    }
    if (keys['d'] || keys['D']) {
      this.mesh.position.x += this.speed;
    }
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}
