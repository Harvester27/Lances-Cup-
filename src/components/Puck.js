// Puck.js - Hokejový puk s kolizemi zaoblených rohů (OPRAVENÁ FYZIKA)
// 🆕 Přidána visible property pro pre-game positioning

export class Puck {
  constructor(width, height, rinkPadding) {
    this.width = width;
    this.height = height;
    this.rinkPadding = rinkPadding;
    this.cornerRadius = 80;
    
    this.x = width / 2;
    this.y = height / 2;
    this.radius = 8;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.visible = true; // 🆕 Přidána viditelnost
  }

  draw(ctx) {
    // 🆕 Nekreslit pokud není viditelný
    if (!this.visible) return;
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  handleBoundaryCollisions() {
    const cornerRadius = this.cornerRadius;
    
    // Středy rohových oblouků
    const corners = [
      { x: this.rinkPadding + cornerRadius, y: this.rinkPadding + cornerRadius },
      { x: this.width - this.rinkPadding - cornerRadius, y: this.rinkPadding + cornerRadius },
      { x: this.width - this.rinkPadding - cornerRadius, y: this.height - this.rinkPadding - cornerRadius },
      { x: this.rinkPadding + cornerRadius, y: this.height - this.rinkPadding - cornerRadius }
    ];
    
    // Zkontroluj, jestli je puk v některém rohovém kvadrantu
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
            this.vx -= 1.8 * dotProduct * normalX;
            this.vy -= 1.8 * dotProduct * normalY;
            this.vx *= 0.8;
            this.vy *= 0.8;
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
      if (this.vx < 0) this.vx *= -0.9;
    }
    if (this.x > rightBound) {
      this.x = rightBound;
      if (this.vx > 0) this.vx *= -0.9;
    }
    if (this.y < topBound) {
      this.y = topBound;
      if (this.vy < 0) this.vy *= -0.9;
    }
    if (this.y > bottomBound) {
      this.y = bottomBound;
      if (this.vy > 0) this.vy *= -0.9;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.handleBoundaryCollisions();

    this.vx *= 0.995;
    this.vy *= 0.995;
  }

  checkGoalCollision(goalLineOffset, goalHeight, goalDepth, centerY) {
    const rinkPadding = this.rinkPadding;
    const goalPoleRadius = 2.5;
    
    // Levá branka
    const leftGoalX = rinkPadding + goalLineOffset;
    const leftGoalBackX = leftGoalX - goalDepth;
    
    // Pravá branka
    const rightGoalX = this.width - rinkPadding - goalLineOffset;
    const rightGoalBackX = rightGoalX + goalDepth;
    
    const goalTopY = centerY - goalHeight / 2;
    const goalBottomY = centerY + goalHeight / 2;
    
    // Kolize s tyčemi levé branky
    this.checkPoleCollision(leftGoalX, goalTopY);
    this.checkPoleCollision(leftGoalX, goalBottomY);
    this.checkPoleCollision(leftGoalBackX, goalTopY);
    this.checkPoleCollision(leftGoalBackX, goalBottomY);
    
    // Kolize s tyčemi pravé branky
    this.checkPoleCollision(rightGoalX, goalTopY);
    this.checkPoleCollision(rightGoalX, goalBottomY);
    this.checkPoleCollision(rightGoalBackX, goalTopY);
    this.checkPoleCollision(rightGoalBackX, goalBottomY);
    
    // Kolize s horními tyčemi branek (vodorovné)
    this.checkHorizontalBar(leftGoalBackX, leftGoalX, goalTopY);
    this.checkHorizontalBar(leftGoalBackX, leftGoalX, goalBottomY);
    this.checkHorizontalBar(rightGoalX, rightGoalBackX, goalTopY);
    this.checkHorizontalBar(rightGoalX, rightGoalBackX, goalBottomY);
    
    // Kolize se zadními tyčemi (svislé)
    this.checkVerticalBar(leftGoalBackX, goalTopY, goalBottomY);
    this.checkVerticalBar(rightGoalBackX, goalTopY, goalBottomY);
  }

  checkPoleCollision(poleX, poleY) {
    const dx = this.x - poleX;
    const dy = this.y - poleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = this.radius + 2.5; // 2.5 je poloměr tyče
    
    if (distance < minDistance && distance > 0) {
      const angle = Math.atan2(dy, dx);
      this.x = poleX + Math.cos(angle) * minDistance;
      this.y = poleY + Math.sin(angle) * minDistance;
      
      const normalX = Math.cos(angle);
      const normalY = Math.sin(angle);
      const dotProduct = this.vx * normalX + this.vy * normalY;
      
      if (dotProduct < 0) {
        this.vx -= 2.0 * dotProduct * normalX;
        this.vy -= 2.0 * dotProduct * normalY;
        this.vx *= 0.7;
        this.vy *= 0.7;
      }
    }
  }

  checkHorizontalBar(x1, x2, barY) {
    if (this.y > barY - this.radius && this.y < barY + this.radius) {
      if (this.x > Math.min(x1, x2) && this.x < Math.max(x1, x2)) {
        if (this.y < barY) {
          this.y = barY - this.radius;
        } else {
          this.y = barY + this.radius;
        }
        this.vy *= -0.8;
      }
    }
  }

  checkVerticalBar(barX, y1, y2) {
    if (this.x > barX - this.radius && this.x < barX + this.radius) {
      if (this.y > y1 && this.y < y2) {
        if (this.x < barX) {
          this.x = barX - this.radius;
        } else {
          this.x = barX + this.radius;
        }
        this.vx *= -0.8;
      }
    }
  }

  checkCollision(player) {
    if (player.hasPuck) return;
    
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + player.radius) {
      const relativeSpeed = Math.sqrt(
        (this.vx - player.vx) ** 2 + 
        (this.vy - player.vy) ** 2
      );
      
      if (relativeSpeed > 2) {
        const angle = Math.atan2(dy, dx);
        this.vx = Math.cos(angle) * 5;
        this.vy = Math.sin(angle) * 5;
      }
    }
  }

  reset(width, height) {
    this.x = width / 2;
    this.y = height / 2;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
  }

  // ✅ PŘIDÁNA METODA: checkGoal - zkontroluje, jestli byl vstřelen gól
  // Vrací: 'home', 'away', nebo null
  checkGoal(width, height, rinkPadding) {
    const centerY = height / 2;
    const goalLineOffset = 80;
    const goalHeight = 50;
    const goalDepth = 20;
    
    // Levá branka (domácí)
    const leftGoalX = rinkPadding + goalLineOffset;
    const leftGoalBackX = leftGoalX - goalDepth;
    
    // Pravá branka (hosté)
    const rightGoalX = width - rinkPadding - goalLineOffset;
    const rightGoalBackX = rightGoalX + goalDepth;
    
    const goalTopY = centerY - goalHeight / 2;
    const goalBottomY = centerY + goalHeight / 2;
    
    // Kontrola gólu v levé brance (skórují hosté)
    if (this.x < leftGoalBackX && this.x > leftGoalBackX - 10) {
      if (this.y > goalTopY && this.y < goalBottomY) {
        console.log('🎉 GÓL! Hosté skórovali!');
        return 'away';
      }
    }
    
    // Kontrola gólu v pravé brance (skórují domácí)
    if (this.x > rightGoalBackX && this.x < rightGoalBackX + 10) {
      if (this.y > goalTopY && this.y < goalBottomY) {
        console.log('🎉 GÓL! Domácí skórovali!');
        return 'home';
      }
    }
    
    return null;
  }
}
