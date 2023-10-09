import { drawEngine } from "./draw-engine";
import { Pointer } from "./pointer";
import { Vector } from "./vector";


class InputMouse {

  public pointer: Pointer = new Pointer();

  public info = { scale: 1 }

  constructor() {

    const canvas = document.getElementById('c2d')

    if (canvas) {
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('wheel', onWheel);
    }

  }
  

  setMousePosition = (clientX: number, clientY: number) => {


    let x = (clientX) / c2d.offsetWidth * 1920
    let y = (clientY) / (c2d.offsetWidth / (1920 / 1080)) * 1080

    this.pointer.Position = new Vector(x, y)
  }

}


let isDragging = false;
let dragStartPosition = { x: 0, y: 0 };
let currentTransformedCursor: DOMPoint;
let mouseZoomValue = 1;
let transformedCursorValue = 0



function drawImageToCanvas(context: CanvasRenderingContext2D) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, 1920, 1080);
  context.restore();

  // context.drawImage(image, 0, 0, 1072, 603);
}

// function getTransformedPoint( x: number | undefined, y: number | undefined) {
//   let context = drawEngine.context
//   const originalPoint = new DOMPoint(x, y);
//   return context.getTransform().invertSelf().transformPoint(originalPoint);
// }

function getTransformedPoint(x: number, y: number) {
  const originalPoint = new DOMPoint(x, y);
  // adjust for canvas scaling
  const xScaleFactor = drawEngine.context.canvas.width / drawEngine.context.canvas.clientWidth;
  const yScaleFactor = drawEngine.context.canvas.height / drawEngine.context.canvas.clientHeight;
  originalPoint.x *= xScaleFactor;
  originalPoint.y *= yScaleFactor;

  return drawEngine.context.getTransform().invertSelf().transformPoint(originalPoint);
}

function onMouseDown(event: { offsetX: number; offsetY: number; }) {

  inputMouse.setMousePosition(event.offsetX, event.offsetY)

  isDragging = true;
  dragStartPosition = getTransformedPoint(event.offsetX, event.offsetY);
}

function onMouseMove(event: { offsetX: number; offsetY: number; }) {

  inputMouse.setMousePosition(event.offsetX, event.offsetY)

  let context = drawEngine.context

  currentTransformedCursor = getTransformedPoint(event.offsetX, event.offsetY);


  // mousePos.innerText = `Original X: ${event.offsetX}, Y: ${event.offsetY}`;
  // transformedMousePos.innerText = `Transformed X: ${currentTransformedCursor.x.toFixed(1)}, Y: ${currentTransformedCursor.y.toFixed(1)}`;

  if (isDragging) {

    // if (transformedCursorValue + currentTransformedCursor.x - dragStartPosition.x > 0) return

    transformedCursorValue += currentTransformedCursor.x - dragStartPosition.x

    // transformedCursor.innerText = `Delta X: ${transformedCursorValue.toFixed(1)}`;

    context.translate(currentTransformedCursor.x - dragStartPosition.x, currentTransformedCursor.y - dragStartPosition.y);
    drawImageToCanvas(context);
  }
}

function onMouseUp() {
  isDragging = false;
}


function onWheel(event: { deltaY: number; preventDefault: () => void; }) {

  let context = drawEngine.context

  const zoom = event.deltaY < 0 ? 1.1 : 0.9;


  mouseZoomValue *= zoom

  if (mouseZoomValue * zoom < 1) return
  if (mouseZoomValue * zoom > 6) return


  inputMouse.info.scale = mouseZoomValue

  // mouseZoom.innerText = `zoom: ${mouseZoomValue.toFixed(3)}`;

  context.translate(currentTransformedCursor.x, currentTransformedCursor.y);
  context.scale(zoom, zoom);
  context.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);

  drawImageToCanvas(context);
  event.preventDefault();
}

export const inputMouse = new InputMouse();
