import { useEffect, useRef } from 'react';
import { drawRink } from './Rink';
import { Player } from './Player';
import { PlayerAI } from './PlayerAI';
import { Puck } from './Puck';
import { Referee } from './Referee';

// Mockup třídy pro OffsideDetector (odstraněný modul)
class OffsideDetector {
  constructor(width, height, rinkPadding) {
    this.width = width;
    this.height = height;
    this.rinkPadding = rinkPadding;
  }
  
  checkOffside(puck, players) {
    return { isOffside: false };
  }
}

// Mockup třídy pro FaceoffManager (odstraněný modul)
class FaceoffManager {
  constructor(width, height, rinkPadding) {
    this.width = width;
    this.height = height;
    this.rinkPadding = rinkPadding;
    this.currentFaceoffSpot = { x: width / 2, y: height / 2, name: 'Střed' };
  }
  
  resetToCenterFaceoff(players) {
    // Prázdná implementace
  }
  
  setFaceoffSpot(spot) {
    this.currentFaceoffSpot = spot;
  }
  
  assignPositionsToPlayers(players, spot) {
    // Prázdná implementace
  }
}

// Mockup třídy pro FaceoffSystem (odstraněný modul)
class FaceoffSystem {
  constructor() {
    this.active = false;
    this.complete = false;
  }
  
  isActive() {
    return this.active;
  }
  
  isComplete() {
    return this.complete;
  }
  
  start(players, spot, puck) {
    this.active = true;
    this.complete = false;
  }
  
  update(deltaTime, players) {
    // Po chvíli automaticky dokončit
    this.complete = true;
  }
  
  playerAttempt(player, mouseX, mouseY) {
    // Prázdná implementace
  }
  
  draw(ctx, width, height, controlledPlayer, mouseX, mouseY) {
    // Prázdná implementace
  }
}

export function useMatchGame({
  canvasRef,
  isPaused,
  showDebugAI,
  setScore,
  setGameTime,
  setFps,
  setGamePhase
}) {
  const keysPressed = useRef({});
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const rinkPadding = 20;
    const rinkWidth = width - rinkPadding * 2;
    const rinkHeight = height - rinkPadding * 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    mousePosition.current = { x: centerX, y: centerY };

    let currentGameTime = 20 * 60;
    let currentGamePhase = 'positioning';
    let currentCountdown = 3;
    let countdownTimer = 0;
    
    let puckDropGracePeriod = 0;
    let celebrationTimer = 0;
    let scoringTeam = null;

    const puck = new Puck(width, height, rinkPadding);
    puck.visible = false;
    
    const referee = new Referee(width, height, rinkPadding);
    referee.state = 'waiting';
    
    const offsideDetector = new OffsideDetector(width, height, rinkPadding);
    const faceoffManager = new FaceoffManager(width, height, rinkPadding);
    const faceoffSystem = new FaceoffSystem();
    
    // NAČÍST SESTAVY
    const homeLineupData = sessionStorage.getItem('matchHomeLineup');
    const awayLineupData = sessionStorage.getItem('matchAwayLineup');
    
    let homeLineup = null;
    let awayLineup = null;
    
    if (homeLineupData && awayLineupData) {
      homeLineup = JSON.parse(homeLineupData);
      awayLineup = JSON.parse(awayLineupData);
    }
    
    const players = [];
    
    if (homeLineup && awayLineup) {
      // ==========================================
      // 🏒 DOMÁCÍ TÝM - GOALIE (OPRAVENO - BLÍŽ K BRÁNĚ!)
      // ==========================================
      const homeGoalie = new Player(
        width * 0.10, height * 0.5,  // ✅ OPRAVA: 0.10 místo 0.15
        homeLineup.color, 'home', false, 
        width, height, rinkPadding,
        homeLineup.goalie.name,
        homeLineup.goalie.level,
        homeLineup.goalie.isPlayer,
        homeLineup.goalie.attributes?.speed || 5,
        homeLineup.goalie.attributes?.acceleration || 5
      );
      homeGoalie.setAttributes(homeLineup.goalie.attributes || {});
      homeGoalie.position = 'goalie';
      
      if (!homeLineup.goalie.isPlayer) {
        homeGoalie.ai = new PlayerAI(homeGoalie);
        const baseSpeed = homeGoalie.attr.getSpeedMultiplier();
        const baseAccel = homeGoalie.attr.getAccelerationMultiplier();
        homeGoalie.physics.initializePhysics(
          baseSpeed * homeGoalie.ai.speedMultiplier,
          baseAccel * homeGoalie.ai.speedMultiplier
        );
      }
      homeGoalie.faceoffPosition = { x: width * 0.10, y: centerY };  // ✅ OPRAVA: 0.10 místo 0.12
      players.push(homeGoalie);
      
      // ==========================================
      // 🏒 DOMÁCÍ TÝM - DEFENDERS
      // ==========================================
      homeLineup.defenders.forEach((defender, idx) => {
        const y = height * (0.3 + idx * 0.4);
        const player = new Player(
          width * 0.25, y,
          homeLineup.color, 'home', false,
          width, height, rinkPadding,
          defender.name,
          defender.level,
          false,
          defender.attributes?.speed || 5,
          defender.attributes?.acceleration || 5
        );
        player.setAttributes(defender.attributes || {});
        player.position = 'defender';
        
        if (!defender.isPlayer) {
          player.ai = new PlayerAI(player);
          const baseSpeed = player.attr.getSpeedMultiplier();
          const baseAccel = player.attr.getAccelerationMultiplier();
          player.physics.initializePhysics(
            baseSpeed * player.ai.speedMultiplier,
            baseAccel * player.ai.speedMultiplier
          );
        }
        
        player.faceoffPosition = {
          x: width * 0.35,
          y: idx === 0 ? height * 0.30 : height * 0.70
        };
        
        players.push(player);
      });
      
      // ==========================================
      // 🏒 DOMÁCÍ TÝM - FORWARDS
      // ==========================================
      homeLineup.forwards.forEach((forward, idx) => {
        const y = height * (0.25 + idx * 0.25);
        
        // ✅ DŮLEŽITÉ: Pokud je hráč ovládaný hráčem, nastavit isControlled
        const isPlayerControlled = forward.isPlayer === true;
        
        const player = new Player(
          width * 0.4, y,
          homeLineup.color, 'home', isPlayerControlled,  // ✅ OPRAVA: správné isControlled
          width, height, rinkPadding,
          forward.name,
          forward.level,
          forward.isPlayer,
          forward.attributes?.speed || 5,
          forward.attributes?.acceleration || 5
        );
        player.setAttributes(forward.attributes || {});
        player.position = 'forward';
        
        // AI pouze pro ne-hráčské postavy
        if (!forward.isPlayer) {
          player.ai = new PlayerAI(player);
          const baseSpeed = player.attr.getSpeedMultiplier();
          const baseAccel = player.attr.getAccelerationMultiplier();
          player.physics.initializePhysics(
            baseSpeed * player.ai.speedMultiplier,
            baseAccel * player.ai.speedMultiplier
          );
        }
        
        if (idx === 0) {
          player.faceoffPosition = { x: centerX - 20, y: centerY };
        } else if (idx === 1) {
          player.faceoffPosition = { x: centerX - 35, y: centerY - 75 };
        } else {
          player.faceoffPosition = { x: centerX - 35, y: centerY + 75 };
        }
        
        players.push(player);
      });
      
      // ==========================================
      // 🏒 HOSTUJÍCÍ TÝM - GOALIE (OPRAVENO - BLÍŽ K BRÁNĚ!)
      // ==========================================
      const awayGoalie = new Player(
        width * 0.90, height * 0.5,  // ✅ OPRAVA: 0.90 místo 0.85
        awayLineup.color, 'away', false,
        width, height, rinkPadding,
        awayLineup.goalie.name,
        awayLineup.goalie.level,
        false,
        awayLineup.goalie.attributes?.speed || 5,
        awayLineup.goalie.attributes?.acceleration || 5
      );
      awayGoalie.setAttributes(awayLineup.goalie.attributes || {});
      awayGoalie.position = 'goalie';
      
      if (!awayLineup.goalie.isPlayer) {
        awayGoalie.ai = new PlayerAI(awayGoalie);
        const baseSpeed = awayGoalie.attr.getSpeedMultiplier();
        const baseAccel = awayGoalie.attr.getAccelerationMultiplier();
        awayGoalie.physics.initializePhysics(
          baseSpeed * awayGoalie.ai.speedMultiplier,
          baseAccel * awayGoalie.ai.speedMultiplier
        );
      }
      awayGoalie.faceoffPosition = { x: width * 0.90, y: centerY };  // ✅ OPRAVA: 0.90 místo 0.88
      players.push(awayGoalie);
      
      // ==========================================
      // 🏒 HOSTUJÍCÍ TÝM - DEFENDERS
      // ==========================================
      awayLineup.defenders.forEach((defender, idx) => {
        const y = height * (0.3 + idx * 0.4);
        const player = new Player(
          width * 0.75, y,
          awayLineup.color, 'away', false,
          width, height, rinkPadding,
          defender.name,
          defender.level,
          false,
          defender.attributes?.speed || 5,
          defender.attributes?.acceleration || 5
        );
        player.setAttributes(defender.attributes || {});
        player.position = 'defender';
        
        if (!defender.isPlayer) {
          player.ai = new PlayerAI(player);
          const baseSpeed = player.attr.getSpeedMultiplier();
          const baseAccel = player.attr.getAccelerationMultiplier();
          player.physics.initializePhysics(
            baseSpeed * player.ai.speedMultiplier,
            baseAccel * player.ai.speedMultiplier
          );
        }
        
        player.faceoffPosition = {
          x: width * 0.65,
          y: idx === 0 ? height * 0.30 : height * 0.70
        };
        
        players.push(player);
      });
      
      // ==========================================
      // 🏒 HOSTUJÍCÍ TÝM - FORWARDS
      // ==========================================
      awayLineup.forwards.forEach((forward, idx) => {
        const y = height * (0.25 + idx * 0.25);
        const player = new Player(
          width * 0.6, y,
          awayLineup.color, 'away', false,
          width, height, rinkPadding,
          forward.name,
          forward.level,
          false,
          forward.attributes?.speed || 5,
          forward.attributes?.acceleration || 5
        );
        player.setAttributes(forward.attributes || {});
        player.position = 'forward';
        
        if (!forward.isPlayer) {
          player.ai = new PlayerAI(player);
          const baseSpeed = player.attr.getSpeedMultiplier();
          const baseAccel = player.attr.getAccelerationMultiplier();
          player.physics.initializePhysics(
            baseSpeed * player.ai.speedMultiplier,
            baseAccel * player.ai.speedMultiplier
          );
        }
        
        if (idx === 0) {
          player.faceoffPosition = { x: centerX + 20, y: centerY };
        } else if (idx === 1) {
          player.faceoffPosition = { x: centerX + 35, y: centerY - 75 };
        } else {
          player.faceoffPosition = { x: centerX + 35, y: centerY + 75 };
        }
        
        players.push(player);
      });
      
    } else {
      // FALLBACK - základní hráči (pokud sestavy nejsou načteny)
      const defaultPlayers = [
        new Player(width * 0.2, height * 0.3, '#3b82f6', 'home', false, width, height, rinkPadding, 'Hráč 1', 5, false, 5, 5),
        new Player(width * 0.2, height * 0.5, '#3b82f6', 'home', true, width, height, rinkPadding, 'TY', 1, true, 5, 5),
        new Player(width * 0.2, height * 0.7, '#3b82f6', 'home', false, width, height, rinkPadding, 'Hráč 3', 5, false, 5, 5),
        new Player(width * 0.35, height * 0.4, '#60a5fa', 'home', false, width, height, rinkPadding, 'Hráč 4', 5, false, 5, 5),
        new Player(width * 0.35, height * 0.6, '#60a5fa', 'home', false, width, height, rinkPadding, 'Hráč 5', 5, false, 5, 5),
        
        new Player(width * 0.8, height * 0.3, '#f87171', 'away', false, width, height, rinkPadding, 'Hráč 6', 5, false, 5, 5),
        new Player(width * 0.8, height * 0.5, '#f87171', 'away', false, width, height, rinkPadding, 'Hráč 7', 5, false, 5, 5),
        new Player(width * 0.8, height * 0.7, '#f87171', 'away', false, width, height, rinkPadding, 'Hráč 8', 5, false, 5, 5),
        new Player(width * 0.65, height * 0.4, '#ef4444', 'away', false, width, height, rinkPadding, 'Hráč 9', 5, false, 5, 5),
        new Player(width * 0.65, height * 0.6, '#ef4444', 'away', false, width, height, rinkPadding, 'Hráč 10', 5, false, 5, 5),
      ];
      
      defaultPlayers.forEach((player, idx) => {
        player.position = idx === 1 || idx === 6 ? 'goalie' : (idx < 5 ? 'forward' : 'defender');
        
        if (idx !== 1) {
          player.ai = new PlayerAI(player);
          const baseSpeed = player.attr.getSpeedMultiplier();
          const baseAccel = player.attr.getAccelerationMultiplier();
          player.physics.initializePhysics(
            baseSpeed * player.ai.speedMultiplier,
            baseAccel * player.ai.speedMultiplier
          );
        }
        
        if (player.position === 'goalie') {
          player.faceoffPosition = {
            x: player.team === 'home' ? width * 0.12 : width * 0.88,
            y: centerY
          };
        } else {
          player.faceoffPosition = {
            x: player.team === 'home' ? centerX - 50 : centerX + 50,
            y: centerY
          };
        }
      });
      
      players.push(...defaultPlayers);
    }

    const homeScore = { value: 0 };
    const awayScore = { value: 0 };
    const controlledPlayer = players.find(p => p.isControlled);

    faceoffManager.resetToCenterFaceoff(players);

    // ==========================================
    // POMOCNÉ FUNKCE
    // ==========================================
    
    function checkAllPlayersInPosition() {
      return players.every(player => {
        if (!player.faceoffPosition) return true;
        const dx = player.faceoffPosition.x - player.physics.x;
        const dy = player.faceoffPosition.y - player.physics.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 10;
      });
    }

    function checkRefereeCollision(player, referee) {
      const dx = referee.x - player.physics.x;
      const dy = referee.y - player.physics.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = player.physics.radius + referee.radius + 10;
      
      if (distance < minDist && distance > 0) {
        const pushX = (dx / distance) * -20;
        const pushY = (dy / distance) * -20;
        return { x: pushX, y: pushY };
      }
      return null;
    }

    function checkPlayerCollisions(player, allPlayers) {
      let totalPushX = 0;
      let totalPushY = 0;
      
      allPlayers.forEach(other => {
        if (other === player) return;
        
        const dx = other.physics.x - player.physics.x;
        const dy = other.physics.y - player.physics.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = player.physics.radius + other.physics.radius + 5;
        
        if (distance < minDist && distance > 0) {
          const pushX = (dx / distance) * -15;
          const pushY = (dy / distance) * -15;
          totalPushX += pushX;
          totalPushY += pushY;
        }
      });
      
      if (totalPushX !== 0 || totalPushY !== 0) {
        return { x: totalPushX, y: totalPushY };
      }
      return null;
    }

    function makeRefereeAvoidPlayers() {
      players.forEach(player => {
        const dx = player.physics.x - referee.x;
        const dy = player.physics.y - referee.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = player.physics.radius + referee.radius + 30;
        
        if (distance < minDist && distance > 0) {
          const pushX = (dx / distance) * -0.5;
          const pushY = (dy / distance) * -0.5;
          referee.x += pushX;
          referee.y += pushY;
        }
      });
    }

    function celebrateInPlace(player, deltaTime) {
      player.physics.vx *= 0.95;
      player.physics.vy *= 0.95;
      
      const celebrationSpeed = 2;
      player.physics.vy += Math.sin(Date.now() * 0.01) * celebrationSpeed * deltaTime;
      
      player.update({}, deltaTime);
    }

    function getBenchParadePosition(player, team, progress) {
      const benchY = height * 0.5;
      const startX = player.team === 'home' ? width * 0.2 : width * 0.8;
      const endX = player.team === 'home' ? width * 0.4 : width * 0.6;
      
      const x = startX + (endX - startX) * progress;
      const offsetY = Math.sin(progress * Math.PI * 2) * 30;
      
      return { x, y: benchY + offsetY };
    }

    function moveTowardsBench(player, deltaTime) {
      const benchY = height * 0.5;
      const benchX = player.team === 'home' ? width * 0.3 : width * 0.7;
      
      const dx = benchX - player.physics.x;
      const dy = benchY - player.physics.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5 && player.ai) {
        const inputX = dx / distance;
        const inputY = dy / distance;
        
        player.ai.virtualKeys = {};
        if (inputX > 0.3) player.ai.virtualKeys['ArrowRight'] = true;
        if (inputX < -0.3) player.ai.virtualKeys['ArrowLeft'] = true;
        if (inputY > 0.3) player.ai.virtualKeys['ArrowDown'] = true;
        if (inputY < -0.3) player.ai.virtualKeys['ArrowUp'] = true;
        
        player.update(player.ai.virtualKeys, deltaTime);
      }
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.width === 0 || rect.height === 0) {
        return;
      }
      mousePosition.current = {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height
      };
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        keysPressed.current['Space'] = true;
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) {
        keysPressed.current['Space'] = false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      if (!controlledPlayer) return;
      
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.width === 0 || rect.height === 0) {
        return;
      }
      
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const mouseY = ((e.clientY - rect.top) / rect.height) * height;
      
      if (controlledPlayer.actions.isChargingCheck) {
        controlledPlayer.releaseCheck(players);
      } else {
        controlledPlayer.startChargingCheck(mouseX, mouseY);
      }
    };

    const handleCanvasClick = (e) => {
      if (currentGamePhase !== 'faceoff_active') return;
      if (!faceoffSystem.isActive()) return;
      
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.width === 0 || rect.height === 0) {
        return;
      }
      
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const mouseY = ((e.clientY - rect.top) / rect.height) * height;
      
      if (controlledPlayer) {
        faceoffSystem.playerAttempt(controlledPlayer, mouseX, mouseY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('click', handleCanvasClick);

    let lastFrameTime = Date.now();
    let fpsHistory = [];
    let fpsUpdateTimer = 0;

    function animate() {
      if (!canvas) return;
      if (!canvas.width || !canvas.height || canvas.width === 0 || canvas.height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // ✅ KONTROLA: Všechny klíčové hodnoty musí být platné čísla
      if (!isFinite(width) || !isFinite(height) || !isFinite(rinkPadding) || 
          !isFinite(rinkWidth) || !isFinite(rinkHeight)) {
        console.warn('⚠️ Neplatné hodnoty pro vykreslování, přeskakuji frame');
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 1/30);
      lastFrameTime = currentTime;

      const currentFps = Math.round(1 / deltaTime);
      fpsHistory.push(currentFps);
      if (fpsHistory.length > 10) fpsHistory.shift();
      
      fpsUpdateTimer += deltaTime;
      if (fpsUpdateTimer > 0.5) {
        const avgFps = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
        setFps(avgFps);
        fpsUpdateTimer = 0;
      }

      // ==========================================
      // GAME PHASE LOGIC
      // ==========================================
      
      if (currentGamePhase === 'positioning') {
        players.forEach(player => {
          if (!player.faceoffPosition) return;
          
          const refAvoidance = checkRefereeCollision(player, referee);
          const playerAvoidance = checkPlayerCollisions(player, players);
          
          let targetX = player.faceoffPosition.x;
          let targetY = player.faceoffPosition.y;
          
          if (refAvoidance) {
            targetX += refAvoidance.x;
            targetY += refAvoidance.y;
          }
          
          if (playerAvoidance) {
            targetX += playerAvoidance.x;
            targetY += playerAvoidance.y;
          }
          
          const dx = targetX - player.physics.x;
          const dy = targetY - player.physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) {
            if (player.ai) {
              const inputX = dx / distance;
              const inputY = dy / distance;
              
              player.ai.virtualKeys = {};
              if (inputX > 0.3) player.ai.virtualKeys['ArrowRight'] = true;
              if (inputX < -0.3) player.ai.virtualKeys['ArrowLeft'] = true;
              if (inputY > 0.3) player.ai.virtualKeys['ArrowDown'] = true;
              if (inputY < -0.3) player.ai.virtualKeys['ArrowUp'] = true;
              
              player.update(player.ai.virtualKeys, deltaTime);
            } else {
              player.update(keysPressed.current, deltaTime);
            }
          }
        });
        
        makeRefereeAvoidPlayers();
        
        if (checkAllPlayersInPosition()) {
          console.log('✅ Všichni hráči na pozicích! Countdown...');
          currentGamePhase = 'countdown';
          setGamePhase('countdown');
          countdownTimer = 0;
          currentCountdown = 3;
        }
      }
      
      else if (currentGamePhase === 'countdown') {
        countdownTimer += deltaTime;
        
        players.forEach(player => {
          player.physics.vx *= 0.9;
          player.physics.vy *= 0.9;
          player.update({}, deltaTime);
        });
        
        if (countdownTimer >= 1.0) {
          currentCountdown--;
          countdownTimer = 0;
          
          if (currentCountdown === 0) {
            console.log('🏒 ZAČÍNÁ HRA!');
            currentGamePhase = 'referee_skating';
            setGamePhase('referee_skating');
            
            const faceoffSpot = faceoffManager.currentFaceoffSpot;
            if (faceoffSpot) {
              referee.skateToPosition(faceoffSpot.x, faceoffSpot.y);
            } else {
              referee.skateToCenter();
            }
          }
        }
      }
      
      else if (currentGamePhase === 'referee_skating') {
        referee.update(deltaTime);
        
        players.forEach(player => {
          if (!player.faceoffPosition) return;
          
          const dx = player.faceoffPosition.x - player.physics.x;
          const dy = player.faceoffPosition.y - player.physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            if (player.ai) {
              const inputX = dx / distance;
              const inputY = dy / distance;
              
              player.ai.virtualKeys = {};
              if (inputX > 0.3) player.ai.virtualKeys['ArrowRight'] = true;
              if (inputX < -0.3) player.ai.virtualKeys['ArrowLeft'] = true;
              if (inputY > 0.3) player.ai.virtualKeys['ArrowDown'] = true;
              if (inputY < -0.3) player.ai.virtualKeys['ArrowUp'] = true;
              
              player.update(player.ai.virtualKeys, deltaTime);
            } else {
              player.update(keysPressed.current, deltaTime);
            }
          } else {
            player.physics.vx *= 0.9;
            player.physics.vy *= 0.9;
            player.update({}, deltaTime);
          }
        });
        
        if (referee.hasArrived) {
          console.log('👨‍⚖️ Rozhodčí je na místě! DROP...');
          currentGamePhase = 'referee_drop';
          setGamePhase('referee_drop');
        }
      }
      
      else if (currentGamePhase === 'referee_drop') {
        referee.update(deltaTime);
        
        players.forEach(player => {
          player.physics.vx *= 0.95;
          player.physics.vy *= 0.95;
          player.update({}, deltaTime);
        });
        
        if (referee.isReadyToDrop) {
          console.log('🏒 VHAZOVÁNÍ!');
          currentGamePhase = 'faceoff_active';
          setGamePhase('faceoff_active');
          
          const faceoffSpot = faceoffManager.currentFaceoffSpot;
          faceoffSystem.start(players, faceoffSpot, puck);
        }
      }
      
      else if (currentGamePhase === 'faceoff_active') {
        faceoffSystem.update(deltaTime, players);
        referee.update(deltaTime);
        
        if (faceoffSystem.isComplete()) {
          console.log('🎯 Vhazování dokončeno! Puk je volný!');
          currentGamePhase = 'playing';
          setGamePhase('playing');
          puckDropGracePeriod = 0.5;
          referee.state = 'skating_away';
          referee.targetX = referee.watchingPositionX;
          referee.targetY = referee.watchingPositionY;
        }
      }
      
      else if (currentGamePhase === 'playing') {
        if (!isPaused) {
          currentGameTime -= deltaTime;
          if (currentGameTime <= 0) currentGameTime = 0;
          setGameTime(currentGameTime);
        }
        
        if (puckDropGracePeriod > 0) {
          puckDropGracePeriod -= deltaTime;
        }
        
        players.forEach(player => {
          const gameState = { puck, players, currentGamePhase };
          
          if (player.ai) {
            player.ai.decide(gameState, deltaTime);
            player.update(player.ai.virtualKeys, deltaTime);
          } else {
            player.update(keysPressed.current, deltaTime);
          }
          
          if (player.actions.hasPuck) {
            puck.x = player.physics.x;
            puck.y = player.physics.y;
          }
        });
        
        puck.update(deltaTime);
        referee.update(deltaTime);
        
        const goalScored = puck.checkGoal(width, height, rinkPadding);
        if (goalScored && puckDropGracePeriod <= 0) {
          console.log(`🎉 GÓL! ${goalScored === 'home' ? 'DOMÁCÍ' : 'HOSTÉ'} skórovali!`);
          
          if (goalScored === 'home') {
            homeScore.value++;
          } else {
            awayScore.value++;
          }
          setScore({ home: homeScore.value, away: awayScore.value });
          
          scoringTeam = goalScored;
          celebrationTimer = 0;
          currentGamePhase = 'goal_celebration';
          setGamePhase('goal_celebration');
          
          referee.state = 'skating_to_puck';
          referee.targetX = puck.x;
          referee.targetY = puck.y;
        }
        
        const offsideResult = offsideDetector.checkOffside(puck, players);
        if (offsideResult.isOffside && puckDropGracePeriod <= 0) {
          console.log('🚨 OFFSIDE!');
          currentGamePhase = 'offside_celebration';
          setGamePhase('offside_celebration');
          celebrationTimer = 0;
          
          referee.state = 'skating_to_puck';
          referee.targetX = puck.x;
          referee.targetY = puck.y;
        }
      }
      
      else if (currentGamePhase === 'goal_celebration') {
        celebrationTimer += deltaTime;
        
        const winningTeam = players.filter(p => p.team === scoringTeam && p.position !== 'goalie');
        const losingTeam = players.filter(p => p.team !== scoringTeam && p.position !== 'goalie');
        
        winningTeam.forEach(player => {
          celebrateInPlace(player, deltaTime);
        });
        
        losingTeam.forEach(player => {
          player.physics.vx *= 0.95;
          player.physics.vy *= 0.95;
          player.update({}, deltaTime);
        });
        
        players.filter(p => p.position === 'goalie').forEach(player => {
          player.physics.vx *= 0.9;
          player.physics.vy *= 0.9;
          player.update({}, deltaTime);
        });
        
        referee.update(deltaTime);
        if (referee.hasPuck && puck.visible) {
          puck.visible = false;
        }
        
        const canProceed = referee.hasPuck && celebrationTimer > 2.0;
        
        if (canProceed) {
          console.log('🎉 Jízda kolem střídačky!');
          currentGamePhase = 'goal_bench_parade';
          setGamePhase('goal_bench_parade');
          celebrationTimer = 0;
          
          referee.skateToPosition(referee.watchingPositionX, referee.watchingPositionY);
        }
      }
      
      else if (currentGamePhase === 'goal_bench_parade') {
        celebrationTimer += deltaTime;
        const progress = Math.min(celebrationTimer / 3.0, 1.0);
        
        const winningTeam = players.filter(p => p.team === scoringTeam && p.position !== 'goalie');
        const losingTeam = players.filter(p => p.team !== scoringTeam && p.position !== 'goalie');
        
        winningTeam.forEach(player => {
          const benchPos = getBenchParadePosition(player, winningTeam, progress);
          
          const dx = benchPos.x - player.physics.x;
          const dy = benchPos.y - player.physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5 && player.ai) {
            const inputX = dx / distance;
            const inputY = dy / distance;
            
            player.ai.virtualKeys = {};
            if (inputX > 0.3) player.ai.virtualKeys['ArrowRight'] = true;
            if (inputX < -0.3) player.ai.virtualKeys['ArrowLeft'] = true;
            if (inputY > 0.3) player.ai.virtualKeys['ArrowDown'] = true;
            if (inputY < -0.3) player.ai.virtualKeys['ArrowUp'] = true;
            
            player.update(player.ai.virtualKeys, deltaTime);
          } else {
            player.update(keysPressed.current, deltaTime);
          }
        });
        
        losingTeam.forEach(player => {
          moveTowardsBench(player, deltaTime);
        });
        
        players.filter(p => p.position === 'goalie').forEach(player => {
          player.physics.vx *= 0.95;
          player.physics.vy *= 0.95;
          player.update({}, deltaTime);
        });
        
        referee.update(deltaTime);
        
        if (progress >= 1.0) {
          console.log('📍 Hráči jedou na pozice...');
          currentGamePhase = 'goal_positioning';
          setGamePhase('goal_positioning');
          celebrationTimer = 0;
          
          faceoffManager.resetToCenterFaceoff(players);
        }
      }
      
      else if (currentGamePhase === 'goal_positioning') {
        celebrationTimer += deltaTime;
        
        players.forEach(player => {
          if (!player.faceoffPosition) return;
          
          const dx = player.faceoffPosition.x - player.physics.x;
          const dy = player.faceoffPosition.y - player.physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) {
            if (player.ai) {
              const inputX = dx / distance;
              const inputY = dy / distance;
              
              player.ai.virtualKeys = {};
              if (inputX > 0.3) player.ai.virtualKeys['ArrowRight'] = true;
              if (inputX < -0.3) player.ai.virtualKeys['ArrowLeft'] = true;
              if (inputY > 0.3) player.ai.virtualKeys['ArrowDown'] = true;
              if (inputY < -0.3) player.ai.virtualKeys['ArrowUp'] = true;
              
              player.update(player.ai.virtualKeys, deltaTime);
            } else {
              player.update(keysPressed.current, deltaTime);
            }
          }
        });
        
        referee.update(deltaTime);
        
        const allPositioned = checkAllPlayersInPosition();
        const enoughTime = celebrationTimer > 1.0;
        
        if (allPositioned && enoughTime) {
          console.log('👨‍⚖️ Rozhodčí jede vhazovat...');
          currentGamePhase = 'referee_skating';
          setGamePhase('referee_skating');
          
          const faceoffSpot = faceoffManager.currentFaceoffSpot;
          if (faceoffSpot) {
            referee.skateToPosition(faceoffSpot.x, faceoffSpot.y);
          } else {
            referee.skateToCenter();
          }
        }
      }
      
      else if (currentGamePhase === 'offside_celebration') {
        celebrationTimer += deltaTime;
        
        players.forEach(player => {
          player.physics.vx *= 0.95;
          player.physics.vy *= 0.95;
          player.update({}, deltaTime);
        });
        
        referee.update(deltaTime);
        
        if (referee.hasPuck && puck.visible) {
          puck.visible = false;
        }
        
        if (referee.hasPuck && celebrationTimer > 1.5) {
          console.log('📍 OFFSIDE - Hráči jedou na pozice...');
          currentGamePhase = 'offside_positioning';
          setGamePhase('offside_positioning');
          celebrationTimer = 0;
          
          const offsideResult = offsideDetector.checkOffside(puck, players);
          const faceoffX = offsideResult.violatingTeam === 'home' ? width * 0.35 : width * 0.65;
          const faceoffY = centerY;
          
          faceoffManager.setFaceoffSpot({ x: faceoffX, y: faceoffY, name: 'Modrá čára' });
          faceoffManager.assignPositionsToPlayers(players, { x: faceoffX, y: faceoffY });
          
          referee.skateToPosition(referee.watchingPositionX, referee.watchingPositionY);
        }
      }
      
      else if (currentGamePhase === 'offside_positioning') {
        celebrationTimer += deltaTime;
        
        players.forEach(player => {
          if (!player.faceoffPosition) return;
          
          const dx = player.faceoffPosition.x - player.physics.x;
          const dy = player.faceoffPosition.y - player.physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) {
            if (player.ai) {
              const inputX = dx / distance;
              const inputY = dy / distance;
              
              player.ai.virtualKeys = {};
              if (inputX > 0.3) player.ai.virtualKeys['ArrowRight'] = true;
              if (inputX < -0.3) player.ai.virtualKeys['ArrowLeft'] = true;
              if (inputY > 0.3) player.ai.virtualKeys['ArrowDown'] = true;
              if (inputY < -0.3) player.ai.virtualKeys['ArrowUp'] = true;
              
              player.update(player.ai.virtualKeys, deltaTime);
            } else {
              player.update(keysPressed.current, deltaTime);
            }
          }
        });
        
        referee.update(deltaTime);
        
        const allPositioned = checkAllPlayersInPosition();
        const enoughTime = celebrationTimer > 1.0;
        
        if (allPositioned && enoughTime) {
          console.log('👨‍⚖️ Rozhodčí jede vhazovat...');
          currentGamePhase = 'referee_skating';
          setGamePhase('referee_skating');
          
          const faceoffSpot = faceoffManager.currentFaceoffSpot;
          if (faceoffSpot) {
            referee.skateToPosition(faceoffSpot.x, faceoffSpot.y);
          } else {
            referee.skateToCenter();
          }
        }
      }

      // ==========================================
      // DRAWING
      // ==========================================
      
      ctx.clearRect(0, 0, width, height);
      
      drawRink(ctx, width, height, rinkPadding, rinkWidth, rinkHeight);
      
      if (puck.visible) {
        puck.draw(ctx);
      }
      
      players.forEach(player => {
        if (showDebugAI && player.ai) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(player.physics.x, player.physics.y);
          ctx.lineTo(puck.x, puck.y);
          ctx.stroke();
          ctx.restore();
        }
        
        player.draw(ctx, mousePosition.current);
      });
      
      referee.draw(ctx);
      
      if (faceoffSystem.isActive()) {
        faceoffSystem.draw(ctx, width, height, controlledPlayer, mousePosition.current.x, mousePosition.current.y);
      }

      // Phase overlays
      if (currentGamePhase === 'countdown') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = 'bold 120px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentCountdown > 0 ? currentCountdown : 'START!', centerX, centerY);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'positioning') {
        ctx.save();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📍 Jdi na pozici!', centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'goal_celebration') {
        ctx.save();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const teamName = scoringTeam === 'home' ? 'DOMÁCÍ' : 'HOSTÉ';
        ctx.fillText(`🎉 GÓL! ${teamName} SKÓROVALI!`, centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'goal_bench_parade') {
        ctx.save();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎉 Vítězný tým jedou kolem střídačky!', centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'goal_positioning') {
        ctx.save();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📍 Hráči jedou na pozice...', centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'offside_celebration') {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚨 OFFSIDE! Rozhodčí jde pro puk...', centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'offside_positioning') {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚨 OFFSIDE! Jdi na pozici u modré čáry!', centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'referee_skating') {
        ctx.save();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👨‍⚖️ Rozhodčí jede na vhazování...', centerX, 30);
        ctx.restore();
      }
      
      else if (currentGamePhase === 'referee_drop') {
        ctx.save();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.fillRect(0, 0, width, 60);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👨‍⚖️ VHAZOVÁNÍ: Připrav se!', centerX, 30);
        ctx.restore();
      }

      else if (currentGamePhase === 'faceoff_active') {
        ctx.save();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.fillRect(0, 0, width, 80);
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏒 BULY - Sleduj timing bar a klikni!', centerX, 40);
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [isPaused, showDebugAI, canvasRef, setScore, setGameTime, setFps, setGamePhase]);
}
