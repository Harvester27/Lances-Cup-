// Referee.js - Hokejový rozhodčí 👨‍⚖️

export class Referee {
  constructor(width, height, rinkPadding) {
    this.width = width;
    this.height = height;
    this.rinkPadding = rinkPadding;
    
    // Pozice a rychlost
    // ✅ OPRAVA: Začíná u mantinelu, ne uprostřed (aby nebyl v cestě útočníkům)
    this.x = width / 2;
    this.y = rinkPadding + 30; // U horního mantinelu
    this.vx = 0;
    this.vy = 0;
    this.radius = 18; // Trochu větší než hráč
    
    // Fyzika
    this.acceleration = 0.1;
    this.maxSpeed = 2.5;
    this.friction = 0.92;
    
    // Stavy
    this.state = 'waiting'; // waiting, skating_to_center, dropping_puck, skating_away, watching, getting_puck
    this.targetX = width / 2;
    this.targetY = height / 2;
    
    // Timer pro animace
    this.stateTimer = 0;
    
    // Držení puku
    this.hasPuck = false;
    
    // Pozice pro sledování hry (u mantinelu)
    this.watchingPositionX = width / 2;
    this.watchingPositionY = rinkPadding + 30; // U horního mantinelu
  }

  update(deltaTime = 1/60) {
    this.stateTimer += deltaTime;
    
    switch(this.state) {
      case 'waiting':
        // Čeká na začátek
        break;
        
      case 'skating_to_center':
        // Jede na střed pro vhazování
        this.moveTowards(this.targetX, this.targetY);
        
        const distToCenter = this.getDistance(this.x, this.y, this.targetX, this.targetY);
        if (distToCenter < 10) {
          this.state = 'ready_to_drop';
          this.stateTimer = 0;
          this.vx = 0;
          this.vy = 0;
        }
        break;
        
      case 'ready_to_drop':
        // Stojí u středu, připraven hodit puk
        this.vx *= 0.8;
        this.vy *= 0.8;
        break;
        
      case 'dropping_puck':
        // Animace házení puku (stojí na místě)
        this.vx *= 0.8;
        this.vy *= 0.8;
        
        if (this.stateTimer > 0.5) {
          this.state = 'skating_away';
          this.stateTimer = 0;
          // Cíl: k mantinelu
          this.targetX = this.watchingPositionX;
          this.targetY = this.watchingPositionY;
        }
        break;
        
      case 'skating_away':
        // Odjíždí k mantinelu
        this.moveTowards(this.targetX, this.targetY);
        
        const distToSideline = this.getDistance(this.x, this.y, this.targetX, this.targetY);
        if (distToSideline < 20) {
          this.state = 'watching';
          this.stateTimer = 0;
        }
        break;
        
      case 'watching':
        // Sleduje hru u mantinelu (pomalu se pohybuje sem a tam)
        const wobble = Math.sin(this.stateTimer * 2) * 30;
        this.targetX = this.watchingPositionX + wobble;
        this.moveTowards(this.targetX, this.targetY, 0.3); // Pomalu
        break;
        
      case 'getting_puck':
        // Jede pro puk do branky
        this.moveTowards(this.targetX, this.targetY);
        
        const distToPuck = this.getDistance(this.x, this.y, this.targetX, this.targetY);
        if (distToPuck < 30) {
          this.hasPuck = true;
          this.state = 'returning_to_center';
          this.stateTimer = 0;
          this.targetX = this.width / 2;
          this.targetY = this.height / 2;
        }
        break;
        
      case 'returning_to_center':
        // Vrací se na střed s pukem
        this.moveTowards(this.targetX, this.targetY);
        
        const distToReturn = this.getDistance(this.x, this.y, this.targetX, this.targetY);
        if (distToReturn < 10) {
          this.state = 'ready_to_drop';
          this.stateTimer = 0;
          this.vx = 0;
          this.vy = 0;
        }
        break;
    }
    
    // Aplikuj rychlost
    this.x += this.vx;
    this.y += this.vy;
    
    // Třecí síla
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Stop malé rychlosti
    if (Math.abs(this.vx) < 0.01) this.vx = 0;
    if (Math.abs(this.vy) < 0.01) this.vy = 0;
  }

  moveTowards(targetX, targetY, speedMult = 1.0) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      return;
    }
    
    const inputX = dx / distance;
    const inputY = dy / distance;
    
    this.vx += inputX * this.acceleration * speedMult;
    this.vy += inputY * this.acceleration * speedMult;
    
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeed = this.maxSpeed * speedMult;
    
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }
  }

  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Příkazy pro změnu stavu
  skateToCenter() {
    this.skateToPosition(this.width / 2, this.height / 2);
  }
  
  // ✅ NOVÉ: Jet na libovolnou pozici
  skateToPosition(x, y) {
    this.state = 'skating_to_center';
    this.targetX = x;
    this.targetY = y;
    this.stateTimer = 0;
  }

  dropPuck() {
    this.state = 'dropping_puck';
    this.stateTimer = 0;
    // ✅ OPRAVA: Reset hasPuck - rozhodčí už puk nedrží!
    this.hasPuck = false;
  }

  getPuck(puckX, puckY) {
    this.state = 'getting_puck';
    this.targetX = puckX;
    this.targetY = puckY;
    this.hasPuck = false;
    this.stateTimer = 0;
  }

  draw(ctx) {
    // Tělo rozhodčího (pruhovaný dres)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bílé pruhy
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Obrys
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Písmeno "R" (Referee)
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('R', this.x, this.y);
    ctx.fillText('R', this.x, this.y);
    
    // Pokud drží puk
    if (this.hasPuck) {
      ctx.fillStyle = '#1a1a1a';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.radius - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    
    // Debug - zobrazení stavu
    if (false) { // Zapni pro debug
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(this.state, this.x, this.y - 30);
      ctx.fillText(this.state, this.x, this.y - 30);
    }
  }

  // Animace házení puku
  drawDropAnimation(ctx) {
    if (this.state === 'dropping_puck') {
      const progress = Math.min(this.stateTimer / 0.5, 1);
      
      // Ruka se zvedá a hází puk dolů
      const armY = this.y - this.radius - (20 * (1 - progress));
      
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, armY);
      ctx.stroke();
      
      // Puk v ruce (mizí jak padá)
      if (progress < 0.8) {
        ctx.fillStyle = '#1a1a1a';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, armY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // ✅ GETTERY pro kontrolu stavu
  get hasArrived() {
    return this.state === 'ready_to_drop';
  }

  get isReadyToDrop() {
    // Vrátí true, když je rozhodčí na místě a čeká tam alespoň 1 sekundu
    return this.state === 'ready_to_drop' && this.stateTimer >= 1.0;
  }
}
