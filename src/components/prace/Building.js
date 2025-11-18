// Building.js - 3D budova (zatím prázdné, připraveno na rozšíření)

import * as THREE from 'three';

export class Building {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
  }

  create() {
    // Sem později přidáš vytvoření 3D budovy
  }

  update() {
    // Animace nebo logika
  }

  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}
