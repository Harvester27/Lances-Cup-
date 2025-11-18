// PlayerStamina.js - Systém staminy

export class PlayerStamina {
  constructor(player) {
    this.player = player;
    
    // Stamina
    this.maxStamina = 100;
    this.currentStamina = 100;
    this.staminaRegenRate = 0.10;
    this.staminaDepletionRate = 0.55;
  }

  // Inicializace staminy na základě atributů
  initialize(staminaAttr) {
    this.maxStamina = 70 + (staminaAttr * 6);
    this.currentStamina = this.maxStamina;
    this.staminaRegenRate = 0.10 + (staminaAttr / 10) * 0.25;
    this.staminaDepletionRate = 0.55 - (staminaAttr / 10) * 0.30;
  }

  // Update staminy během hry
  update(isMoving, isSprinting) {
    if (isSprinting && isMoving) {
      this.currentStamina -= this.staminaDepletionRate;
      
      if (this.currentStamina <= 0) {
        this.currentStamina = 0;
        return false; // Nemůže sprintovat
      }
    } else {
      this.currentStamina += this.staminaRegenRate;
      this.currentStamina = Math.min(this.currentStamina, this.maxStamina);
    }
    
    return true;
  }

  // Spotřebování staminy (pro akce jako bodčeky)
  consume(amount) {
    this.currentStamina -= amount;
    if (this.currentStamina < 0) this.currentStamina = 0;
  }

  // Kontroly
  canSprint() {
    return this.currentStamina > 10;
  }

  hasEnoughFor(amount) {
    return this.currentStamina >= amount;
  }

  isExhausted() {
    return this.currentStamina < 20;
  }

  isWellRested() {
    return this.currentStamina > 80;
  }

  getPercent() {
    return this.currentStamina / this.maxStamina;
  }

  getColor() {
    const percent = this.getPercent();
    if (percent > 0.6) return '#22c55e'; // Zelená
    if (percent > 0.3) return '#eab308'; // Žlutá
    return '#ef4444'; // Červená
  }
}
