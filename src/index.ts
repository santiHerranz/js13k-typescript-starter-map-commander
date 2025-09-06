import { drawEngine } from './core/draw-engine';
import { menuState } from './game-states/menu.state';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { gameState } from './game-states/game.state';

export var time = 0;
const FPS = 60;
export var frame = 0;

// createGameStateMachine(menuState);
createGameStateMachine(gameState);

let previousTime = 0;
const interval = 1000 / 60;

(function draw(currentTime: number) {
  const delta = currentTime - previousTime;

  if (delta >= interval) {
    previousTime = currentTime - (delta % interval);

    controls.queryController();
    // Clear with identity transform to avoid flicker during active transforms
    drawEngine.context.save();
    drawEngine.context.setTransform(1, 0, 0, 1, 0, 0);
    drawEngine.context.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
    drawEngine.context.restore();
    // Although the game is currently set at 60fps, the state machine accepts a time passed to onUpdate
    // If you'd like to unlock the framerate, you can instead use an interval passed to onUpdate to 
    // adjust your physics so they are consistent across all frame rates.
    // If you do not limit your fps or account for the interval your game will be far too fast or far too 
    // slow for anyone with a different refresh rate than you.
    gameStateMachine.getState().onUpdate(delta);
  }
  requestAnimationFrame(draw);
})(0);
