import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';
import { inputMouse } from '@/core/input-mouse';
import { FPSCounter } from '@/utils/fps-counter';

class GameState implements State {

  mapImage = new Image();

  ballImage = new Image();
  ballSize = 100;
  ballPosition = new DOMPoint(100, 100);
  ballVelocity = new DOMPoint(10, 10);

  // FPS Counter for performance monitoring
  fpsCounter = new FPSCounter();

  constructor() {

    this.mapImage.src = 'map.jpg';

    this.ballImage.src = 'ball.png';
  }

  // Make sure ball starts at the same spot when game is entered
  onEnter() {
    this.ballPosition = new DOMPoint(100, 100);
    this.ballVelocity = new DOMPoint(10, 10);
  }

  onUpdate() {
    // Update FPS counter
    this.fpsCounter.update();
    
    // Update velocity from controller
    this.ballVelocity.x += controls.inputDirection.x;
    this.ballVelocity.y += controls.inputDirection.y;

    // Check collisions with edges of map
    if (this.ballPosition.x + this.ballSize > drawEngine.canvasWidth || this.ballPosition.x <= 0) {
      this.ballVelocity.x *= -1;
    }

    if (this.ballPosition.y + this.ballSize > drawEngine.canvasHeight || this.ballPosition.y <= 0) {
      this.ballVelocity.y *= -1;
    }

    this.ballPosition.x += this.ballVelocity.x;
    this.ballPosition.y += this.ballVelocity.y;

    // Apply Drag
    this.ballVelocity.x *= 0.99;
    this.ballVelocity.y *= 0.99;

    // Clear background in screen space (identity transform)
    drawEngine.context.save();
    drawEngine.context.setTransform(1, 0, 0, 1, 0, 0);
    drawEngine.context.fillStyle = 'blue';
    drawEngine.context.fillRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
    drawEngine.context.restore();

    // Apply camera transform for world rendering
    const panXRounded = Math.round(inputMouse.info.panX);
    const panYRounded = Math.round(inputMouse.info.panY);
    drawEngine.context.setTransform(
      inputMouse.info.scale, 0,
      0, inputMouse.info.scale,
      panXRounded, panYRounded
    );

    drawEngine.context.drawImage(this.mapImage, 0, 0, 1920, 1080);


    drawEngine.context.drawImage(this.ballImage, this.ballPosition.x, this.ballPosition.y, this.ballSize, this.ballSize);


    drawEngine.saveTransform()
    drawEngine.resetTransform()

    // UI
    drawEngine.drawText('zoom: ' + inputMouse.info.scale.toFixed(2), 50, drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2)
    
    // FPS indicator in top-left corner
    drawEngine.drawText('FPS: ' + this.fpsCounter.getFPSString(1), 30, 80, 40, 'yellow', 'left')


    // CURSOR (draw in screen space for accuracy)
    drawEngine.saveTransform()
    drawEngine.resetTransform()
    drawEngine.drawCircle(inputMouse.pointer.Screen, 60)
    drawEngine.restoreTransform()


    drawEngine.restoreTransform()

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }
  }
}

export const gameState = new GameState();
