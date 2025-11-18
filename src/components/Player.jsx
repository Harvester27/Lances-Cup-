// Player.jsx - Profesionální 3D hokejový hráč
// Napsáno od základu - čistý kód bez pozůstatků

class Player {
  constructor(x, y, number = 99, teamColor = '#ff0000') {
    // Pozice na hřišti
    this.x = x;
    this.y = y;
    this.z = 0; // Led je na z=0
    
    console.log(`🏒 NOVÝ HRÁČ VYTVOŘEN na pozici x=${x}, y=${y}`);
    
    // Rotace (stupně, 0° = doprava →)
    this.rotation = 0;
    
    // Fyzika pohybu
    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = 0.25;
    this.sprintAcceleration = 0.45;
    this.friction = 0.96; // Kluzký led
    this.baseSpeed = 2.5;
    this.sprintSpeed = 5;
    this.rotationSpeed = 2.5;
    this.turningRadius = 0.85; // Drift při zatáčení
    
    // Animace
    this.swingSpeed = 0;
    this.swingOffset = 0;
    this.legPhase = 0;
    this.isMoving = false;
    
    // Vizuální vlastnosti
    this.number = number;
    this.teamColor = teamColor;
    this.radius = 20;
    this.isSprinting = false;
  }
  
  // === POHYBOVÉ METODY ===
  
  moveForward() {
    const accel = this.isSprinting ? this.sprintAcceleration : this.acceleration;
    const rad = (this.rotation * Math.PI) / 180;
    this.velocityX += Math.cos(rad) * accel;
    this.velocityY += Math.sin(rad) * accel;
    this.isMoving = true;
  }
  
  moveBackward() {
    const accel = (this.isSprinting ? this.sprintAcceleration : this.acceleration) * 0.6;
    const rad = (this.rotation * Math.PI) / 180;
    this.velocityX -= Math.cos(rad) * accel;
    this.velocityY -= Math.sin(rad) * accel;
    this.isMoving = true;
  }
  
  rotateLeft() {
    this.rotation -= this.rotationSpeed;
    if (this.rotation < 0) this.rotation += 360;
  }
  
  rotateRight() {
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) this.rotation -= 360;
  }
  
  setSprint(sprinting) {
    this.isSprinting = sprinting;
  }
  
  // === FYZIKA & ANIMACE ===
  
  update() {
    // DEBUG - před aplikací velocity
    const oldX = this.x;
    const oldY = this.y;
    
    // Aplikovat velocity na pozici
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // DEBUG - po aplikaci velocity
    if (Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01) {
      console.log(`UPDATE: vX=${this.velocityX.toFixed(3)}, vY=${this.velocityY.toFixed(3)} | před: x=${oldX.toFixed(1)}, y=${oldY.toFixed(1)} | po: x=${this.x.toFixed(1)}, y=${this.y.toFixed(1)}`);
    }
    
    // Tření (skluz)
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;
    
    // Zastavit při malé rychlosti
    if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0;
    if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0;
    
    // Detekce pohybu
    const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
    this.isMoving = speed > 0.3;
    
    // Animace bruslení
    if (this.isMoving) {
      this.swingSpeed += 0.18;
      this.swingOffset = Math.sin(this.swingSpeed) * 2.5;
      this.legPhase = this.swingSpeed;
    } else {
      this.swingSpeed = 0;
      this.swingOffset *= 0.8;
      if (Math.abs(this.swingOffset) < 0.1) this.swingOffset = 0;
    }
    
    // Drift efekt
    if (speed > 0.5) {
      const rad = (this.rotation * Math.PI) / 180;
      const targetVX = Math.cos(rad) * speed;
      const targetVY = Math.sin(rad) * speed;
      this.velocityX = this.velocityX * this.turningRadius + targetVX * (1 - this.turningRadius);
      this.velocityY = this.velocityY * this.turningRadius + targetVY * (1 - this.turningRadius);
    }
    
    // Limit rychlosti
    const maxSpeed = this.isSprinting ? this.sprintSpeed : this.baseSpeed;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.velocityX *= scale;
      this.velocityY *= scale;
    }
  }
  
  // === KOLIZE S MANTINELY A BRANKAMI ===
  
  constrainToRink(rinkWidth, rinkHeight, margin = 50) {
    const oldX = this.x;
    const oldY = this.y;
    
    const cornerRadius = 80;
    const playerRadius = this.radius + 5;
    
    // Branky
    const goalLineOffset = 80;
    const goalWidth = 45;
    const goalDepth = 25;
    const centerY = rinkHeight / 2;
    
    const leftGoalXMin = goalLineOffset - goalDepth;
    const leftGoalXMax = goalLineOffset;
    const leftGoalYMin = centerY - goalWidth / 2;
    const leftGoalYMax = centerY + goalWidth / 2;
    
    const rightGoalXMin = rinkWidth - goalLineOffset;
    const rightGoalXMax = rinkWidth - goalLineOffset + goalDepth;
    
    // Kolize s levou brankou
    if (this.x >= leftGoalXMin - playerRadius && this.x <= leftGoalXMax + playerRadius) {
      if (this.y >= leftGoalYMin - playerRadius && this.y <= leftGoalYMax + playerRadius) {
        const dLeft = Math.abs(this.x - (leftGoalXMin - playerRadius));
        const dRight = Math.abs(this.x - (leftGoalXMax + playerRadius));
        const dTop = Math.abs(this.y - (leftGoalYMin - playerRadius));
        const dBottom = Math.abs(this.y - (leftGoalYMax + playerRadius));
        const minD = Math.min(dLeft, dRight, dTop, dBottom);
        
        if (minD === dLeft) {
          this.x = leftGoalXMin - playerRadius;
          this.velocityX = Math.min(0, this.velocityX) * 0.3;
        } else if (minD === dRight) {
          this.x = leftGoalXMax + playerRadius;
          this.velocityX = Math.max(0, this.velocityX) * 0.3;
        } else if (minD === dTop) {
          this.y = leftGoalYMin - playerRadius;
          this.velocityY = Math.min(0, this.velocityY) * 0.3;
        } else {
          this.y = leftGoalYMax + playerRadius;
          this.velocityY = Math.max(0, this.velocityY) * 0.3;
        }
      }
    }
    
    // Kolize s pravou brankou
    if (this.x >= rightGoalXMin - playerRadius && this.x <= rightGoalXMax + playerRadius) {
      if (this.y >= leftGoalYMin - playerRadius && this.y <= leftGoalYMax + playerRadius) {
        const dLeft = Math.abs(this.x - (rightGoalXMin - playerRadius));
        const dRight = Math.abs(this.x - (rightGoalXMax + playerRadius));
        const dTop = Math.abs(this.y - (leftGoalYMin - playerRadius));
        const dBottom = Math.abs(this.y - (leftGoalYMax + playerRadius));
        const minD = Math.min(dLeft, dRight, dTop, dBottom);
        
        if (minD === dLeft) {
          this.x = rightGoalXMin - playerRadius;
          this.velocityX = Math.min(0, this.velocityX) * 0.3;
        } else if (minD === dRight) {
          this.x = rightGoalXMax + playerRadius;
          this.velocityX = Math.max(0, this.velocityX) * 0.3;
        } else if (minD === dTop) {
          this.y = leftGoalYMin - playerRadius;
          this.velocityY = Math.min(0, this.velocityY) * 0.3;
        } else {
          this.y = leftGoalYMax + playerRadius;
          this.velocityY = Math.max(0, this.velocityY) * 0.3;
        }
      }
    }
    
    // Mantinely - rovné stěny
    if (this.x < margin + playerRadius) {
      this.x = margin + playerRadius;
      this.velocityX = Math.max(0, this.velocityX) * 0.3;
    }
    if (this.x > rinkWidth - margin - playerRadius) {
      this.x = rinkWidth - margin - playerRadius;
      this.velocityX = Math.min(0, this.velocityX) * 0.3;
    }
    if (this.y < margin + playerRadius) {
      this.y = margin + playerRadius;
      this.velocityY = Math.max(0, this.velocityY) * 0.3;
    }
    if (this.y > rinkHeight - margin - playerRadius) {
      this.y = rinkHeight - margin - playerRadius;
      this.velocityY = Math.min(0, this.velocityY) * 0.3;
    }
    
    // Rohy (zaoblené) - aplikovat JEN když je hráč ZA MANTINELY v rohu
    const corners = [
      { cx: margin + cornerRadius, cy: margin + cornerRadius, xOut: 'left', yOut: 'top' },
      { cx: rinkWidth - margin - cornerRadius, cy: margin + cornerRadius, xOut: 'right', yOut: 'top' },
      { cx: margin + cornerRadius, cy: rinkHeight - margin - cornerRadius, xOut: 'left', yOut: 'bottom' },
      { cx: rinkWidth - margin - cornerRadius, cy: rinkHeight - margin - cornerRadius, xOut: 'right', yOut: 'bottom' }
    ];
    
    corners.forEach(corner => {
      // Kontrolovat JEN pokud hráč je ZA OBĚMA mantinely (v rohovém čtverci MIMO hřiště)
      const isBeyondX = (corner.xOut === 'left' && this.x < margin + cornerRadius + playerRadius) ||
                        (corner.xOut === 'right' && this.x > rinkWidth - margin - cornerRadius - playerRadius);
      const isBeyondY = (corner.yOut === 'top' && this.y < margin + cornerRadius + playerRadius) ||
                        (corner.yOut === 'bottom' && this.y > rinkHeight - margin - cornerRadius - playerRadius);
      
      // JEN pokud je ZA OBĚMA mantinely současně (v rohu)
      if (isBeyondX && isBeyondY) {
        const dx = this.x - corner.cx;
        const dy = this.y - corner.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Pokud je MIMO povolený zaoblený roh
        if (dist > cornerRadius - playerRadius) {
          const angle = Math.atan2(dy, dx);
          this.x = corner.cx + Math.cos(angle) * (cornerRadius - playerRadius);
          this.y = corner.cy + Math.sin(angle) * (cornerRadius - playerRadius);
          
          const nx = Math.cos(angle);
          const ny = Math.sin(angle);
          const dot = this.velocityX * nx + this.velocityY * ny;
          this.velocityX -= dot * nx * 1.3;
          this.velocityY -= dot * ny * 1.3;
          this.velocityX *= 0.3;
          this.velocityY *= 0.3;
        }
      }
    });
    
    // DEBUG - zjistit jestli constrainToRink změnil pozici
    if (Math.abs(this.x - oldX) > 0.1 || Math.abs(this.y - oldY) > 0.1) {
      console.log(`⚠️ CONSTRAIN ZMĚNIL POZICI! před: x=${oldX.toFixed(1)}, y=${oldY.toFixed(1)} | po: x=${this.x.toFixed(1)}, y=${this.y.toFixed(1)}`);
    }
  }
  
  // === 3D VYKRESLENÍ ===
  // DŮLEŽITÉ: Z-osa je obrácená - ZÁPORNÉ Z = nahoru!
  // Každá část těla se projektuje zvlášť s vlastní Z souřadnicí
  
  draw(ctx, camera, canvasWidth, canvasHeight) {
    const x = this.x;
    const y = this.y;
    const z = this.z; // z=0 je led
    
    const rad = (this.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const legSwing = this.isMoving ? Math.sin(this.legPhase) * 3 : 0;
    
    // Vykreslení zespodu nahoru (painter's algorithm)
    this.drawStick(ctx, camera, canvasWidth, canvasHeight, x, y, z, cos, sin);
    this.drawSkates(ctx, camera, canvasWidth, canvasHeight, x, y, z, cos, sin, legSwing);
    this.drawLegs(ctx, camera, canvasWidth, canvasHeight, x, y, z, cos, sin, legSwing);
    this.drawBody(ctx, camera, canvasWidth, canvasHeight, x, y, z);
    this.drawHelmet(ctx, camera, canvasWidth, canvasHeight, x, y, z);
    
    if (this.isSprinting) {
      this.drawSprintEffect(ctx, camera, canvasWidth, canvasHeight, x, y, z);
    }
  }
  
  // Hokejka - tyč od rukou k pádlu na ledě
  drawStick(ctx, camera, w, h, x, y, z, cos, sin) {
    // Ruce drží hokejku
    const holdX = x + cos * 8 - sin * 3;
    const holdY = y + sin * 8 + cos * 3;
    const holdZ = z - 20; // Ruce jsou v půli těla (ZÁPORNÉ = nahoru!)
    
    // Pádlo na ledě
    const bladeX = x + cos * 35;
    const bladeY = y + sin * 35;
    const bladeZ = z; // NA LEDĚ!
    
    const hold = camera.project(holdX, holdY, holdZ, w, h);
    const blade = camera.project(bladeX, bladeY, bladeZ, w, h);
    
    ctx.save();
    
    // Tyč hokejky
    const grad = ctx.createLinearGradient(hold.x, hold.y, blade.x, blade.y);
    grad.addColorStop(0, '#5a4230');
    grad.addColorStop(0.5, '#6b4f3a');
    grad.addColorStop(1, '#3a2810');
    
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5 * hold.scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hold.x, hold.y);
    ctx.lineTo(blade.x, blade.y);
    ctx.stroke();
    
    // Grip tape
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 7 * hold.scale;
    const gripX = hold.x + (blade.x - hold.x) * 0.3;
    const gripY = hold.y + (blade.y - hold.y) * 0.3;
    ctx.beginPath();
    ctx.moveTo(hold.x, hold.y);
    ctx.lineTo(gripX, gripY);
    ctx.stroke();
    
    // Pádlo
    ctx.translate(blade.x, blade.y);
    ctx.rotate(Math.atan2(blade.y - hold.y, blade.x - hold.x));
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-12, -3);
    ctx.quadraticCurveTo(-3, 18, 20, 14);
    ctx.quadraticCurveTo(22, 5, 20, -5);
    ctx.quadraticCurveTo(-3, -2, -12, -8);
    ctx.closePath();
    ctx.fill();
    
    // Bílá páska
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 5 * blade.scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(0, 14, 16, 11);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Brusle - na ledě
  drawSkates(ctx, camera, w, h, x, y, z, cos, sin, swing) {
    const skates = [
      { ox: -5, swing: -swing },
      { ox: 5, swing: swing }
    ];
    
    skates.forEach(sk => {
      const sx = x + cos * sk.ox - sin * 10;
      const sy = y + sin * sk.ox + cos * 10;
      const sz = z - Math.abs(sk.swing) * 0.2; // Lehké zvedání (ZÁPORNÉ = nahoru!)
      
      const p = camera.project(sx, sy, sz, w, h);
      const size = this.radius * p.scale * 0.4;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      
      // Brusle
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Čepel
      ctx.strokeStyle = '#c0c0c0';
      ctx.lineWidth = 3 * p.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, size * 1.2);
      ctx.lineTo(size * 0.5, size * 1.2);
      ctx.stroke();
      
      // Odlesk
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5 * p.scale;
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, size * 1.1);
      ctx.lineTo(size * 0.2, size * 1.1);
      ctx.stroke();
      
      ctx.restore();
    });
  }
  
  // Nohy - spojují brusle s tělem
  drawLegs(ctx, camera, w, h, x, y, z, cos, sin, swing) {
    const legs = [
      { ox: -5, swing: -swing },
      { ox: 5, swing: swing }
    ];
    
    legs.forEach(leg => {
      // Dolní bod (u bruslí)
      const bx = x + cos * leg.ox - sin * 10;
      const by = y + sin * leg.ox + cos * 10;
      const bz = z - 3; // ZÁPORNÉ = nahoru!
      
      // Horní bod (u těla)
      const tx = x + cos * leg.ox - sin * 2;
      const ty = y + sin * leg.ox + cos * 2;
      const tz = z - 15; // ZÁPORNÉ = nahoru!
      
      const bottom = camera.project(bx, by, bz, w, h);
      const top = camera.project(tx, ty, tz, w, h);
      
      const grad = ctx.createLinearGradient(bottom.x, bottom.y, top.x, top.y);
      grad.addColorStop(0, this.darken(this.teamColor, 0.6));
      grad.addColorStop(1, this.teamColor);
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 8 * bottom.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bottom.x, bottom.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
    });
  }
  
  // Tělo s dresem a číslem
  drawBody(ctx, camera, w, h, x, y, z) {
    const bodyZ = z - 25; // Střed těla (ZÁPORNÉ = nahoru!)
    const p = camera.project(x, y, bodyZ, w, h);
    const size = this.radius * p.scale;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Stín
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Tělo - 3D gradient
    const grad = ctx.createRadialGradient(-size * 0.3, -size * 0.2, 0, 0, 0, size * 1.1);
    grad.addColorStop(0, this.lighten(this.teamColor, 1.4));
    grad.addColorStop(0.4, this.teamColor);
    grad.addColorStop(0.8, this.darken(this.teamColor, 0.6));
    grad.addColorStop(1, this.darken(this.teamColor, 0.4));
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.9, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // Okraj
    ctx.strokeStyle = this.darken(this.teamColor, 0.3);
    ctx.lineWidth = 3 * p.scale;
    ctx.stroke();
    
    // Bílé pruhy
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2 * p.scale;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.75, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
    
    // ČÍSLO
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4 * p.scale;
    ctx.font = `bold ${size * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.strokeText(this.number, 0, 0);
    ctx.fillText(this.number, 0, 0);
    
    ctx.restore();
  }
  
  // Helma - nejvyšší část hráče
  drawHelmet(ctx, camera, w, h, x, y, z) {
    const helmetZ = z - 40; // Nejvýš (ZÁPORNÉ = nahoru!)
    const p = camera.project(x, y, helmetZ, w, h);
    const size = this.radius * p.scale * 0.8;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    
    // Helma gradient
    const grad = ctx.createRadialGradient(-size * 0.15, -size * 0.15, 0, 0, 0, size * 0.6);
    grad.addColorStop(0, this.lighten(this.teamColor, 1.5));
    grad.addColorStop(0.3, this.lighten(this.teamColor, 1.2));
    grad.addColorStop(0.7, this.teamColor);
    grad.addColorStop(1, this.darken(this.teamColor, 0.5));
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = this.darken(this.teamColor, 0.3);
    ctx.lineWidth = 2.5 * p.scale;
    ctx.stroke();
    
    // Odlesk
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.3, size * 0.4, size * 0.25, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Mřížka
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.lineWidth = 2 * p.scale;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size * 0.15, -size * 0.4);
      ctx.lineTo(i * size * 0.15, size * 0.4);
      ctx.stroke();
    }
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, i * size * 0.2);
      ctx.lineTo(size * 0.5, i * size * 0.2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Sprint efekt - zlatá záře
  drawSprintEffect(ctx, camera, w, h, x, y, z) {
    const centerZ = z - 25; // ZÁPORNÉ = nahoru!
    const p = camera.project(x, y, centerZ, w, h);
    const size = this.radius * p.scale * 1.5;
    const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Vnější záře
    const grad = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.5);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
    grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
    grad.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pulsující kroužky
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 * pulse})`;
    ctx.lineWidth = 3 * p.scale;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.2 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    
    // Jiskry
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.003;
      const dist = size * 1.3;
      const sparkX = Math.cos(angle) * dist;
      const sparkY = Math.sin(angle) * dist;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2 * p.scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // === POMOCNÉ FUNKCE ===
  
  darken(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  lighten(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
    const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
    const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// === OVLÁDÁNÍ KLÁVESNICÍ ===

class PlayerController {
  constructor(player) {
    this.player = player;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false
    };
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  
  enable() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  
  disable() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
  
  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (key === 'w') {
      this.keys.w = true;
      e.preventDefault();
    } else if (key === 'a') {
      this.keys.a = true;
      e.preventDefault();
    } else if (key === 's') {
      this.keys.s = true;
      e.preventDefault();
    } else if (key === 'd') {
      this.keys.d = true;
      e.preventDefault();
    } else if (e.key === 'Shift') {
      this.keys.shift = true;
      this.player.setSprint(true);
      e.preventDefault();
    }
  }
  
  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    
    if (key === 'w') this.keys.w = false;
    else if (key === 'a') this.keys.a = false;
    else if (key === 's') this.keys.s = false;
    else if (key === 'd') this.keys.d = false;
    else if (e.key === 'Shift') {
      this.keys.shift = false;
      this.player.setSprint(false);
    }
  }
  
  update() {
    this.player.isMoving = false;
    
    if (this.keys.a) this.player.rotateLeft();
    if (this.keys.d) this.player.rotateRight();
    if (this.keys.w) this.player.moveForward();
    if (this.keys.s) this.player.moveBackward();
    
    this.player.update();
  }
}

export { Player, PlayerController };
