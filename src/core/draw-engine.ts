import { Vector } from "./vector";

class DrawEngine {
  context: CanvasRenderingContext2D;

  constructor() {
    this.context = c2d.getContext('2d');
  }

  get canvasWidth() {
    return this.context.canvas.width;
  }

  get canvasHeight() {
    return this.context.canvas.height;
  }

  
  drawLine(position: Vector, destination: Vector, options = { stroke: `rgba(127,255,212,0.85)`, fill: '' }) {
    const ctx = this.context;

    ctx.beginPath();
    ctx.strokeStyle = options.stroke //`rgba(127,255,212,0.85)`;
    ctx.lineWidth = 3;
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(destination.x, destination.y);
    ctx.stroke();
  }

  
  drawRectangle(position: Vector, size: Vector, options = { stroke: 'red', fill: 'red' }) {
    const ctx = this.context;

    ctx.beginPath();

    ctx.strokeStyle = options.stroke
    ctx.lineWidth = 3;
    ctx.rect(position.x, position.y, size.x, size.y);
    ctx.stroke();

    if (options.fill != '') {
      ctx.fillStyle = options.fill
      ctx.rect(position.x, position.y, size.x, size.y);
      ctx.fill();
    }
  }

  drawCircle(position: Vector, size: number = 10, options = { stroke: '', fill: '', lineWidth : 3 }) {
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
}

export const drawEngine = new DrawEngine();
