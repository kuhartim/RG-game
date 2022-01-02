// import { vec3, mat4 } from "../lib/gl-matrix-module.js";
import { Car } from "./Car.js";

export class Physics3 {
  constructor(scene, car, wheels) {
    this.scene = scene;
    this.car = new Car(car, wheels);
    this.carNode = car;

    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};

    this.enable();
  }

  moveCar(dt) {
    if (this.keys["KeyW"]) {
      this.car.goForward(dt);
    } else if (this.keys["KeyS"]) {
      this.car.goBackward(dt);
    } else {
      this.car.release(dt);
    }

    if (this.keys["KeyA"]) {
      this.car.turnLeft(dt);
    } else if (this.keys["KeyD"]) {
      this.car.turnRight(dt);
    } else {
      //this.car.rotate(0);
      this.car.updateRotation(dt);
    }
  }

  update(dt) {
    this.car.update(dt);
  }

  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }

  enable() {
    document.addEventListener("mousemove", this.mousemoveHandler);
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

  disable() {
    document.removeEventListener("mousemove", this.mousemoveHandler);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keyup", this.keyupHandler);

    for (let key in this.keys) {
      this.keys[key] = false;
    }
  }
}
