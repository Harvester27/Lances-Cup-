// PlayerPhysics.js - Fyzika pohybu a kolize

export class PlayerPhysics {
  constructor(player) {
    this.player = player;
    
    // Pozice a rychlost
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 15;
    
    // Rozměry hřiště
    this.width = 1200;
    this.height = 500;
    this.rinkPadding = 20;
    this.cornerRadius = 80;
    
    // Fyzika bruslení (základní hodnoty, budou upraveny podle atributů)
    this.acceleration = 0.08;
    this.sprintAcceleration = 0.12;
    this.maxSpeed = 2.0;
    this.maxSprintSpeed = 3.0;
    this.friction = 0.92;
    this.brakeForce = 0.96;
    
    // Stavy
    this.isSprinting = false;
    this.isBraking = false;
    
    // Trail efekt
    this.trailParticles = [];
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setRinkDimensions(width, height, rinkPadding) {
    this.width = width;
    this.height = height;
    this.rinkPadding = rinkPadding;
  }

  // Inicializace fyziky podle atributů
  initializePhysics(speedMultiplier, accelMultiplier) {
    const BASE_ACCELERATION = 0.08;
    const BASE_SPRINT_ACCELERATION = 0.12;
    const BASE_MAX_SPEED = 2.0;
    const BASE_MAX_SPRINT_SPEED = 3.0;
    
    this.acceleration = BASE_ACCELERATION * accelMultiplier;
    this.sprintAcceleration = BASE_SPRINT_ACCELERATION * accelMultiplier;
    this.maxSpeed = BASE_MAX_SPEED * speedMultiplier;
    this.maxSprintSpeed = BASE_MAX_SPRINT_SPEED * speedMultiplier;
  }

  update(inputX, inputY, canSprint, deltaTime = 1/60) {
    // Normalizace inputu
    if (inputX !== 0 || inputY !== 0) {
      const inputLength = Math.sqrt(inputX * inputX + inputY * inputY);
      inputX /= inputLength;
      inputY /= inputLength;
    }
    
    // Sprint logic
    if (canSprint) {
      this.isSprinting = true;
    } else {
      this.isSprinting = false;
    }
    
    const currentAcceleration = this.isSprinting ? this.sprintAcceleration : this.acceleration;
    const currentMaxSpeed = this.isSprinting ? this.maxSprintSpeed : this.maxSpeed;
    
    this.isBraking = false;
    
    // Pohyb
    if (inputX !== 0 || inputY !== 0) {
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      
      // Detekce brzdění (proti směru pohybu)
      if (currentSpeed > 0.5) {
        const normVx = this.vx / currentSpeed;
        const normVy = this.vy / currentSpeed;
        const dot = normVx * inputX + normVy * inputY;
        
        if (dot < -0.3) {
          this.isBraking = true;
          this.vx *= this.brakeForce;
          this.vy *= this.brakeForce;
          
          // Trail efekt při brzdění
          if (Math.random() < 0.2) {
            this.trailParticles.push({
              x: this.x + (Math.random() - 0.5) * this.radius,
              y: this.y + (Math.random() - 0.5) * this.radius,
              size: 3 + Math.random() * 2,
              alpha: 0.6
            });
          }
        }
      }
      
      // Aplikace zrychlení
      this.vx += inputX * currentAcceleration;
      this.vy += inputY * currentAcceleration;
    } else {
      // Tření
      this.vx *= this.friction;
      this.vy *= this.friction;
      
      if (Math.abs(this.vx) < 0.01) this.vx = 0;
      if (Math.abs(this.vy) < 0.01) this.vy = 0;
    }
    
    // Omezení maximální rychlosti
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > currentMaxSpeed) {
      this.vx = (this.vx / speed) * currentMaxSpeed;
      this.vy = (this.vy / speed) * currentMaxSpeed;
    }
    
    // Aplikace rychlosti na pozici
    this.x += this.vx;
    this.y += this.vy;

    // Kolize s hranicemi
    this.handleBoundaryCollisions();
  }

  // Kolize s hranicemi hřiště (zaoblené rohy)
  handleBoundaryCollisions() {
    const cornerRadius = this.cornerRadius;
    
    const corners = [
      { x: this.rinkPadding + cornerRadius, y: this.rinkPadding + cornerRadius },
      { x: this.width - this.rinkPadding - cornerRadius, y: this.rinkPadding + cornerRadius },
      { x: this.width - this.rinkPadding - cornerRadius, y: this.height - this.rinkPadding - cornerRadius },
      { x: this.rinkPadding + cornerRadius, y: this.height - this.rinkPadding - cornerRadius }
    ];
    
    for (let corner of corners) {
      const isInCornerQuadrant = 
        (corner.x <= this.width / 2 ? this.x <= corner.x : this.x >= corner.x) &&
        (corner.y <= this.height / 2 ? this.y <= corner.y : this.y >= corner.y);
      
      if (isInCornerQuadrant) {
        const dx = this.x - corner.x;
        const dy = this.y - corner.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > cornerRadius - this.radius) {
          const angle = Math.atan2(dy, dx);
          const targetDistance = cornerRadius - this.radius;
          
          this.x = corner.x + Math.cos(angle) * targetDistance;
          this.y = corner.y + Math.sin(angle) * targetDistance;
          
          const normalX = Math.cos(angle);
          const normalY = Math.sin(angle);
          const dotProduct = this.vx * normalX + this.vy * normalY;
          
          if (dotProduct > 0) {
            this.vx -= 1.5 * dotProduct * normalX;
            this.vy -= 1.5 * dotProduct * normalY;
            this.vx *= 0.7;
            this.vy *= 0.7;
          }
          
          return;
        }
      }
    }
    
    // Rovné mantinely
    const leftBound = this.rinkPadding + this.radius;
    const rightBound = this.width - this.rinkPadding - this.radius;
    const topBound = this.rinkPadding + this.radius;
    const bottomBound = this.height - this.rinkPadding - this.radius;
    
    if (this.x < leftBound) {
      this.x = leftBound;
      this.vx *= -0.5;
    }
    if (this.x > rightBound) {
      this.x = rightBound;
      this.vx *= -0.5;
    }
    if (this.y < topBound) {
      this.y = topBound;
      this.vy *= -0.5;
    }
    if (this.y > bottomBound) {
      this.y = bottomBound;
      this.vy *= -0.5;
    }
  }

  // Kolize hráč-hráč s VYLEPŠENOU FYZIKOU
  checkPlayerCollision(otherPlayer) {
    const dx = otherPlayer.physics.x - this.x;
    const dy = otherPlayer.physics.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = this.radius + otherPlayer.physics.radius;
    
    if (distance < minDistance && distance > 0) {
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Separace
      const overlap = minDistance - distance;
      const separationX = nx * overlap * 0.5;
      const separationY = ny * overlap * 0.5;
      
      this.x -= separationX;
      this.y -= separationY;
      otherPlayer.physics.x += separationX;
      otherPlayer.physics.y += separationY;
      
      // 🎯 VYLEPŠENÁ FYZIKA KOLIZE
      const dvx = otherPlayer.physics.vx - this.vx;
      const dvy = otherPlayer.physics.vy - this.vy;
      const dotProduct = dvx * nx + dvy * ny;
      
      if (dotProduct > 0) {
        // Získání atributů hráčů
        const myWeight = this.player.attr.get('weight');
        const otherWeight = otherPlayer.attr.get('weight');
        const myStrength = this.player.attr.get('strength');
        const otherStrength = otherPlayer.attr.get('strength');
        
        // Celková hmotnost
        const totalWeight = myWeight + otherWeight;
        const myWeightRatio = myWeight / totalWeight;
        const otherWeightRatio = otherWeight / totalWeight;
        
        // Rychlosti
        const mySpeed = this.getSpeed();
        const otherSpeed = otherPlayer.physics.getSpeed();
        
        // Stabilita (kombinace síly a váhy)
        const myStability = (myStrength / 10) * (myWeight / 100);
        const otherStability = (otherStrength / 10) * (otherWeight / 100);
        
        // Momentum
        const myMomentum = mySpeed * myWeight;
        const otherMomentum = otherSpeed * otherWeight;
        
        // Základní impulz
        const restitution = 0.6;
        const baseImpulse = dotProduct * restitution;
        
        // Upravený impulz podle váhy a stability
        const myImpulse = baseImpulse * (1 + otherWeightRatio - myStability * 0.2);
        const otherImpulse = baseImpulse * (1 + myWeightRatio - otherStability * 0.2);
        
        // Aplikace impulzu
        this.vx += myImpulse * nx;
        this.vy += myImpulse * ny;
        otherPlayer.physics.vx -= otherImpulse * nx;
        otherPlayer.physics.vy -= otherImpulse * ny;
        
        // Síla nárazu (pro výrazy a ztrátu puku)
        const impactForce = Math.abs(dotProduct);
        const relativeSpeedDiff = Math.abs(mySpeed - otherSpeed);
        const totalImpact = impactForce + relativeSpeedDiff * 0.3;
        
        // 🎭 Nastavení výrazů při kolizi
        const myImpact = totalImpact * otherWeightRatio * (1 / myStability);
        const otherImpact = totalImpact * myWeightRatio * (1 / otherStability);
        
        // "Ajaj" výraz při silném nárazu
        if (myImpact > 1.2 && !this.player.emotions.isKnockedDown()) {
          this.player.emotions.setExpression('pain', 800);
        }
        if (otherImpact > 1.2 && !otherPlayer.emotions.isKnockedDown()) {
          otherPlayer.emotions.setExpression('pain', 800);
        }
        
        // 🏒 Ztráta puku při kolizi
        const puckLossResult = this.checkPuckLossOnCollision(
          otherPlayer, myImpact, otherImpact, nx, ny
        );
        
        // Vrátit info o silné kolizi
        if (totalImpact > 1.5) {
          return { 
            strongImpact: true, 
            force: totalImpact,
            puckLoss: puckLossResult
          };
        }
      }
    }
    return null;
  }
  
  // 🏒 Kontrola ztráty puku při kolizi
  checkPuckLossOnCollision(otherPlayer, myImpact, otherImpact, nx, ny) {
    // Šance na ztrátu puku závisí na síle nárazu
    if (this.player.hasPuck && myImpact > 1.0) {
      const lossChance = Math.min((myImpact - 1.0) * 0.5, 0.9);
      
      if (Math.random() < lossChance) {
        this.player.hasPuck = false;
        const puckSpeed = 2 + myImpact;
        return { 
          lostPuck: true, 
          player: this.player,
          puckVelocity: { vx: nx * puckSpeed, vy: ny * puckSpeed }
        };
      }
    }
    
    if (otherPlayer.hasPuck && otherImpact > 1.0) {
      const lossChance = Math.min((otherImpact - 1.0) * 0.5, 0.9);
      
      if (Math.random() < lossChance) {
        otherPlayer.hasPuck = false;
        const puckSpeed = 2 + otherImpact;
        return { 
          lostPuck: true, 
          player: otherPlayer,
          puckVelocity: { vx: -nx * puckSpeed, vy: -ny * puckSpeed }
        };
      }
    }
    
    return null;
  }

  // Kolize s brankou
  checkGoalCollision(goalLineOffset, goalHeight, goalDepth, centerY) {
    const leftGoalX = this.rinkPadding + goalLineOffset;
    const leftGoalBackX = leftGoalX - goalDepth;
    const rightGoalX = this.width - this.rinkPadding - goalLineOffset;
    const rightGoalBackX = rightGoalX + goalDepth;
    const goalTopY = centerY - goalHeight / 2;
    const goalBottomY = centerY + goalHeight / 2;
    
    this.checkPoleCollision(leftGoalX, goalTopY);
    this.checkPoleCollision(leftGoalX, goalBottomY);
    this.checkPoleCollision(leftGoalBackX, goalTopY);
    this.checkPoleCollision(leftGoalBackX, goalBottomY);
    this.checkPoleCollision(rightGoalX, goalTopY);
    this.checkPoleCollision(rightGoalX, goalBottomY);
    this.checkPoleCollision(rightGoalBackX, goalTopY);
    this.checkPoleCollision(rightGoalBackX, goalBottomY);
    this.checkHorizontalBar(leftGoalBackX, leftGoalX, goalTopY);
    this.checkHorizontalBar(leftGoalBackX, leftGoalX, goalBottomY);
    this.checkHorizontalBar(rightGoalX, rightGoalBackX, goalTopY);
    this.checkHorizontalBar(rightGoalX, rightGoalBackX, goalBottomY);
    this.checkVerticalBar(leftGoalBackX, goalTopY, goalBottomY);
    this.checkVerticalBar(rightGoalBackX, goalTopY, goalBottomY);
  }

  checkPoleCollision(poleX, poleY) {
    const dx = this.x - poleX;
    const dy = this.y - poleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = this.radius + 2.5;
    
    if (distance < minDistance && distance > 0) {
      const angle = Math.atan2(dy, dx);
      this.x = poleX + Math.cos(angle) * minDistance;
      this.y = poleY + Math.sin(angle) * minDistance;
      
      const normalX = Math.cos(angle);
      const normalY = Math.sin(angle);
      const dotProduct = this.vx * normalX + this.vy * normalY;
      
      if (dotProduct < 0) {
        this.vx -= 1.8 * dotProduct * normalX;
        this.vy -= 1.8 * dotProduct * normalY;
        this.vx *= 0.5;
        this.vy *= 0.5;
        
        return Math.abs(dotProduct) > 1;
      }
    }
    return false;
  }

  checkHorizontalBar(x1, x2, barY) {
    if (this.y > barY - this.radius && this.y < barY + this.radius) {
      if (this.x > Math.min(x1, x2) && this.x < Math.max(x1, x2)) {
        if (this.y < barY) {
          this.y = barY - this.radius;
        } else {
          this.y = barY + this.radius;
        }
        this.vy *= -0.5;
        return Math.abs(this.vy) > 1;
      }
    }
    return false;
  }

  checkVerticalBar(barX, y1, y2) {
    if (this.x > barX - this.radius && this.x < barX + this.radius) {
      if (this.y > y1 && this.y < y2) {
        if (this.x < barX) {
          this.x = barX - this.radius;
        } else {
          this.x = barX + this.radius;
        }
        this.vx *= -0.5;
        return Math.abs(this.vx) > 1;
      }
    }
    return false;
  }

  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  getAngle() {
    return Math.atan2(this.vy, this.vx);
  }
}
