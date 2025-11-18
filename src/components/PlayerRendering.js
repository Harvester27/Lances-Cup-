// PlayerRendering.js - Vykreslování hráče

export class PlayerRendering {
  constructor(player) {
    this.player = player;
  }

  draw(ctx, puck) {
    // ✅ OCHRANA: Pokud má hráč neplatné souřadnice, nekresli ho
    if (!isFinite(this.player.physics.x) || !isFinite(this.player.physics.y)) {
      console.warn('⚠️ Skipping draw for player with invalid position:', this.player.attr.name);
      return;
    }
    
    // Trail particles při brzdění
    this.drawTrailParticles(ctx);

    // 🥊 KNOCKED DOWN - leží na zemi
    if (this.player.emotions.isKnockedDown()) {
      this.drawKnockedDown(ctx);
      return;
    }

    // Tělo hráče
    this.drawBody(ctx, puck);
    
    // 🥊 STUNNED - hvězdičky nad hlavou
    if (this.player.emotions.isStunned()) {
      this.drawStunnedStars(ctx);
    }

    // 🙌 ANIMACE DLANÍ při bodčeku
    if (this.player.emotions.checkAnimationTimer > 0) {
      this.drawCheckAnimation(ctx);
    }

    // Obličej
    this.drawFace(ctx, puck);
    
    // Šipka nad hráčem (pokud je ovládán)
    if (this.player.isControlled) {
      this.drawControlArrow(ctx);
    }
    
    // 🎯 ČÁRA MÍŘENÍ při nabíjení střely
    if (this.player.actions.isChargingShot && this.player.actions.hasPuck) {
      this.drawAimingLine(ctx);
    }
    
    // 🎯 ČÁRA PŘIHRÁVKY při nabíjení
    if (this.player.actions.isChargingPass && this.player.actions.hasPuck && this.player.actions.passTargetPlayer) {
      this.drawPassLine(ctx);
    }
    
    // Jméno, level a stamina
    if (this.player.attr.name) {
      this.drawPlayerInfo(ctx);
    }
  }

  drawTrailParticles(ctx) {
    this.player.physics.trailParticles.forEach((particle, index) => {
      ctx.fillStyle = `rgba(200, 200, 255, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      particle.alpha -= 0.05;
      particle.size *= 0.95;
      
      if (particle.alpha <= 0) {
        this.player.physics.trailParticles.splice(index, 1);
      }
    });
  }

  drawKnockedDown(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    
    ctx.fillStyle = this.player.color;
    ctx.beginPath();
    ctx.ellipse(this.player.physics.x, this.player.physics.y, this.player.physics.radius * 1.3, this.player.physics.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = this.player.isControlled ? '#ef4444' : '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
    if (this.player.attr.name) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('💫 K.O.', this.player.physics.x, this.player.physics.y - 25);
    }
  }

  drawBody(ctx, puck) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    const radius = this.player.physics.radius;
    
    // Tělo
    ctx.fillStyle = this.player.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Obrys - pulzuje při nabíjení
    if (this.player.isControlled) {
      if (this.player.actions.isChargingShot) {
        const pulseSize = 2 + Math.sin(Date.now() / 100) * 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3 + pulseSize;
      } else if (this.player.actions.hasPuck) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
      } else if (this.player.physics.isBraking) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
      } else if (this.player.physics.isSprinting) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
      }
    } else {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
    }
    ctx.stroke();

    // Aura při nabíjení
    if (this.player.isControlled && this.player.actions.isChargingShot) {
      const rotation = Date.now() / 500;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(x, y, radius + 6 + Math.sin(rotation) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawStunnedStars(ctx) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    const time = Date.now() / 200;
    
    for (let i = 0; i < 3; i++) {
      const angle = (time + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
      const radius = 25;
      const starX = x + Math.cos(angle) * radius;
      const starY = y - 15 + Math.sin(angle) * 10;
      
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const starAngle = (j * Math.PI * 2 / 5) - Math.PI / 2;
        const starRadius = j % 2 === 0 ? 4 : 2;
        const sx = starX + Math.cos(starAngle) * starRadius;
        const sy = starY + Math.sin(starAngle) * starRadius;
        if (j === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  drawCheckAnimation(ctx) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    const radius = this.player.physics.radius;
    
    const progress = 1 - (this.player.emotions.checkAnimationTimer / this.player.emotions.checkAnimationDuration);
    const fadeProgress = this.player.emotions.checkAnimationTimer / this.player.emotions.checkAnimationDuration;
    
    const pushDistance = radius + 10 + (progress * 15);
    const handAngle = this.player.emotions.checkAnimationAngle;
    
    const centerX = x + Math.cos(handAngle) * pushDistance;
    const centerY = y + Math.sin(handAngle) * pushDistance;
    
    ctx.save();
    ctx.globalAlpha = fadeProgress;
    
    // LEVÁ DLAŇ
    const leftOffsetX = -Math.sin(handAngle) * 8;
    const leftOffsetY = Math.cos(handAngle) * 8;
    this.drawHand(ctx, centerX + leftOffsetX, centerY + leftOffsetY, handAngle);
    
    // PRAVÁ DLAŇ
    const rightOffsetX = Math.sin(handAngle) * 8;
    const rightOffsetY = -Math.cos(handAngle) * 8;
    this.drawHand(ctx, centerX + rightOffsetX, centerY + rightOffsetY, handAngle);
    
    ctx.restore();
  }

  drawHand(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    const handColor = this.player.team === 'home' ? '#fef3c7' : '#dbeafe';
    
    // DLAŇ
    ctx.fillStyle = handColor;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-6, -8, 12, 16, 2);
    ctx.fill();
    ctx.stroke();
    
    // PRSTY
    for (let i = 0; i < 4; i++) {
      const fingerX = -4.5 + i * 3;
      const fingerY = -8;
      
      ctx.fillStyle = handColor;
      ctx.beginPath();
      ctx.roundRect(fingerX, fingerY - 6, 2, 6, 1);
      ctx.fill();
      ctx.stroke();
    }
    
    // PALEC
    ctx.beginPath();
    ctx.roundRect(-8, -4, 2, 5, 1);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  drawFace(ctx, puck) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    
    // Směr obličeje
    let dx, dy;
    if (this.player.actions.isChargingShot) {
      dx = this.player.actions.mouseX - x;
      dy = this.player.actions.mouseY - y;
    } else if (this.player.actions.hasPuck) {
      dx = this.player.physics.vx;
      dy = this.player.physics.vy;
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed < 0.1) {
        dx = puck.x - x;
        dy = puck.y - y;
      }
    } else {
      dx = puck.x - x;
      dy = puck.y - y;
    }
    
    const angle = Math.atan2(dy, dx);
    
    // Orientace obličeje
    let faceDirection = 0;
    if (angle > -Math.PI/4 && angle < Math.PI/4) {
      faceDirection = 1;
    } else if (angle > 3*Math.PI/4 || angle < -3*Math.PI/4) {
      faceDirection = -1;
    }
    
    const eyeY = y - 3;
    const eyeSize = 4;
    const pupilSize = 2;
    
    // Oči
    if (faceDirection === 0) {
      this.drawFrontFace(ctx, x, eyeY, eyeSize, pupilSize, angle, dx, dy);
    } else {
      this.drawSideFace(ctx, x, eyeY, eyeSize, pupilSize, faceDirection);
    }

    // Úsměv / výraz podle stavu
    this.drawMouth(ctx, x, y, faceDirection);
  }

  drawFrontFace(ctx, x, eyeY, eyeSize, pupilSize, angle, dx, dy) {
    const eyeOffset = 5;
    const expression = this.player.emotions.faceExpression;
    
    if (expression !== 'ko' && expression !== 'stunned') {
      // Bílá očí
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Zorničky
      const pupilAngle = Math.atan2(dy, dx);
      const pupilDistance = 1.5;
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(
        x - eyeOffset + Math.cos(pupilAngle) * pupilDistance, 
        eyeY + Math.sin(pupilAngle) * pupilDistance, 
        pupilSize, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        x + eyeOffset + Math.cos(pupilAngle) * pupilDistance, 
        eyeY + Math.sin(pupilAngle) * pupilDistance, 
        pupilSize, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  drawSideFace(ctx, x, eyeY, eyeSize, pupilSize, faceDirection) {
    const shift = faceDirection * 3;
    const eyeOffset1 = 2;
    const eyeOffset2 = 7;
    
    if (faceDirection === 1) {
      // Zadní oko
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + shift - eyeOffset1, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + shift - eyeOffset1 + 1, eyeY, pupilSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Přední oko
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + shift + eyeOffset2, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + shift + eyeOffset2 + 1.5, eyeY, pupilSize, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Zadní oko
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + shift + eyeOffset1, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + shift + eyeOffset1 - 1, eyeY, pupilSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Přední oko
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + shift - eyeOffset2, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + shift - eyeOffset2 - 1.5, eyeY, pupilSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawMouth(ctx, x, y, faceDirection) {
    const expression = this.player.emotions.faceExpression;
    const eyeY = y - 3;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    if (expression === 'ko') {
      // 💀 K.O. - X oči
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 7, eyeY - 2);
      ctx.lineTo(x - 3, eyeY + 2);
      ctx.moveTo(x - 3, eyeY - 2);
      ctx.lineTo(x - 7, eyeY + 2);
      ctx.moveTo(x + 3, eyeY - 2);
      ctx.lineTo(x + 7, eyeY + 2);
      ctx.moveTo(x + 7, eyeY - 2);
      ctx.lineTo(x + 3, eyeY + 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y + 6, 4, 0, Math.PI * 2);
      ctx.stroke();
      
    } else if (expression === 'stunned') {
      // 😵 Omráčený - spirály
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      for (let eye of [-5, 5]) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const radius = (i / 10) * 3;
          const sx = x + eye + Math.cos(angle) * radius;
          const sy = eyeY + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 6);
      ctx.quadraticCurveTo(x - 2, y + 4, x, y + 6);
      ctx.quadraticCurveTo(x + 2, y + 8, x + 5, y + 6);
      ctx.stroke();
      
    } else if (expression === 'pain') {
      // 😣 Bolest
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(x - 7, eyeY);
      ctx.lineTo(x - 3, eyeY - 2);
      ctx.moveTo(x + 3, eyeY - 2);
      ctx.lineTo(x + 7, eyeY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 7);
      ctx.lineTo(x - 3, y + 5);
      ctx.lineTo(x, y + 7);
      ctx.lineTo(x + 3, y + 5);
      ctx.lineTo(x + 5, y + 7);
      ctx.stroke();
      
    } else if (expression === 'aggressive') {
      // 😠 Agresivní
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8, eyeY - 4);
      ctx.lineTo(x - 3, eyeY - 2);
      ctx.moveTo(x + 3, eyeY - 2);
      ctx.lineTo(x + 8, eyeY - 4);
      ctx.stroke();
      
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 5);
      ctx.lineTo(x + 5, y + 5);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(x + i * 2, y + 5);
        ctx.lineTo(x + i * 2, y + 8);
      }
      ctx.stroke();
      
    } else {
      // 😊 Normální úsměv
      if (faceDirection === 1) {
        ctx.arc(x + 3, y + 5, 6, 0.2, Math.PI - 0.4);
      } else if (faceDirection === -1) {
        ctx.arc(x - 3, y + 5, 6, 0.4, Math.PI - 0.2);
      } else {
        ctx.arc(x, y + 5, 6, 0.2, Math.PI - 0.2);
      }
      ctx.stroke();
    }
  }

  drawControlArrow(ctx) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    const radius = this.player.physics.radius;
    
    let arrowColor;
    if (this.player.actions.isChargingShot) {
      arrowColor = '#f59e0b';
    } else if (this.player.actions.hasPuck) {
      arrowColor = '#22c55e';
    } else if (this.player.physics.isBraking) {
      arrowColor = '#ef4444';
    } else if (this.player.physics.isSprinting) {
      arrowColor = '#f97316';
    } else {
      arrowColor = '#fbbf24';
    }
    
    ctx.fillStyle = arrowColor;
    ctx.beginPath();
    ctx.moveTo(x, y - radius - 10);
    ctx.lineTo(x - 5, y - radius - 5);
    ctx.lineTo(x + 5, y - radius - 5);
    ctx.closePath();
    ctx.fill();
  }

  drawAimingLine(ctx) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    
    const aimDx = this.player.actions.mouseX - x;
    const aimDy = this.player.actions.mouseY - y;
    const aimDistance = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
    
    if (aimDistance > 0) {
      const aimAngle = Math.atan2(aimDy, aimDx);
      const isAimingBackwards = this.player.actions.isAimingBackwards();
      
      if (isAimingBackwards) {
        // ČERVENÁ ČÁRA = BLOKOVÁNO
        const lineLength = 50;
        const endX = x + Math.cos(aimAngle) * lineLength;
        const endY = y + Math.sin(aimAngle) * lineLength;
        
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Křížek
        const crossSize = 10;
        ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(endX - crossSize, endY - crossSize);
        ctx.lineTo(endX + crossSize, endY + crossSize);
        ctx.moveTo(endX + crossSize, endY - crossSize);
        ctx.lineTo(endX - crossSize, endY + crossSize);
        ctx.stroke();
        
      } else {
        // NORMÁLNÍ ČÁRA - POVOLENO
        const lineLength = 100 + (this.player.actions.shotPower / 100) * 100;
        const endX = x + Math.cos(aimAngle) * lineLength;
        const endY = y + Math.sin(aimAngle) * lineLength;
        
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.5 + (this.player.actions.shotPower / 200)})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Šipka
        const arrowSize = 8;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(aimAngle - Math.PI / 6),
          endY - arrowSize * Math.sin(aimAngle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(aimAngle + Math.PI / 6),
          endY - arrowSize * Math.sin(aimAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  drawPassLine(ctx) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    const targetX = this.player.actions.passTargetPlayer.physics.x;
    const targetY = this.player.actions.passTargetPlayer.physics.y;
    
    const passAccuracy = this.player.attr.getPassAccuracy();
    
    // Čára k cíli
    ctx.strokeStyle = `rgba(34, 197, 94, 0.6)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Kruh kolem cílového hráče
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(targetX, targetY, this.player.actions.passTargetPlayer.physics.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Tečky ukazující nepřesnost
    const inaccuracyRadius = 30 * (1.5 - passAccuracy);
    if (inaccuracyRadius > 5) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dotX = targetX + Math.cos(angle) * inaccuracyRadius;
        const dotY = targetY + Math.sin(angle) * inaccuracyRadius;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Text - kvalita přihrávky
    let qualityText;
    let qualityColor;
    if (passAccuracy >= 1.2) {
      qualityText = '🎯 PERFEKTNÍ';
      qualityColor = '#22c55e';
    } else if (passAccuracy >= 0.9) {
      qualityText = '✅ DOBRÁ';
      qualityColor = '#84cc16';
    } else if (passAccuracy >= 0.6) {
      qualityText = '⚠️ PRŮMĚRNÁ';
      qualityColor = '#eab308';
    } else {
      qualityText = '❌ RISKANTNÍ';
      qualityColor = '#ef4444';
    }
    
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = qualityColor;
    ctx.textAlign = 'center';
    ctx.fillText(qualityText, targetX, targetY - this.player.actions.passTargetPlayer.physics.radius - 20);
  }

  drawPlayerInfo(ctx) {
    const x = this.player.physics.x;
    const y = this.player.physics.y;
    const radius = this.player.physics.radius;
    
    // ✅ OCHRANA: Pokud jsou pozice neplatné, nekreslíme nic
    if (!isFinite(x) || !isFinite(y) || !isFinite(radius)) {
      console.warn('⚠️ Invalid player position:', this.player.attr.name, x, y, radius);
      return;
    }
    
    ctx.save();
    
    let displayName = this.player.attr.name;
    if (displayName.length > 15) {
      displayName = displayName.substring(0, 13) + '...';
    }
    
    ctx.font = 'bold 11px Arial';
    const nameWidth = ctx.measureText(displayName).width;
    const bgPadding = 4;
    const bgWidth = nameWidth + bgPadding * 2;
    const bgHeight = 16;
    const bgX = x - bgWidth / 2;
    const bgY = y + radius + 8;
    
    // Pozadí jména
    if (this.player.attr.isPlayer) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
    } else if (this.player.isControlled) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.strokeStyle = this.player.color;
      ctx.lineWidth = 1.5;
    }
    
    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
    ctx.fill();
    ctx.stroke();
    
    // Jméno
    if (this.player.attr.isPlayer) {
      ctx.fillStyle = '#422006';
    } else if (this.player.isControlled) {
      ctx.fillStyle = '#451a03';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayName, x, bgY + bgHeight / 2);
    
    // Level badge
    if (this.player.attr.level) {
      const levelY = bgY + bgHeight + 12;
      const levelBgWidth = 32;
      const levelBgHeight = 14;
      const levelBgX = x - levelBgWidth / 2;
      
      // ✅ OCHRANA: Kontrola před createLinearGradient
      if (isFinite(levelBgX) && isFinite(levelY) && isFinite(levelBgWidth) && isFinite(levelBgHeight)) {
        const gradient = ctx.createLinearGradient(levelBgX, levelY, levelBgX + levelBgWidth, levelY + levelBgHeight);
        gradient.addColorStop(0, 'rgba(234, 179, 8, 0.95)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.95)');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.roundRect(levelBgX, levelY, levelBgWidth, levelBgHeight, 3);
        ctx.fill();
        ctx.stroke();
        
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#422006';
        ctx.fillText(`Lv ${this.player.attr.level}`, x, levelY + levelBgHeight / 2);
      }
    }
    
    // Stamina bar
    if (this.player.isControlled) {
      const staminaBarWidth = bgWidth;
      const staminaBarHeight = 4;
      const staminaBarY = bgY + bgHeight + (this.player.attr.level ? 26 : 12);
      const staminaBarX = x - staminaBarWidth / 2;
      
      // Pozadí
      ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
      ctx.fillRect(staminaBarX, staminaBarY, staminaBarWidth, staminaBarHeight);
      
      // Stamina
      const staminaPercent = this.player.stamina.getPercent();
      ctx.fillStyle = this.player.stamina.getColor();
      ctx.fillRect(
        staminaBarX, 
        staminaBarY, 
        staminaBarWidth * staminaPercent, 
        staminaBarHeight
      );
      
      // Obrys
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(staminaBarX, staminaBarY, staminaBarWidth, staminaBarHeight);
    }
    
    ctx.restore();
  }
}
