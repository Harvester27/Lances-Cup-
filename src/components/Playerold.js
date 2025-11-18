// Player.js - Hlavní třída hráče (spojuje všechny moduly)

import { PlayerPhysics } from './PlayerPhysics.js';
import { PlayerActions } from './PlayerActions.js';
import { PlayerStamina } from './PlayerStamina.js';
import { PlayerEmotions } from './PlayerEmotions.js';
import { PlayerRendering } from './PlayerRendering.js';
import { PlayerAttributes } from './PlayerAttributes.js';

export class Player {
  constructor(
    x, y, color, team, isControlled = false, 
    width, height, rinkPadding,
    name = '', level = null, isPlayer = false, 
    speedAttr = 5, accelerationAttr = 5
  ) {
    // Základní info
    this.color = color;
    this.team = team;
    this.isControlled = isControlled;
    
    // 🎯 MODULY - rozdělená funkcionalita
    this.physics = new PlayerPhysics(this);
    this.actions = new PlayerActions(this);
    this.stamina = new PlayerStamina(this);
    this.emotions = new PlayerEmotions(this);
    this.renderer = new PlayerRendering(this);
    this.attr = new PlayerAttributes(this);
    
    // Inicializace pozice
    this.physics.setPosition(x, y);
    this.physics.setRinkDimensions(width, height, rinkPadding);
    
    // Inicializace atributů
    this.attr.setInfo(name, level, isPlayer);
    this.attr.setAttributes({
      speed: speedAttr,
      acceleration: accelerationAttr
    });
    
    // Inicializace fyziky podle atributů
    const speedMultiplier = this.attr.getSpeedMultiplier();
    const accelMultiplier = this.attr.getAccelerationMultiplier();
    this.physics.initializePhysics(speedMultiplier, accelMultiplier);
    
    // Inicializace staminy
    this.stamina.initialize(speedAttr);
    
    // Legacy properties pro kompatibilitu (forward to modules)
    // Toto umožňuje starému kódu používat player.x místo player.physics.x
  }

  // ==========================================
  // LEGACY GETTERS/SETTERS pro kompatibilitu
  // ==========================================
  
  get x() { return this.physics.x; }
  set x(value) { this.physics.x = value; }
  
  get y() { return this.physics.y; }
  set y(value) { this.physics.y = value; }
  
  get vx() { return this.physics.vx; }
  set vx(value) { this.physics.vx = value; }
  
  get vy() { return this.physics.vy; }
  set vy(value) { this.physics.vy = value; }
  
  get radius() { return this.physics.radius; }
  
  get hasPuck() { return this.actions.hasPuck; }
  set hasPuck(value) { this.actions.hasPuck = value; }
  
  get isSprinting() { return this.physics.isSprinting; }
  get isBraking() { return this.physics.isBraking; }
  
  get playerState() { return this.emotions.playerState; }
  get faceExpression() { return this.emotions.faceExpression; }
  
  get isChargingShot() { return this.actions.isChargingShot; }
  get shotPower() { return this.actions.shotPower; }
  get mouseX() { return this.actions.mouseX; }
  get mouseY() { return this.actions.mouseY; }
  
  get isChargingCheck() { return this.actions.isChargingCheck; }
  get checkPower() { return this.actions.checkPower; }
  
  get isChargingPass() { return this.actions.isChargingPass; }
  get passTargetPlayer() { return this.actions.passTargetPlayer; }
  
  get currentStamina() { return this.stamina.currentStamina; }
  get maxStamina() { return this.stamina.maxStamina; }
  
  get name() { return this.attr.name; }
  get level() { return this.attr.level; }
  get isPlayer() { return this.attr.isPlayer; }
  get attributes() { return this.attr.attributes; }

  // ==========================================
  // HLAVNÍ METODY
  // ==========================================

  setAttributes(attributes) {
    this.attr.setAttributes(attributes);
    
    // Re-inicializace staminy podle nových atributů
    const staminaAttr = attributes.stamina || 5;
    this.stamina.initialize(staminaAttr);
  }

  // ==========================================
  // 🤖 OPRAVA: Update metoda funguje pro lidské I AI hráče
  // ==========================================
  update(keys, deltaTime = 1/60) {
    // ✅ VŽDY update cooldownů a timerů (pro všechny hráče!)
    this.actions.update(deltaTime);
    this.emotions.update(deltaTime);
    
    // Nemůžeš se pohybovat když jsi omráčený nebo na zemi
    if (!this.emotions.isActive()) {
      // Třecí síla při omráčení/pádu
      this.physics.vx *= 0.92;
      this.physics.vy *= 0.92;
      
      if (Math.abs(this.physics.vx) < 0.01) this.physics.vx = 0;
      if (Math.abs(this.physics.vy) < 0.01) this.physics.vy = 0;
      
      this.physics.x += this.physics.vx;
      this.physics.y += this.physics.vy;
      this.physics.handleBoundaryCollisions();
      return;
    }
    
    // ✅ Zpracuj input (pokud existuje)
    let inputX = 0;
    let inputY = 0;
    
    if (keys) {
      if (keys['ArrowUp'] || keys['KeyW']) inputY -= 1;
      if (keys['ArrowDown'] || keys['KeyS']) inputY += 1;
      if (keys['ArrowLeft'] || keys['KeyA']) inputX -= 1;
      if (keys['ArrowRight'] || keys['KeyD']) inputX += 1;
    }
    
    // Sprint logic
    const wantsToSprint = keys && (keys['ShiftLeft'] || keys['ShiftRight']);
    const isMoving = inputX !== 0 || inputY !== 0;
    
    let canSprint = false;
    if (wantsToSprint && this.stamina.canSprint()) {
      canSprint = true;
    }
    
    // Update staminy
    const staminaOk = this.stamina.update(isMoving, canSprint);
    if (!staminaOk) {
      canSprint = false;
    }
    
    // Update fyziky
    this.physics.update(inputX, inputY, canSprint, deltaTime);
  }

  draw(ctx, puck) {
    this.renderer.draw(ctx, puck);
  }

  // ==========================================
  // STŘELBA
  // ==========================================

  startChargingShot(mouseX, mouseY) {
    return this.actions.startChargingShot(mouseX, mouseY);
  }

  updateCharging(mouseX, mouseY, deltaTime) {
    this.actions.updateCharging(mouseX, mouseY, deltaTime);
  }

  releaseShot(puck) {
    return this.actions.releaseShot(puck);
  }

  cancelCharging() {
    this.actions.cancelCharging();
  }

  // ==========================================
  // BODČEKY
  // ==========================================

  startChargingCheck(mouseX, mouseY) {
    return this.actions.startChargingCheck(mouseX, mouseY);
  }

  updateChargingCheck(mouseX, mouseY, deltaTime) {
    this.actions.updateChargingCheck(mouseX, mouseY, deltaTime);
  }

  releaseCheck(players) {
    return this.actions.releaseCheck(players);
  }

  cancelChargingCheck() {
    this.actions.cancelChargingCheck();
  }

  // ==========================================
  // PŘIHRÁVKY
  // ==========================================

  startChargingPass(mouseX, mouseY, players) {
    return this.actions.startChargingPass(mouseX, mouseY, players);
  }

  updatePassTarget(mouseX, mouseY, players) {
    this.actions.updatePassTarget(mouseX, mouseY, players);
  }

  releasePass(puck) {
    return this.actions.releasePass(puck);
  }

  cancelChargingPass() {
    this.actions.cancelChargingPass();
  }

  // ==========================================
  // PUK
  // ==========================================

  holdPuck(puck) {
    this.actions.holdPuck(puck);
  }

  tryTakePuck(puck) {
    this.actions.tryTakePuck(puck);
  }

  shootPuck(puck) {
    this.actions.shootPuck(puck);
  }

  // ==========================================
  // KOLIZE
  // ==========================================

  checkPlayerCollision(otherPlayer) {
    const collisionResult = this.physics.checkPlayerCollision(otherPlayer);
    
    if (collisionResult && collisionResult.puckLoss) {
      return collisionResult.puckLoss;
    }
    
    return null;
  }

  checkGoalCollision(goalLineOffset, goalHeight, goalDepth, centerY) {
    const hitGoal = this.physics.checkGoalCollision(goalLineOffset, goalHeight, goalDepth, centerY);
    
    // Pokud hráč narazil do branky silně, ztratí puk
    if (hitGoal && this.hasPuck) {
      this.hasPuck = false;
    }
  }

  // ==========================================
  // UTILITY FUNKCE
  // ==========================================

  canSprint() {
    return this.stamina.canSprint();
  }

  isExhausted() {
    return this.stamina.isExhausted();
  }

  isWellRested() {
    return this.stamina.isWellRested();
  }
}
