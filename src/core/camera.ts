import { M, rect, rndPN } from "@/utils";
import { Vector } from "./vector";
import { inputMouse } from "./input-mouse";
import { drawEngine } from "./draw-engine";

export class Camera {

  public _scaleValue: number = 1;


  public _lookat: Vector = new Vector(1920/2, 1080/2);
  public _vpRect = new rect(0, 0, 0, 0);
  public _vpScale = new Vector(1, 1);

  public _viewportWidth: number;
  public _viewportHeight: number;
  public _aspectRatio: number;

  public _shakeValue: number;

  currentTransformedCursorValue = new Vector(0, 0)
  lastScalePosition = new Vector(1920 / 2, 1080 / 2)

  constructor(viewportWidth: number, viewportHeight: number) {
    this._shakeValue = 0;
    this._updateViewPort();

    // viewport dimentions
    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;
    // aspect ratio
    this._aspectRatio = viewportWidth / viewportHeight;

  }

  _shake(time: number) {
    this._shakeValue = time
  }

  _begin(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._scale(ctx);
  }

  _end(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  _scale(ctx: CanvasRenderingContext2D) {


    // move to center point
    ctx.translate(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2);

    // ctx.rotate(Math.PI/10000*time)

    // move to anchor point
    ctx.translate((drawEngine.canvasWidth / 2 - this._vpRect.center.x), (drawEngine.canvasHeight / 2 - this._vpRect.center.y));

    // scale
    ctx.scale(1 / inputMouse.scale, 1 / inputMouse.scale);

    // undo move to center point
    ctx.translate(-drawEngine.canvasWidth / 2, -drawEngine.canvasHeight / 2);

    // undo move to anchor point
    ctx.translate(-1 / 2 * inputMouse.scale * (drawEngine.canvasWidth / 2 - this._vpRect.center.x), -1 / 2 * inputMouse.scale  * (drawEngine.canvasHeight / 2 - this._vpRect.center.y));

  }


  _update(dt: number) {
    this._shakeValue = M.max(this._shakeValue - dt, 0);

    this._updateViewPort();
  }

  // _update viewport
  _updateViewPort() {

    let areaWidth = 1920 * inputMouse.scale // * Math.sin(this._fov) 

    this._vpRect.set(
      this._lookat.x + (this._shakeValue ? rndPN() * 6 : 0),
      this._lookat.y + (this._shakeValue ? rndPN() * 6 : 0),
      areaWidth,
      areaWidth / this._aspectRatio
    );


    this._vpScale.x = this._viewportWidth / areaWidth;
    this._vpScale.y = this._viewportHeight / areaWidth * this._aspectRatio;

  }




  _move(x: number, y: number) {

    let current = this._lookat._copy()

    var bMid = this._vpRect.center;
    var diff = Vector._subtract(new Vector(x, y), bMid);

    diff._add(current)
    var d = diff._magnitude();
    if (d > .0001) {
      this._lookat._add(diff.scale(2 / inputMouse.scale));
    }

  }

  // Convert coordinates from Screen space to World space
  screenToWorld(screen: Vector) {
    let world = new Vector();
    world.x = screen.x / inputMouse.scale + this._vpRect._left;
    world.y = screen.y / inputMouse.scale + this._vpRect._top;
    return world;
  }

  // Convert coordinates from World space to Screen space
  worldToScreen(world: Vector) {
    let screen = new Vector();
    screen.x = (world.x - this._vpRect._left) * inputMouse.scale;
    screen.y = (world.y - this._vpRect._top) * inputMouse.scale;
    return screen;
  }
}



function getTransformedPoint(context: CanvasRenderingContext2D, x: number, y: number) {
  const originalPoint = new DOMPoint(x, y);
  return context.getTransform().invertSelf().transformPoint(originalPoint);
}
