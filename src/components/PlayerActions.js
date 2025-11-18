// PlayerActions.js - Akce hráče (střelba, přihrávky, bodčeky, držení puku)

export class PlayerActions {
  constructor(player) {
    this.player = player;
    
    // Držení puku
    this.hasPuck = false;
    this.puckDistance = 25;
    this.pickupCooldown = 0;
    this.pickupCooldownDuration = 0.3;
    
    // 🎯 STŘELBA
    this.isChargingShot = false;
    this.shotPower = 0;
    this.shotChargeRate = 40;
    this.maxShotPower = 100;
    this.shotMouseX = 0;
    this.shotMouseY = 0;
    
    // 🥊 BODČEKY
    this.isChargingCheck = false;
    this.checkPower = 0;
    this.checkChargeRate = 40;
    this.maxCheckPower = 100;
    this.checkMouseX = 0;
    this.checkMouseY = 0;
    this.checkCooldown = 0;
    this.checkCooldownDuration = 1.0;
    
    // 🚨 FAULY SYSTÉM
    this.checksHistory = []; // Historie bodčeků (timestamp, síla)
    this.foulWarnings = 0;
    this.totalFouls = 0;
    
    // 🎯 PŘIHRÁVKY
    this.isChargingPass = false;
    this.passTargetPlayer = null;
    this.passCooldown = 0;
    this.passCooldownDuration = 0.5;
    this.passMouseX = 0;
    this.passMouseY = 0;
    
    // Legacy (pro kompatibilitu)
    this.mouseX = 0;
    this.mouseY = 0;
  }

  update(deltaTime) {
    // Snižuj cooldowny
    if (this.pickupCooldown > 0) {
      this.pickupCooldown -= deltaTime;
      if (this.pickupCooldown < 0) this.pickupCooldown = 0;
    }
    
    if (this.checkCooldown > 0) {
      this.checkCooldown -= deltaTime;
      if (this.checkCooldown < 0) this.checkCooldown = 0;
    }
    
    if (this.passCooldown > 0) {
      this.passCooldown -= deltaTime;
      if (this.passCooldown < 0) this.passCooldown = 0;
    }
    
    // Čištění staré historie bodčeků (starší než 30 sekund)
    const now = Date.now();
    this.checksHistory = this.checksHistory.filter(check => 
      now - check.timestamp < 30000
    );
  }

  // ==========================================
  // 🎯 STŘELBA
  // ==========================================

  startChargingShot(mouseX, mouseY) {
    if (!this.hasPuck) return false;
    
    this.isChargingShot = true;
    this.shotPower = 0;
    this.shotMouseX = mouseX;
    this.shotMouseY = mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    return true;
  }

  updateCharging(mouseX, mouseY, deltaTime) {
    if (!this.isChargingShot) return;
    
    this.shotMouseX = mouseX;
    this.shotMouseY = mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    
    this.shotPower += this.shotChargeRate * deltaTime;
    this.shotPower = Math.min(this.shotPower, this.maxShotPower);
  }

  isAimingBackwards() {
    const aimDx = this.shotMouseX - this.player.physics.x;
    const aimDy = this.shotMouseY - this.player.physics.y;
    const aimAngle = Math.atan2(aimDy, aimDx);
    
    const speed = this.player.physics.getSpeed();
    
    if (speed < 0.3) {
      return false; // Hráč stojí - povoleno
    }
    
    const movementAngle = this.player.physics.getAngle();
    
    let angleDiff = aimAngle - movementAngle;
    
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    const angleDiffDegrees = Math.abs(angleDiff) * 180 / Math.PI;
    const threshold = 135;
    
    return angleDiffDegrees > threshold;
  }

  releaseShot(puck) {
    if (!this.isChargingShot || !this.hasPuck) {
      return false;
    }
    
    if (this.isAimingBackwards()) {
      this.isChargingShot = false;
      this.shotPower = 0;
      return false;
    }
    
    this.isChargingShot = false;
    this.hasPuck = false;
    
    const dx = this.mouseX - this.player.physics.x;
    const dy = this.mouseY - this.player.physics.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return false;
    }
    
    const shootingAttr = this.player.attr.get('shooting');
    const minPower = 3;
    const maxPower = 8 + (shootingAttr / 10) * 4;
    let shotSpeed = minPower + (this.shotPower / 100) * (maxPower - minPower);
    
    const levelMultiplier = this.player.attr.getLevelMultiplier();
    shotSpeed *= levelMultiplier;
    
    puck.vx = (dx / distance) * shotSpeed;
    puck.vy = (dy / distance) * shotSpeed;
    
    this.shotPower = 0;
    this.pickupCooldown = this.pickupCooldownDuration;
    
    return true;
  }

  cancelCharging() {
    this.isChargingShot = false;
    this.shotPower = 0;
  }

  // ==========================================
  // 🥊 BODČEKY
  // ==========================================

  startChargingCheck(mouseX, mouseY) {
    if (this.checkCooldown > 0) return false;
    if (!this.player.stamina.hasEnoughFor(15)) return false;
    
    this.isChargingCheck = true;
    this.checkPower = 0;
    this.checkMouseX = mouseX;
    this.checkMouseY = mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    
    this.player.emotions.setExpression('aggressive');
    
    return true;
  }

  updateChargingCheck(mouseX, mouseY, deltaTime) {
    if (!this.isChargingCheck) return;
    
    this.checkMouseX = mouseX;
    this.checkMouseY = mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    
    this.checkPower += this.checkChargeRate * deltaTime;
    this.checkPower = Math.min(this.checkPower, this.maxCheckPower);
  }

  releaseCheck(players) {
    if (!this.isChargingCheck) return { success: false };
    
    this.isChargingCheck = false;
    
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    // 🎯 HLEDÁME JAKÉHOKOLIV NEPŘÍTELE (ne jen s pukem)
    players.forEach(player => {
      if (player.team !== this.player.team && player !== this.player && player.emotions.canBeChecked) {
        const dx = player.physics.x - this.player.physics.x;
        const dy = player.physics.y - this.player.physics.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEnemy = player;
        }
      }
    });
    
    // 🎯 VĚTŠÍ DOSAH PRO BODČEK - 4x poloměr místo 3x
    if (!nearestEnemy || nearestDistance > this.player.physics.radius * 4) {
      this.checkPower = 0;
      this.player.emotions.setExpression('normal');
      return { success: false, reason: 'no_target' };
    }
    
    const result = this.performChargedCheck(nearestEnemy);
    this.checkPower = 0;
    
    return result;
  }

  cancelChargingCheck() {
    this.isChargingCheck = false;
    this.checkPower = 0;
    this.player.emotions.setExpression('normal');
  }

  performChargedCheck(targetPlayer) {
    if (this.checkCooldown > 0) {
      return { success: false, reason: 'cooldown' };
    }
    
    if (!this.player.stamina.hasEnoughFor(15)) {
      return { success: false, reason: 'tired' };
    }
    
    if (!targetPlayer.emotions.canBeChecked) {
      return { success: false, reason: 'invalid_target' };
    }
    
    const dx = targetPlayer.physics.x - this.player.physics.x;
    const dy = targetPlayer.physics.y - this.player.physics.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 🎯 VĚTŠÍ DOSAH
    if (distance > this.player.physics.radius * 4) {
      return { success: false, reason: 'too_far' };
    }
    
    this.player.stamina.consume(15);
    this.checkCooldown = this.checkCooldownDuration;
    
    this.player.emotions.startCheckAnimation(Math.atan2(dy, dx));
    
    // Výpočet síly bodčeku
    const attackerStrength = this.player.attr.get('strength');
    const defenderStrength = targetPlayer.attr.get('strength');
    const attackerWeight = this.player.attr.get('weight');
    const defenderWeight = targetPlayer.attr.get('weight');
    const attackerChecking = this.player.attr.get('checking');
    
    const attackerSpeed = this.player.physics.getSpeed();
    const defenderSpeed = targetPlayer.physics.getSpeed();
    
    const approachAngle = Math.atan2(dy, dx);
    const attackerAngle = this.player.physics.getAngle();
    let angleDiff = Math.abs(approachAngle - attackerAngle);
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
    const angleBonus = 1 - (angleDiff / Math.PI) * 0.3;
    
    const chargingMultiplier = 1 + (this.checkPower / 100) * 0.5;
    
    let attackPower = 
      attackerStrength * 2 +
      attackerWeight / 10 +
      attackerChecking * 1.5 +
      attackerSpeed * 15 +
      this.player.attr.level * 0.1;
    
    attackPower *= angleBonus;
    attackPower *= chargingMultiplier;
    
    let defensePower = 
      defenderStrength * 2 +
      defenderWeight / 10 +
      defenderSpeed * 5 +
      targetPlayer.attr.level * 0.1;
    
    const powerDifference = attackPower - defensePower;
    
    let checkType;
    let impactForce;
    
    if (powerDifference > 30) {
      checkType = 'perfect_hit';
      impactForce = 8;
    } else if (powerDifference > 20) {
      checkType = 'heavy_hit';
      impactForce = 6;
    } else if (powerDifference > 12) {
      checkType = 'solid_check';
      impactForce = 5;
    } else if (powerDifference > 6) {
      checkType = 'good_check';
      impactForce = 4;
    } else if (powerDifference > 0) {
      checkType = 'light_check';
      impactForce = 3;
    } else if (powerDifference > -6) {
      checkType = 'bounce_off';
      impactForce = 2;
    } else if (powerDifference > -12) {
      checkType = 'failed_check';
      impactForce = 2;
    } else if (powerDifference > -20) {
      checkType = 'counter_check';
      impactForce = 4;
    } else if (powerDifference > -30) {
      checkType = 'destroyed';
      impactForce = 6;
    } else {
      checkType = 'wall_hit';
      impactForce = 7;
    }
    
    // 🚨 DETEKCE FAULŮ
    const now = Date.now();
    this.checksHistory.push({
      timestamp: now,
      force: impactForce,
      type: checkType,
      target: targetPlayer.attr.name
    });
    
    const foulResult = this.checkForFoul(checkType, impactForce);
    
    console.log('🥊 CHARGED CHECK:', {
      attacker: this.player.attr.name,
      attackPower: attackPower.toFixed(1),
      checkPower: this.checkPower.toFixed(0) + '%',
      chargingBonus: ((chargingMultiplier - 1) * 100).toFixed(0) + '%',
      defender: targetPlayer.attr.name,
      defensePower: defensePower.toFixed(1),
      difference: powerDifference.toFixed(1),
      checkType: checkType,
      foul: foulResult ? '🚨 FAUL!' : '✅ OK'
    });
    
    this.applyCheckResult(targetPlayer, checkType, impactForce, dx, dy, distance);
    
    return { 
      success: true, 
      checkType, 
      impactForce,
      powerDifference,
      checkPower: this.checkPower,
      foul: foulResult
    };
  }
  
  // 🚨 DETEKCE FAULŮ
  checkForFoul(checkType, impactForce) {
    const now = Date.now();
    
    // Velmi silný bodček = automatický faul
    if (checkType === 'perfect_hit' || checkType === 'heavy_hit') {
      if (impactForce >= 7) {
        this.totalFouls++;
        return {
          type: 'excessive_force',
          severity: 'major',
          message: '🚨 FAUL - Příliš tvrdý zákrok!'
        };
      }
    }
    
    // Počet bodčeků za posledních 10 sekund
    const recentChecks = this.checksHistory.filter(check => 
      now - check.timestamp < 10000
    );
    
    if (recentChecks.length >= 4) {
      this.foulWarnings++;
      
      if (this.foulWarnings >= 2) {
        this.totalFouls++;
        this.foulWarnings = 0;
        return {
          type: 'repeated_checking',
          severity: 'minor',
          message: '🚨 FAUL - Časté bodčeky!'
        };
      } else {
        return {
          type: 'warning',
          severity: 'warning',
          message: '⚠️ VAROVÁNÍ - Zpomalte s bodčeky!'
        };
      }
    }
    
    return null;
  }

  applyCheckResult(target, checkType, impactForce, dx, dy, distance) {
    const nx = dx / distance;
    const ny = dy / distance;
    
    console.log('💥 CHECK TYPE:', checkType.toUpperCase());
    
    this.player.emotions.setExpression('aggressive', 500);
    
    switch(checkType) {
      case 'perfect_hit':
        target.emotions.setState('knocked_down', 3.0);
        target.physics.vx = nx * impactForce;
        target.physics.vy = ny * impactForce;
        if (target.actions.hasPuck) {
          target.actions.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: nx * 5, vy: ny * 5 }};
        }
        break;
        
      case 'heavy_hit':
        target.emotions.setState('knocked_down', 2.0);
        target.physics.vx = nx * impactForce;
        target.physics.vy = ny * impactForce;
        if (target.actions.hasPuck) {
          target.actions.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: nx * 4, vy: ny * 4 }};
        }
        break;
        
      case 'solid_check':
        target.emotions.setState('stunned', 1.5);
        target.physics.vx = nx * impactForce;
        target.physics.vy = ny * impactForce;
        if (target.actions.hasPuck) {
          target.actions.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: nx * 3.5, vy: ny * 3.5 }};
        }
        break;
        
      case 'good_check':
        target.emotions.setState('stunned', 1.0);
        target.physics.vx = nx * impactForce;
        target.physics.vy = ny * impactForce;
        if (target.actions.hasPuck && Math.random() < 0.8) {
          target.actions.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: nx * 3, vy: ny * 3 }};
        }
        break;
        
      case 'light_check':
        target.physics.vx = nx * impactForce;
        target.physics.vy = ny * impactForce;
        if (target.actions.hasPuck && Math.random() < 0.5) {
          target.actions.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: nx * 2.5, vy: ny * 2.5 }};
        }
        break;
        
      case 'bounce_off':
        target.physics.vx = nx * impactForce;
        target.physics.vy = ny * impactForce;
        this.player.physics.vx = -nx * impactForce * 0.8;
        this.player.physics.vy = -ny * impactForce * 0.8;
        break;
        
      case 'failed_check':
        this.player.physics.vx = -nx * impactForce;
        this.player.physics.vy = -ny * impactForce;
        target.physics.vx = nx * (impactForce * 0.5);
        target.physics.vy = ny * (impactForce * 0.5);
        break;
        
      case 'counter_check':
        this.player.emotions.setState('stunned', 1.5);
        this.player.physics.vx = -nx * impactForce;
        this.player.physics.vy = -ny * impactForce;
        if (this.hasPuck) {
          this.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: -nx * 3, vy: -ny * 3 }};
        }
        break;
        
      case 'destroyed':
        this.player.emotions.setState('knocked_down', 2.5);
        this.player.physics.vx = -nx * impactForce;
        this.player.physics.vy = -ny * impactForce;
        if (this.hasPuck) {
          this.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: -nx * 4, vy: -ny * 4 }};
        }
        break;
        
      case 'wall_hit':
        this.player.emotions.setState('knocked_down', 2.0);
        this.player.physics.vx = -nx * impactForce;
        this.player.physics.vy = -ny * impactForce;
        if (this.hasPuck) {
          this.hasPuck = false;
          return { lostPuck: true, puckVelocity: { vx: -nx * 3.5, vy: -ny * 3.5 }};
        }
        break;
    }
    
    return null;
  }

  // ==========================================
  // 🎯 PŘIHRÁVKY
  // ==========================================

  startChargingPass(mouseX, mouseY, players) {
    if (!this.hasPuck) return false;
    if (this.passCooldown > 0) return false;
    
    this.isChargingPass = true;
    this.passMouseX = mouseX;
    this.passMouseY = mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    
    this.updatePassTarget(mouseX, mouseY, players);
    
    return true;
  }

  updatePassTarget(mouseX, mouseY, players) {
    if (!this.isChargingPass) return;
    
    this.passMouseX = mouseX;
    this.passMouseY = mouseY;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    
    let closestTeammate = null;
    let closestDistance = Infinity;
    
    players.forEach(player => {
      if (player.team === this.player.team && player !== this.player) {
        const dx = player.physics.x - mouseX;
        const dy = player.physics.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTeammate = player;
        }
      }
    });
    
    this.passTargetPlayer = closestTeammate;
  }

  releasePass(puck) {
    if (!this.isChargingPass || !this.hasPuck) {
      this.isChargingPass = false;
      this.passTargetPlayer = null;
      return false;
    }
    
    if (!this.passTargetPlayer) {
      this.isChargingPass = false;
      this.passTargetPlayer = null;
      return false;
    }
    
    this.isChargingPass = false;
    this.hasPuck = false;
    this.passCooldown = this.passCooldownDuration;
    
    const passAccuracy = this.player.attr.getPassAccuracy();
    
    const targetX = this.passTargetPlayer.physics.x;
    const targetY = this.passTargetPlayer.physics.y;
    const dx = targetX - this.player.physics.x;
    const dy = targetY - this.player.physics.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      this.passTargetPlayer = null;
      return false;
    }
    
    const maxDeviationAngle = (1.5 - passAccuracy) * 0.3;
    const deviationAngle = (Math.random() - 0.5) * maxDeviationAngle;
    
    const baseAngle = Math.atan2(dy, dx);
    const actualAngle = baseAngle + deviationAngle;
    
    const idealSpeed = Math.min(3 + distance / 100, 6);
    const speedVariance = (1.5 - passAccuracy) * 0.3;
    const speedMultiplier = 1 + (Math.random() - 0.5) * speedVariance;
    const actualSpeed = idealSpeed * speedMultiplier;
    
    puck.vx = Math.cos(actualAngle) * actualSpeed;
    puck.vy = Math.sin(actualAngle) * actualSpeed;
    
    console.log('🎯 PASS:', {
      passing: this.player.attr.get('passing'),
      accuracy: passAccuracy.toFixed(2),
      deviation: (deviationAngle * 180 / Math.PI).toFixed(1) + '°',
      speed: actualSpeed.toFixed(2),
      target: this.passTargetPlayer.attr.name
    });
    
    this.passTargetPlayer = null;
    this.pickupCooldown = this.pickupCooldownDuration;
    
    return true;
  }

  cancelChargingPass() {
    this.isChargingPass = false;
    this.passTargetPlayer = null;
  }

  // ==========================================
  // 🏒 DRŽENÍ A SEBRÁNÍ PUKU
  // ==========================================

  holdPuck(puck) {
    this.hasPuck = true;
    
    const angle = this.player.physics.getAngle();
    const speed = this.player.physics.getSpeed();
    
    if (speed > 0.1) {
      puck.x = this.player.physics.x + Math.cos(angle) * this.puckDistance;
      puck.y = this.player.physics.y + Math.sin(angle) * this.puckDistance;
    } else {
      puck.x = this.player.physics.x + this.puckDistance * 0.8;
      puck.y = this.player.physics.y;
    }
    
    puck.vx = 0;
    puck.vy = 0;
  }

  tryTakePuck(puck) {
    if (this.hasPuck) return;
    if (this.pickupCooldown > 0) return;
    
    const dx = puck.x - this.player.physics.x;
    const dy = puck.y - this.player.physics.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.player.physics.radius + puck.radius + 5) {
      this.holdPuck(puck);
    }
  }

  shootPuck(puck) {
    if (!this.hasPuck) return;
    
    this.hasPuck = false;
    
    const angle = this.player.physics.getAngle();
    const speed = this.player.physics.getSpeed();
    
    const shootPower = Math.max(5, Math.min(12, speed * 2 + 5));
    
    if (speed > 0.1) {
      puck.vx = Math.cos(angle) * shootPower;
      puck.vy = Math.sin(angle) * shootPower;
    } else {
      puck.vx = shootPower;
      puck.vy = 0;
    }
  }
}
