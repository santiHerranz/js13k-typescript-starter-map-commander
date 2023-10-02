import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';
import { Camera } from '@/core/camera';
import { Vector } from '@/core/vector';
import { inputMouse } from '@/core/input-mouse';
import { rand } from '@/utils';

class GameState implements State {

  mapImage = new Image();
  
  ballImage = new Image();
  ballSize = 50;
  ballPosition = new DOMPoint(100, 100);
  ballVelocity = new DOMPoint(50, 50);


  _cam: Camera;

  public mouseDragStart: any; // cameraDragStart
  public mouseDragged: boolean = false;
  
  lastScale: number = 1;


  
  constructor() {
    this.ballImage.src = 'ball.png';

    this.mapImage.src = 'map.jpg';

    this._cam = new Camera(1920, 1080);
    this._cam._lookat = new Vector(1920 / 2, 1080 / 2)

  }

  // Make sure ball starts at the same spot when game is entered
  onEnter() {
    this.ballPosition = new DOMPoint(drawEngine.canvasWidth/2, drawEngine.canvasHeight/2);
    this.ballVelocity = new DOMPoint(rand(-50,50), rand(-50,50));

    inputMouse.eventMouseDown = () => { this.mouseDown(); }
    inputMouse.eventMouseMove = () => { this.mouseMove(); }
    inputMouse.eventMouseUp = () => { this.mouseUp(); }
    inputMouse.eventMouseScroll = (scale) => { this.mouseScroll(scale); }    
  }

  onUpdate(dt: number) {
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

    drawEngine.context.fillStyle = 'black';
    drawEngine.context.fillRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);


    this._cam._update(dt);
    this._cam._begin(drawEngine.context);


    drawEngine.context.drawImage(this.mapImage, 0, 0, 1920, 1080);

    drawEngine.context.drawImage(this.ballImage, this.ballPosition.x, this.ballPosition.y, this.ballSize, this.ballSize);

    this._cam._end(drawEngine.context);    



    // CURSOR screen
    drawEngine.drawCircle(inputMouse.pointer.Position, 60)


    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }
  }


  mouseDown() {

    if (inputMouse.pointer.leftButton) {
      this._cam._shake(200)
    }

    if (inputMouse.pointer.middleButton) {
      this.mouseDragStart = { x: inputMouse.lastX, y: inputMouse.lastY };
      this.mouseDragged = false;
    }
  }

  mouseMove() {

    if (inputMouse.pointer.middleButton) {
      this.mouseDragged = true;
      if (this.mouseDragStart) {
        let start = new Vector(this.mouseDragStart.x, this.mouseDragStart.y)
        let last = new Vector(inputMouse.lastX, inputMouse.lastY)

        this._cam._move((start.x - last.x) * inputMouse.scale, (start.y - last.y) * inputMouse.scale )

        this.mouseDragStart = { x: inputMouse.lastX, y: inputMouse.lastY };
      }
    }

  }

  mouseUp() {
    if (inputMouse.pointer.middleButton) {
      this.mouseDragStart = null;
    }
  }

  mouseScroll( scale: number) {

    let dir = -1
    if (this.lastScale > inputMouse.scale) dir = 1

    this._cam._lookat.add(inputMouse.pointer.Position.clone().subtract(new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2)).scale(.2 / scale).scale(dir))

    this.lastScale = inputMouse.scale
  }

}

export const gameState = new GameState();
