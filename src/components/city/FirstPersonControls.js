import * as THREE from 'three';

/**
 * First Person Controls pro chůzi po mapě a rozhlížení myší
 */
export class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Nastavení
    this.moveSpeed = 0.15; // Rychlost pohybu
    this.lookSpeed = 0.002; // Citlivost myši
    this.height = 1.7; // Výška kamery (oči postavy)
    
    // Stav pohybu
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    
    // Rotace
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.PI_2 = Math.PI / 2;
    
    // Směrové vektory
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Stav myši
    this.isLocked = false;
    this.enabled = false; // Přidáno pro kontrolu, zda jsou controls aktivní
    
    // Bind metod
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onPointerLockError = this.onPointerLockError.bind(this);
  }
  
  connect() {
    if (this.enabled) return; // Již připojeno
    
    this.enabled = true;
    
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    this.domElement.addEventListener('click', this.onClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('pointerlockerror', this.onPointerLockError);
    
    // Automaticky požádat o pointer lock
    setTimeout(() => {
      if (this.enabled) {
        this.domElement.requestPointerLock();
      }
    }, 100);
    
    console.log('FirstPersonControls connected');
  }
  
  disconnect() {
    if (!this.enabled) return; // Již odpojeno
    
    this.enabled = false;
    
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    this.domElement.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('pointerlockerror', this.onPointerLockError);
    
    // Resetovat všechny pohybové stavy
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    
    if (this.isLocked) {
      document.exitPointerLock();
    }
    
    console.log('FirstPersonControls disconnected');
  }
  
  onClick() {
    if (!this.enabled) return;
    
    if (!this.isLocked) {
      this.domElement.requestPointerLock();
    }
  }
  
  onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
    console.log('Pointer lock:', this.isLocked);
  }
  
  onPointerLockError() {
    console.error('Pointer lock error');
  }
  
  onMouseMove(event) {
    if (!this.enabled || !this.isLocked) return;
    
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    
    this.euler.setFromQuaternion(this.camera.quaternion);
    
    this.euler.y -= movementX * this.lookSpeed;
    this.euler.x -= movementY * this.lookSpeed;
    
    // Omezení vertikální rotace (aby se nemohla kamera překlopit úplně)
    this.euler.x = Math.max(-this.PI_2 + 0.01, Math.min(this.PI_2 - 0.01, this.euler.x));
    
    this.camera.quaternion.setFromEuler(this.euler);
  }
  
  onKeyDown(event) {
    if (!this.enabled) return;
    
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'Space':
        this.moveUp = true;
        event.preventDefault(); // Zabránit scrollování stránky
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveDown = true;
        break;
    }
  }
  
  onKeyUp(event) {
    if (!this.enabled) return;
    
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'Space':
        this.moveUp = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveDown = false;
        break;
    }
  }
  
  update() {
    if (!this.enabled) return;
    
    // Reset rychlosti
    this.velocity.x = 0;
    this.velocity.z = 0;
    this.velocity.y = 0;
    
    // Směr pohledu kamery
    this.direction.set(0, 0, -1);
    this.direction.applyQuaternion(this.camera.quaternion);
    this.direction.y = 0; // Ignorovat vertikální složku pro pohyb
    this.direction.normalize();
    
    // Dopředu/dozadu
    if (this.moveForward) {
      this.velocity.add(this.direction.clone().multiplyScalar(this.moveSpeed));
    }
    if (this.moveBackward) {
      this.velocity.add(this.direction.clone().multiplyScalar(-this.moveSpeed));
    }
    
    // Doleva/doprava (strafe)
    const right = new THREE.Vector3();
    right.crossVectors(this.direction, new THREE.Vector3(0, 1, 0)).normalize();
    
    if (this.moveLeft) {
      this.velocity.add(right.clone().multiplyScalar(-this.moveSpeed));
    }
    if (this.moveRight) {
      this.velocity.add(right.clone().multiplyScalar(this.moveSpeed));
    }
    
    // Nahoru/dolů
    if (this.moveUp) {
      this.velocity.y += this.moveSpeed;
    }
    if (this.moveDown) {
      this.velocity.y -= this.moveSpeed;
    }
    
    // Aplikovat pohyb
    this.camera.position.add(this.velocity);
    
    // Zajistit minimální výšku (jen pokud nehýbeme nahoru/dolů manuálně)
    if (!this.moveUp && !this.moveDown) {
      this.camera.position.y = Math.max(this.height, this.camera.position.y);
    }
  }
  
  dispose() {
    this.disconnect();
  }
}
