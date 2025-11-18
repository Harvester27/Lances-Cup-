// Forklift.js - 3D ještěrka (zatím prázdné, připraveno na rozšíření)

import * as THREE from 'three';

export class Forklift {
  constructor(scene, x = 0, y = 0, z = 0) {
    this.scene = scene;
    this.mesh = null;
    this.x = x;
    this.y = y;
    this.z = z;
    this.hasPallet = false;
  }

  create() {
    // Sem později přidáš vytvoření 3D ještěrky
  }

  update(keys) {
    // Logika jízdy
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}
