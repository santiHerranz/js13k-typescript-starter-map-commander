import { drawEngine } from "./draw-engine";
import { Pointer } from "./pointer";
import { Vector } from "./vector";


class InputMouse {

  public pointer: Pointer = new Pointer();

  public info = { scale: 1, panX: 0, panY: 0 }

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


    const screen = clientToCanvasPoint(clientX, clientY);
    this.pointer.Screen = new Vector(screen.x, screen.y)

    let x = (clientX) / c2d.offsetWidth * 1920
    let y = (clientY) / (c2d.offsetWidth / (1920 / 1080)) * 1080

    this.pointer.Position = new Vector(x, y)
  }

}


let isDragging = false;
let dragStartScreen = { x: 0, y: 0 };
let currentTransformedCursor: DOMPoint;
let mouseZoomValue = 1;
let transformedCursorValue = 0;

// Track current pan position
let currentPanX = 0;
let currentPanY = 0;

// Image dimensions - matches the map image size in game.state.ts
const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

/**
 * Calculate panning limits based on current zoom level
 * Returns the maximum allowed translation values to keep the image within bounds
 * 
 * CORRECTED LOGIC:
 * - Image: 1920x1080, Canvas: 1920x1080
 * - At zoom 1x: image fits exactly, no panning
 * - At zoom 2x: we see half the image, can pan to see the rest
 * - Translation limits are in the scaled coordinate space
 */
function calculatePanLimits(zoomLevel: number) {
  const canvasWidth = drawEngine.canvasWidth;   // 1920
  const canvasHeight = drawEngine.canvasHeight; // 1080
  
  // At zoom 1.0, image exactly fits canvas, no panning needed
  if (zoomLevel <= 1.0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  
  // CORRECT UNDERSTANDING:
  // When zoomed, we apply scale(zoomLevel) to the canvas
  // The image is still drawn at (0,0) with size (1920, 1080)
  // But after scaling, the effective visible area is (1920/zoom, 1080/zoom)
  // 
  // Example at zoom 2x:
  // - Image is 1920x1080
  // - Visible area is 1920/2 = 960 width, 1080/2 = 540 height
  // - We can pan from (0,0) to (1920-960, 1080-540) = (960, 540)
  // - Centered, we can go ±480 horizontally, ±270 vertically
  // - But these are in image coordinates, not canvas coordinates
  
  // In the transformed coordinate space (after scaling):
  // The translation limits should prevent showing beyond image edges
  
  // At zoom level Z:
  // - Visible image area: (1920/Z, 1080/Z) 
  // - Maximum pan in image coordinates: ((1920 - 1920/Z)/2, (1080 - 1080/Z)/2)
  // - But translations happen in the scaled space, so we need to scale these limits
  
  const visibleWidth = IMAGE_WIDTH / zoomLevel;
  const visibleHeight = IMAGE_HEIGHT / zoomLevel;
  
  // Maximum pan distance in image coordinates
  const maxPanImageX = (IMAGE_WIDTH - visibleWidth) / 2;
  const maxPanImageY = (IMAGE_HEIGHT - visibleHeight) / 2;
  
  // Convert to canvas/transform coordinates (these are the actual translation values)
  // Since we're translating in the scaled coordinate system, the limits are:
  const maxTranslateX = maxPanImageX;
  const maxTranslateY = maxPanImageY;
  
  return {
    minX: -maxTranslateX,
    maxX: maxTranslateX,
    minY: -maxTranslateY,
    maxY: maxTranslateY
  };
}

/**
 * Clamp a translation value within the allowed limits
 */
function clampTranslation(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp diagonal panning to ensure both X and Y coordinates stay within bounds
 * This is important for corner cases where diagonal movement might exceed limits
 */
function clampDiagonalPanning(
  proposedX: number, proposedY: number,
  minX: number, maxX: number,
  minY: number, maxY: number
): { x: number, y: number } {
  
  // For rectangular bounds (which is our case), we can clamp X and Y independently
  // since the image is rectangular and the limits form a rectangular boundary
  const clampedX = clampTranslation(proposedX, minX, maxX);
  const clampedY = clampTranslation(proposedY, minY, maxY);
  
  return { x: clampedX, y: clampedY };
}

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

function clientToCanvasPoint(x: number, y: number) {
  const xScaleFactor = drawEngine.context.canvas.width / drawEngine.context.canvas.clientWidth;
  const yScaleFactor = drawEngine.context.canvas.height / drawEngine.context.canvas.clientHeight;
  return new DOMPoint(x * xScaleFactor, y * yScaleFactor);
}

// Returns the currently visible world rectangle given the active transform
function getVisibleWorldRect() {
  const scale = inputMouse.info.scale;
  const panX = inputMouse.info.panX;
  const panY = inputMouse.info.panY;
  const left = -panX / scale;
  const top = -panY / scale;
  const right = (drawEngine.canvasWidth - panX) / scale;
  const bottom = (drawEngine.canvasHeight - panY) / scale;
  return { left, top, right, bottom };
}

function onMouseDown(event: { offsetX: number; offsetY: number; }) {

  inputMouse.setMousePosition(event.offsetX, event.offsetY)

  isDragging = true;
  const p = clientToCanvasPoint(event.offsetX, event.offsetY);
  dragStartScreen = { x: p.x, y: p.y };
}

function onMouseMove(event: { offsetX: number; offsetY: number; }) {

  inputMouse.setMousePosition(event.offsetX, event.offsetY)

  const currentScreen = clientToCanvasPoint(event.offsetX, event.offsetY);


  // mousePos.innerText = `Original X: ${event.offsetX}, Y: ${event.offsetY}`;
  // transformedMousePos.innerText = `Transformed X: ${currentTransformedCursor.x.toFixed(1)}, Y: ${currentTransformedCursor.y.toFixed(1)}`;

  if (isDragging) {
    // Desired movement in screen (canvas pixel) space
    const desiredDx = currentScreen.x - dragStartScreen.x;
    const desiredDy = currentScreen.y - dragStartScreen.y;

    // Allowed pan ranges in screen space for current scale
    const scale = inputMouse.info.scale;
    const minPanX = drawEngine.canvasWidth - IMAGE_WIDTH * scale;
    const maxPanX = 0;
    const minPanY = drawEngine.canvasHeight - IMAGE_HEIGHT * scale;
    const maxPanY = 0;

    // Clamp proposed pan
    const proposedPanX = inputMouse.info.panX + desiredDx;
    const proposedPanY = inputMouse.info.panY + desiredDy;
    const clampedPanX = clampTranslation(proposedPanX, minPanX, maxPanX);
    const clampedPanY = clampTranslation(proposedPanY, minPanY, maxPanY);

    const actualDx = clampedPanX - inputMouse.info.panX;
    const actualDy = clampedPanY - inputMouse.info.panY;

    // Apply to camera state
    inputMouse.info.panX = clampedPanX;
    inputMouse.info.panY = clampedPanY;

    // Keep legacy trackers in sync
    currentPanX += actualDx;
    currentPanY += actualDy;

    // Incremental dragging: advance start by the applied delta
    dragStartScreen.x += actualDx;
    dragStartScreen.y += actualDy;
  }
}

function onMouseUp() {
  isDragging = false;
}


function onWheel(event: WheelEvent) {
  
  const zoom = event.deltaY < 0 ? 1.1 : 0.9;


  let newZoomValue = mouseZoomValue * zoom;

  // Clamp the zoom value to stay within bounds
  if (newZoomValue < 1.0) {
    newZoomValue = 1.0;
  } else if (newZoomValue > 5.0) {
    newZoomValue = 5.0;
  }

  // Only apply zoom if it actually changed
  if (newZoomValue === mouseZoomValue) return;

  const prevScale = inputMouse.info.scale;
  mouseZoomValue = newZoomValue;
  inputMouse.info.scale = mouseZoomValue

  // mouseZoom.innerText = `zoom: ${mouseZoomValue.toFixed(3)}`;

  // If zoom is 1.0, reset all transformations to ensure clean state
  if (mouseZoomValue === 1.0) {
    inputMouse.info.panX = 0;
    inputMouse.info.panY = 0;
  } else {
    // Zoom around mouse position, keeping world point under cursor stable
    const mouseCanvas = clientToCanvasPoint(event.offsetX, event.offsetY);
    const worldAtMouseX = (mouseCanvas.x - inputMouse.info.panX) / prevScale;
    const worldAtMouseY = (mouseCanvas.y - inputMouse.info.panY) / prevScale;
    inputMouse.info.panX = inputMouse.info.panX + (prevScale - mouseZoomValue) * worldAtMouseX;
    inputMouse.info.panY = inputMouse.info.panY + (prevScale - mouseZoomValue) * worldAtMouseY;

    // Clamp pan to bounds at new scale
    const minPanX = drawEngine.canvasWidth - IMAGE_WIDTH * mouseZoomValue;
    const maxPanX = 0;
    const minPanY = drawEngine.canvasHeight - IMAGE_HEIGHT * mouseZoomValue;
    const maxPanY = 0;
    inputMouse.info.panX = clampTranslation(inputMouse.info.panX, minPanX, maxPanX);
    inputMouse.info.panY = clampTranslation(inputMouse.info.panY, minPanY, maxPanY);

    currentPanX = inputMouse.info.panX;
    currentPanY = inputMouse.info.panY;
  }

  event.preventDefault();
}

export const inputMouse = new InputMouse();
