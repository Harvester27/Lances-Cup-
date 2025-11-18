// NPC.js - 3D postavy kolegů (zatím prázdné, připraveno na rozšíření)

import * as THREE from 'three';

export class NPC {
  constructor(scene, x, y, z, name, role, color = 0x3b82f6) {
    this.scene = scene;
    this.mesh = null;
    this.x = x;
    this.y = y;
    this.z = z;
    this.name = name;
    this.role = role;
    this.color = color;
  }

  create() {
    // Sem později přidáš vytvoření 3D NPC
  }

  update() {
    // Animace
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}
