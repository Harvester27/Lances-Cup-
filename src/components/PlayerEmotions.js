// PlayerEmotions.js - Emoce a výrazy hráče

export class PlayerEmotions {
  constructor(player) {
    this.player = player;
    
    // Stavy hráče
    this.playerState = 'normal'; // normal, stunned, knocked_down
    this.recoveryTimer = 0;
    this.canBeChecked = true;
    
    // Výrazy obličeje
    this.faceExpression = 'normal'; // normal, pain, stunned, ko, aggressive
    
    // 🙌 Animace dlaní při bodčeku
    this.checkAnimationTimer = 0;
    this.checkAnimationDuration = 0.3; // 300ms
    this.checkAnimationAngle = 0;
  }

  update(deltaTime) {
    // 🙌 Update animace dlaní
    if (this.checkAnimationTimer > 0) {
      this.checkAnimationTimer -= deltaTime;
      if (this.checkAnimationTimer < 0) this.checkAnimationTimer = 0;
    }
    
    // Recovery timer
    if (this.recoveryTimer > 0) {
      this.recoveryTimer -= deltaTime;
      if (this.recoveryTimer <= 0) {
        this.recover();
      }
    }
  }

  recover() {
    this.recoveryTimer = 0;
    this.playerState = 'normal';
    this.faceExpression = 'normal';
    this.canBeChecked = true;
    console.log('✅', this.player.attr.name, 'recovered!');
  }

  setExpression(expression, duration = null) {
    this.faceExpression = expression;
    
    if (duration) {
      setTimeout(() => {
        if (this.faceExpression === expression) {
          this.faceExpression = 'normal';
        }
      }, duration);
    }
  }

  startCheckAnimation(angle) {
    this.checkAnimationTimer = this.checkAnimationDuration;
    this.checkAnimationAngle = angle;
  }

  setState(state, recoveryTime) {
    this.playerState = state;
    this.recoveryTimer = recoveryTime;
    
    if (state === 'knocked_down') {
      this.canBeChecked = false;
      this.faceExpression = state === 'knocked_down' ? 'ko' : 'stunned';
    } else if (state === 'stunned') {
      this.faceExpression = 'pain';
    }
  }

  isActive() {
    return this.playerState === 'normal';
  }

  isStunned() {
    return this.playerState === 'stunned';
  }

  isKnockedDown() {
    return this.playerState === 'knocked_down';
  }
}
