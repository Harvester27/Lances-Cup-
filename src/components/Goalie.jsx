// Goalie.jsx - Brankář pro hokejový rink
// Samostatný soubor pro vykreslování brankáře v 3D prostoru

export class Goalie {
  constructor(x = 500, y = 100, number = 30) {
    this.x = x;
    this.y = y;
    this.z = 0; // Brankář stojí na ledě
    this.rotation = 0; // Rotace ve stupních
    this.number = number;
    this.height = 85; // Výška brankáře (s výstrojí je vyšší)
    this.width = 50; // Šířka (širší kvůli betonům)
    
    // Animační stavy
    this.stance = 'ready'; // ready, save-left, save-right, butterfly
    this.animationProgress = 0;
    
    // Rychlost pohybu
    this.speed = 2.5;
    this.lateralSpeed = 3; // Brankář se pohybuje hlavně do stran
  }
  
  // Pohyb brankáře
  moveLeft() {
    this.x -= this.lateralSpeed;
  }
  
  moveRight() {
    this.x += this.lateralSpeed;
  }
  
  moveForward() {
    this.y += this.speed;
  }
  
  moveBackward() {
    this.y -= this.speed;
  }
  
  // Zákrok - pohyb lapačkou
  saveLeft() {
    this.stance = 'save-left';
    this.animationProgress = 1;
  }
  
  saveRight() {
    this.stance = 'save-right';
    this.animationProgress = 1;
  }
  
  // Motýlek (butterfly save)
  butterfly() {
    this.stance = 'butterfly';
    this.animationProgress = 1;
  }
  
  // Reset do základní pozice
  resetStance() {
    this.stance = 'ready';
    this.animationProgress = 0;
  }
  
  // Update animací
  update() {
    // Postupné návraty do základní pozice
    if (this.animationProgress > 0) {
      this.animationProgress -= 0.05;
      if (this.animationProgress <= 0) {
        this.resetStance();
      }
    }
  }
}

// ===== VYKRESLOVÁNÍ BRANKÁŘE =====

export function drawGoalie(ctx, goalie, camera, canvasWidth, canvasHeight, showDebug = false) {
  const { x, y, z, rotation, height, width, number, stance, animationProgress } = goalie;
  
  // Rotace v radiánech
  const rot = (rotation * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  
  // Pomocná funkce pro rotaci bodu
  function rotatePoint(px, py) {
    return {
      x: x + (px * cos - py * sin),
      y: y + (px * sin + py * cos)
    };
  }
  
  // Výška částí těla
  const floorZ = z;
  const kneesZ = z + 15;
  const waistZ = z + 35;
  const chestZ = z + 55;
  const shouldersZ = z + 70;
  const headZ = z + height;
  
  // Animační offsety
  let leftArmOffset = 0;
  let rightArmOffset = 0;
  let legSpread = 0;
  
  if (stance === 'save-left') {
    leftArmOffset = 25 * animationProgress;
  } else if (stance === 'save-right') {
    rightArmOffset = 25 * animationProgress;
  } else if (stance === 'butterfly') {
    legSpread = 30 * animationProgress;
  }
  
  // ===== BETONY (chrániče nohou) =====
  
  // Levý beton
  const leftPadPoints = [
    rotatePoint(-15 - legSpread, 15),
    rotatePoint(-8 - legSpread, 15),
    rotatePoint(-8 - legSpread, -5),
    rotatePoint(-15 - legSpread, -5)
  ].map(p => ({ x: p.x, y: p.y, z: floorZ }));
  
  // Horní část levého betonu
  const leftPadTop = [
    rotatePoint(-15 - legSpread, 15),
    rotatePoint(-8 - legSpread, 15),
    rotatePoint(-8 - legSpread, -5),
    rotatePoint(-15 - legSpread, -5)
  ].map(p => ({ x: p.x, y: p.y, z: kneesZ }));
  
  // Vyplň levý beton
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const projLeftPad = leftPadPoints.map(p => camera.project(p.x, p.y, p.z, canvasWidth, canvasHeight));
  ctx.moveTo(projLeftPad[0].x, projLeftPad[0].y);
  projLeftPad.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Horní část betonu
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  const projLeftPadTop = leftPadTop.map(p => camera.project(p.x, p.y, p.z, canvasWidth, canvasHeight));
  ctx.moveTo(projLeftPadTop[0].x, projLeftPadTop[0].y);
  projLeftPadTop.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Boční strana betonu
  ctx.fillStyle = '#d0d0d0';
  ctx.beginPath();
  const projPad1 = camera.project(leftPadPoints[0].x, leftPadPoints[0].y, leftPadPoints[0].z, canvasWidth, canvasHeight);
  const projPad2 = camera.project(leftPadTop[0].x, leftPadTop[0].y, leftPadTop[0].z, canvasWidth, canvasHeight);
  const projPad3 = camera.project(leftPadTop[1].x, leftPadTop[1].y, leftPadTop[1].z, canvasWidth, canvasHeight);
  const projPad4 = camera.project(leftPadPoints[1].x, leftPadPoints[1].y, leftPadPoints[1].z, canvasWidth, canvasHeight);
  ctx.moveTo(projPad1.x, projPad1.y);
  ctx.lineTo(projPad2.x, projPad2.y);
  ctx.lineTo(projPad3.x, projPad3.y);
  ctx.lineTo(projPad4.x, projPad4.y);
  ctx.closePath();
  ctx.fill();
  
  // Pravý beton (zrcadlově)
  const rightPadPoints = [
    rotatePoint(8 + legSpread, 15),
    rotatePoint(15 + legSpread, 15),
    rotatePoint(15 + legSpread, -5),
    rotatePoint(8 + legSpread, -5)
  ].map(p => ({ x: p.x, y: p.y, z: floorZ }));
  
  const rightPadTop = [
    rotatePoint(8 + legSpread, 15),
    rotatePoint(15 + legSpread, 15),
    rotatePoint(15 + legSpread, -5),
    rotatePoint(8 + legSpread, -5)
  ].map(p => ({ x: p.x, y: p.y, z: kneesZ }));
  
  // Vyplň pravý beton
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const projRightPad = rightPadPoints.map(p => camera.project(p.x, p.y, p.z, canvasWidth, canvasHeight));
  ctx.moveTo(projRightPad[0].x, projRightPad[0].y);
  projRightPad.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  const projRightPadTop = rightPadTop.map(p => camera.project(p.x, p.y, p.z, canvasWidth, canvasHeight));
  ctx.moveTo(projRightPadTop[0].x, projRightPadTop[0].y);
  projRightPadTop.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // ===== TĚLO =====
  
  // Nohy (pod betony)
  const leftLegPoints = [
    rotatePoint(-8, 5),
    rotatePoint(-3, 5),
    rotatePoint(-3, -3),
    rotatePoint(-8, -3)
  ];
  
  const rightLegPoints = [
    rotatePoint(3, 5),
    rotatePoint(8, 5),
    rotatePoint(8, -3),
    rotatePoint(3, -3)
  ];
  
  // Levá noha
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  const projLeftLeg = leftLegPoints.map(p => camera.project(p.x, p.y, floorZ, canvasWidth, canvasHeight));
  ctx.moveTo(projLeftLeg[0].x, projLeftLeg[0].y);
  projLeftLeg.forEach(p => ctx.lineTo(p.x, p.y));
  const projLeftKnee = leftLegPoints.map(p => camera.project(p.x, p.y, kneesZ, canvasWidth, canvasHeight));
  projLeftKnee.reverse().forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Pravá noha
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  const projRightLeg = rightLegPoints.map(p => camera.project(p.x, p.y, floorZ, canvasWidth, canvasHeight));
  ctx.moveTo(projRightLeg[0].x, projRightLeg[0].y);
  projRightLeg.forEach(p => ctx.lineTo(p.x, p.y));
  const projRightKnee = rightLegPoints.map(p => camera.project(p.x, p.y, kneesZ, canvasWidth, canvasHeight));
  projRightKnee.reverse().forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Trup (chrániče na hrudi)
  const bodyPoints = [
    rotatePoint(-12, 10),
    rotatePoint(12, 10),
    rotatePoint(12, -8),
    rotatePoint(-12, -8)
  ];
  
  // Spodní část trupu
  ctx.fillStyle = '#cc0000'; // Červená barva dresu
  ctx.beginPath();
  const projBodyBottom = bodyPoints.map(p => camera.project(p.x, p.y, waistZ, canvasWidth, canvasHeight));
  ctx.moveTo(projBodyBottom[0].x, projBodyBottom[0].y);
  projBodyBottom.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Horní část trupu
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  const projBodyTop = bodyPoints.map(p => camera.project(p.x, p.y, chestZ, canvasWidth, canvasHeight));
  ctx.moveTo(projBodyTop[0].x, projBodyTop[0].y);
  projBodyTop.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Boční strana trupu
  ctx.fillStyle = '#dd0000';
  ctx.beginPath();
  const projBody1 = camera.project(bodyPoints[0].x, bodyPoints[0].y, waistZ, canvasWidth, canvasHeight);
  const projBody2 = camera.project(bodyPoints[0].x, bodyPoints[0].y, chestZ, canvasWidth, canvasHeight);
  const projBody3 = camera.project(bodyPoints[1].x, bodyPoints[1].y, chestZ, canvasWidth, canvasHeight);
  const projBody4 = camera.project(bodyPoints[1].x, bodyPoints[1].y, waistZ, canvasWidth, canvasHeight);
  ctx.moveTo(projBody1.x, projBody1.y);
  ctx.lineTo(projBody2.x, projBody2.y);
  ctx.lineTo(projBody3.x, projBody3.y);
  ctx.lineTo(projBody4.x, projBody4.y);
  ctx.closePath();
  ctx.fill();
  
  // Číslo na dresu
  const numberPos = camera.project(x, y + 2, chestZ + 5, canvasWidth, canvasHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number.toString(), numberPos.x, numberPos.y);
  
  // ===== RUCE A RUKAVICE =====
  
  // Levá ruka (LAPAČKA - catching glove)
  const leftArmPos = rotatePoint(-12 - leftArmOffset, 5);
  const leftElbowZ = shouldersZ - 10;
  const leftHandZ = shouldersZ - 20;
  
  // Paže
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const projShoulder = camera.project(leftArmPos.x, leftArmPos.y, shouldersZ, canvasWidth, canvasHeight);
  const projElbow = camera.project(leftArmPos.x - 5, leftArmPos.y, leftElbowZ, canvasWidth, canvasHeight);
  const projHand = camera.project(leftArmPos.x - 8, leftArmPos.y + 3, leftHandZ, canvasWidth, canvasHeight);
  ctx.moveTo(projShoulder.x, projShoulder.y);
  ctx.lineTo(projElbow.x, projElbow.y);
  ctx.lineTo(projHand.x, projHand.y);
  ctx.stroke();
  
  // LAPAČKA (velká oválná rukavice)
  const catcherPoints = [];
  const catcherRadius = 8;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const px = leftArmPos.x - 8 + Math.cos(angle) * catcherRadius;
    const py = leftArmPos.y + 3 + Math.sin(angle) * catcherRadius * 0.7;
    catcherPoints.push(camera.project(px, py, leftHandZ, canvasWidth, canvasHeight));
  }
  
  ctx.fillStyle = '#8B4513'; // Hnědá barva kůže
  ctx.beginPath();
  ctx.moveTo(catcherPoints[0].x, catcherPoints[0].y);
  catcherPoints.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Pravá ruka (VYRÁŽEČKA - blocker)
  const rightArmPos = rotatePoint(12 + rightArmOffset, 5);
  const rightElbowZ = shouldersZ - 10;
  const rightHandZ = shouldersZ - 20;
  
  // Paže
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const projRightShoulder = camera.project(rightArmPos.x, rightArmPos.y, shouldersZ, canvasWidth, canvasHeight);
  const projRightElbow = camera.project(rightArmPos.x + 5, rightArmPos.y, rightElbowZ, canvasWidth, canvasHeight);
  const projRightHand = camera.project(rightArmPos.x + 8, rightArmPos.y + 3, rightHandZ, canvasWidth, canvasHeight);
  ctx.moveTo(projRightShoulder.x, projRightShoulder.y);
  ctx.lineTo(projRightElbow.x, projRightElbow.y);
  ctx.lineTo(projRightHand.x, projRightHand.y);
  ctx.stroke();
  
  // VYRÁŽEČKA (obdélníková rukavice)
  const blockerPoints = [
    { x: rightArmPos.x + 8 - 6, y: rightArmPos.y + 3 - 5, z: rightHandZ },
    { x: rightArmPos.x + 8 + 6, y: rightArmPos.y + 3 - 5, z: rightHandZ },
    { x: rightArmPos.x + 8 + 6, y: rightArmPos.y + 3 + 8, z: rightHandZ },
    { x: rightArmPos.x + 8 - 6, y: rightArmPos.y + 3 + 8, z: rightHandZ }
  ];
  
  ctx.fillStyle = '#ffffff'; // Bílá vyrážečka
  ctx.beginPath();
  const projBlocker = blockerPoints.map(p => camera.project(p.x, p.y, p.z, canvasWidth, canvasHeight));
  ctx.moveTo(projBlocker[0].x, projBlocker[0].y);
  projBlocker.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // ===== BRANKÁŘSKÁ HOKEJKA =====
  
  // Hokejka u pravé ruky
  const stickBase = rotatePoint(rightArmPos.x + 8, rightArmPos.y + 3);
  const stickEnd = rotatePoint(rightArmPos.x + 12, rightArmPos.y + 25);
  
  // Tyč hokejky
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const projStickBase = camera.project(stickBase.x, stickBase.y, rightHandZ, canvasWidth, canvasHeight);
  const projStickEnd = camera.project(stickEnd.x, stickEnd.y, floorZ, canvasWidth, canvasHeight);
  ctx.moveTo(projStickBase.x, projStickBase.y);
  ctx.lineTo(projStickEnd.x, projStickEnd.y);
  ctx.stroke();
  
  // Čepel hokejky (širší než u hráče)
  const bladePoints = [
    rotatePoint(stickEnd.x - 3, stickEnd.y + 5),
    rotatePoint(stickEnd.x + 8, stickEnd.y + 5),
    rotatePoint(stickEnd.x + 8, stickEnd.y),
    rotatePoint(stickEnd.x - 3, stickEnd.y)
  ];
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  const projBlade = bladePoints.map(p => camera.project(p.x, p.y, floorZ, canvasWidth, canvasHeight));
  ctx.moveTo(projBlade[0].x, projBlade[0].y);
  projBlade.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // ===== HLAVA A HELMA =====
  
  // Krk
  ctx.strokeStyle = '#FFD4A3';
  ctx.lineWidth = 5;
  ctx.beginPath();
  const projNeckBottom = camera.project(x, y, shouldersZ, canvasWidth, canvasHeight);
  const projNeckTop = camera.project(x, y, headZ - 12, canvasWidth, canvasHeight);
  ctx.moveTo(projNeckBottom.x, projNeckBottom.y);
  ctx.lineTo(projNeckTop.x, projNeckTop.y);
  ctx.stroke();
  
  // Hlava (koule)
  const headRadius = 8;
  const headPoints = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const px = x + Math.cos(angle) * headRadius;
    const py = y + Math.sin(angle) * headRadius;
    headPoints.push(camera.project(px, py, headZ - 5, canvasWidth, canvasHeight));
  }
  
  ctx.fillStyle = '#FFD4A3';
  ctx.beginPath();
  ctx.moveTo(headPoints[0].x, headPoints[0].y);
  headPoints.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Brankářská helma (větší než u hráče)
  const helmetRadius = 9;
  const helmetPoints = [];
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI + (i / 12) * Math.PI; // Půlkruh
    const px = x + Math.cos(angle) * helmetRadius;
    const py = y + Math.sin(angle) * helmetRadius;
    helmetPoints.push(camera.project(px, py, headZ - 3, canvasWidth, canvasHeight));
  }
  
  ctx.fillStyle = '#003D7A'; // Modrá helma
  ctx.beginPath();
  ctx.moveTo(helmetPoints[0].x, helmetPoints[0].y);
  helmetPoints.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  
  // Maska (mřížka)
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const maskY = y - 6 + i * 3;
    const maskLeft = camera.project(x - 7, maskY, headZ - 5, canvasWidth, canvasHeight);
    const maskRight = camera.project(x + 7, maskY, headZ - 5, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.moveTo(maskLeft.x, maskLeft.y);
    ctx.lineTo(maskRight.x, maskRight.y);
    ctx.stroke();
  }
  
  // ===== DEBUG INFO =====
  if (showDebug) {
    const debugPos = camera.project(x, y, headZ + 15, canvasWidth, canvasHeight);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`#${number} ${stance}`, debugPos.x, debugPos.y);
    ctx.fillText(`(${Math.round(x)}, ${Math.round(y)})`, debugPos.x, debugPos.y + 15);
  }
}

// ===== GOALIE CONTROLLER =====

export class GoalieController {
  constructor(goalie) {
    this.goalie = goalie;
    this.keys = {};
    
    // Bind keyboard events
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  
  handleKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    
    // Speciální akce
    if (e.key === 'q' || e.key === 'Q') {
      this.goalie.saveLeft();
    }
    if (e.key === 'e' || e.key === 'E') {
      this.goalie.saveRight();
    }
    if (e.key === ' ') {
      e.preventDefault();
      this.goalie.butterfly();
    }
  }
  
  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }
  
  update() {
    // Pohyb WASD nebo šipky
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.goalie.moveLeft();
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.goalie.moveRight();
    }
    if (this.keys['w'] || this.keys['arrowup']) {
      this.goalie.moveBackward(); // Pryč od branky
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      this.goalie.moveForward(); // K brance
    }
    
    // Update animací
    this.goalie.update();
  }
  
  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
