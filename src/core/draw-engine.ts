import { Vector } from "./vector";

class DrawEngine {

  context: CanvasRenderingContext2D;
  _storedTransform

  constructor() {
    this.context = c2d.getContext('2d');
    this._storedTransform = this.context.getTransform();
    // Disable smoothing to reduce shimmering/flicker on scaled content
    this.context.imageSmoothingEnabled = false;
    // Lower quality to be explicit; has effect on some browsers
    // Note: UI text remains crisp because it's drawn at identity transform
    // and not affected by image smoothing settings for drawImage.
    // This also keeps pixel-art look for the map image.
    // If you need smoothing, set to true and adjust pan rounding.
    // @ts-ignore - some engines may not support this property
    this.context.imageSmoothingQuality = 'low';
  }

  get canvasWidth() {
    return this.context.canvas.width;
  }

  get canvasHeight() {
    return this.context.canvas.height;
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    const context = this.context;

    context.font = `${fontSize}px Impact, sans-serif-black`;
    context.textAlign = textAlign;
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.strokeText(text, x, y);
    context.fillStyle = color;
    context.fillText(text, x, y);
  }

  drawCircle(position: Vector, size: number = 10, options = { stroke: 'white', fill: '', lineWidth : 3 }) {
    const ctx = this.context;

    ctx.beginPath();

    ctx.strokeStyle = options.stroke
    ctx.lineWidth = options.lineWidth;
    ctx.arc(position.x, position.y, size / 2, 0, 2 * Math.PI);
    ctx.stroke();

    if (options.fill != '') {
      ctx.fillStyle = options.fill
      ctx.arc(position.x, position.y, size / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }


  restoreTransform() {
    this.context.setTransform(this._storedTransform)
  }
  resetTransform() {
    this.context.resetTransform()
  }
  saveTransform() {
    this._storedTransform = this.context.getTransform()
  }

}

export const drawEngine = new DrawEngine();
