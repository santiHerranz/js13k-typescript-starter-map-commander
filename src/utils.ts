import { Vector } from "./core/vector";
import { time } from "./index";

export const M = Math;

/**
 * 
 * @param pt Interactive to canvas
 * @returns 
 */
export var i2c = (pt: Vector, size: Vector) => {
    var cartPt = new Vector(0, 0);
    cartPt.x = pt.x * size.x;
    cartPt.y = pt.y * size.y ;
    return cartPt;
  };
  
  /**
   * Canvas to Interactive
   * @param pt 
   * @returns 
   */
  export var c2i = (pt: Vector, size: Vector) => {
    var map = new Vector(0,0);
    map.x = pt.x / size.x;
    map.y = pt.y / size.y;
    return map;
  };



  

export var rndPN = () => {
  return rand() * 2 - 1;
};

export var rndRng = (from: number, to: number) => {
  return ~~(rand() * (to - from + 1) + from);
};

export var inRng = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

export var rndInArray = (a: string | any[]) => a[~~(rand() * a.length)];


// export var walkTile = (obj:any, t: number) => {
//   if (t === undefined || t === null) { 
//     return false;
//   }
//   // return obj == Game._scene._player || t != TileType._TRANSPARENT && obj != Game._scene._player;
//   // return t != TileType._TRANSPARENT;
//   return t != TileType._BASE; // water
// };


export class rect {
  public _left: number;
  public _top: number;
  public _width: number;
  public _height: number;
  public _right: number;
  public _bottom: number;
  center: Vector;

  constructor(left: number, top: number, width: number, height: number) {
    this._left = left || 0;
    this._top = top || 0;
    this._width = width || 0;
    this._height = height || 0;
    this._right = this._left + this._width;
    this._bottom = this._top + this._height;

    this.center = new Vector(this._left+this._width/2,this._top+this._height/2)
  }

  set(x: number, y: number, /*optional*/ _width: number, /*optional*/ _height: number) {

    this.center = new Vector(x,y)

    this._width = _width || this._width;
    this._height = _height || this._height;

    this._left = this.center.x - this._width/2;
    this._top = this.center.y - this._height/2;
    this._right = this.center.x + this._width/2;
    this._bottom = this.center.y + this._height/2;
  }

  // public get mid() {
  //   return new Vector(this._left + this._width / 2, this._top + this._height / 2);
  // }
}
  

  export  function randInt( min=0, max=0 ) {
    return Math.floor(Math.random() * (max - min) + min);
  };


  export  var rand = ( min=1, max=0 ) => {
    return Math.random() * ( max - min ) + min;
  }

 export const PI = Math.PI

  
const ASSERT = (value:boolean) => {}

const clamp = (v: number, max = 1, min = 0) => (ASSERT(max > min), v < min ? min : v > max ? max : v);
const percent = (v: number, max = 1, min = 0) => max - min ? clamp((v - min) / (max - min)) : 0;


class Timer {
    time: number | undefined;
  setTime: number | undefined;

    constructor(timeLeft: number | undefined) {
        this.time = timeLeft == undefined ? undefined : time + timeLeft;
        this.setTime = timeLeft;
    }

    set(timeLeft = 0) {
        this.time = time + timeLeft;
        this.setTime = timeLeft;
    }
    unset() {
        this.time = undefined;
    }
    isSet() {
        return this.time != undefined;
    }
    active() {
      if (this.time == undefined) return false
        return time <= this.time;
    } // is set and has no time left
    elapsed() {
      if (this.time == undefined) return false
        return time > this.time;
    } // is set and has time left
    get() {
      if (this.time == undefined) return 0
        return this.isSet() ? time - this.time : 0;
    }
    p100() {
      if (this.time == undefined) return 0
        return this.isSet() ? percent(this.time - time, 0, this.setTime) : 0;
    }
}

export { Timer }