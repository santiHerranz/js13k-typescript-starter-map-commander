/**
 * FPS Counter utility class
 * Calculates frames per second with decimal precision
 */
export class FPSCounter {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private currentFPS: number = 0;
  private frameTimestamps: number[] = [];
  private readonly maxSamples: number = 60; // Keep last 60 frames for smooth averaging

  constructor() {
    this.lastTime = performance.now();
  }

  /**
   * Update the FPS counter - call this once per frame
   */
  update(): void {
    const currentTime = performance.now();
    this.frameTimestamps.push(currentTime);
    
    // Keep only the last maxSamples frames
    if (this.frameTimestamps.length > this.maxSamples) {
      this.frameTimestamps.shift();
    }

    // Calculate FPS based on the time span of our samples
    if (this.frameTimestamps.length >= 2) {
      const timeSpan = currentTime - this.frameTimestamps[0];
      const frameCount = this.frameTimestamps.length - 1;
      this.currentFPS = (frameCount / timeSpan) * 1000; // Convert to frames per second
    }

    this.frameCount++;
  }

  /**
   * Get the current FPS with decimal precision
   */
  getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Get the current FPS formatted as a string with specified decimal places
   */
  getFPSString(decimalPlaces: number = 1): string {
    return this.currentFPS.toFixed(decimalPlaces);
  }

  /**
   * Reset the FPS counter
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.currentFPS = 0;
    this.frameTimestamps = [];
  }
}
