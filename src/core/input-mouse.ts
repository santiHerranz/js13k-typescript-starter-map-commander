import { drawEngine } from "./draw-engine";
import { Pointer } from "./pointer";
import { Vector } from "./vector";


class InputMouse {

  public lastX: number = 0;
  public lastY: number = 0;

  public pointer: Pointer = new Pointer();
  public scale = 1

  public eventMouseDown = () => { }  // for binding
  public eventMouseMove = () => { }  // for binding
  public eventMouseUp = () => { }    // for binding
  public eventMouseScroll = (scale: number) => { } // for binding
  public eventContextmenu = () => { } // for binding

  constructor() {

    const canvas = document.getElementById('c2d')

    if (canvas) {
      canvas.addEventListener('mousedown', this.handleMouseDown, false);
      canvas.addEventListener('mousemove', this.handleMouseMove, false);
      canvas.addEventListener('mouseup', this.handleMouseUp, false);
      canvas.addEventListener('DOMMouseScroll', this.handleScroll, false);
      canvas.addEventListener('mousewheel', this.handleScroll, false); // chrome    
      canvas.addEventListener("contextmenu", this.handleContextmenu, false);

    }

  }

  private getMousePosition = (evt: any) => {

    var rect = c2d.getBoundingClientRect();

    this.lastX = (evt.clientX - rect.left) / c2d.offsetWidth * 1920
    this.lastY = (evt.clientY - rect.top) / (c2d.offsetWidth / (1920 / 1080)) * 1080

    this.pointer.Position = new Vector(this.lastX, this.lastY)
  }



  handleMouseDown = (evt: any) => {

    if (!e) var e: Event | any = window.event;

    if (e.which) this.pointer.leftButton = (e.which == 1);
    else if (e.button) this.pointer.leftButton = (e.button == 0);

    if (e.which) this.pointer.middleButton = (e.which == 2);
    else if (e.button) this.pointer.middleButton = (e.button == 1);

    if (e.which) this.pointer.rigthButton = (e.which == 3);
    else if (e.button) this.pointer.rigthButton = (e.button == 1);

    this.getMousePosition(evt)

    this.pointer.Position = new Vector(this.lastX, this.lastY)

    this.eventMouseDown();
  }

  handleMouseMove = (evt: any) => {

    this.getMousePosition(evt)

    this.eventMouseMove();


    return evt.preventDefault() && false;
  }

  handleMouseUp = (evt: any) => {

    this.getMousePosition(evt)

    if (!e) var e: Event | any = window.event;

    this.pointer.leftButton = false;
    this.pointer.middleButton = false;
    this.pointer.rigthButton = false;

    this.eventMouseUp();

    return evt.preventDefault() && false;
  }

  handleContextmenu = (evt: any) => {
    this.eventContextmenu();
    return evt.preventDefault() && false;
  }

  handleScroll = (evt: any) => {
    evt.preventDefault()

    // console.log('evt: '+ JSON.stringify(evt));

    var delta = (evt.wheelDelta ? evt.wheelDelta : -evt.deltaY);

    (delta > 0) ? (this.scale /= 1.15) : (this.scale *= 1.15);

    this.scale = Math.min(this.scale, 1.5)
    this.scale = Math.max(this.scale, 0.05)

    this.eventMouseScroll(this.scale);
  };


}

export const inputMouse = new InputMouse();
