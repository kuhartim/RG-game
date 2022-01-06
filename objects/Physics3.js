import { vec3, mat4 } from "../../lib/gl-matrix-module.js";
import { Car } from "./Car.js";

export class Physics3 {
  constructor(scene, car, wheels, fences) {
    this.scene = scene;
    this.car = new Car(car, wheels);
    this.carNode = car;
    this.fences = fences;

    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};

    this.enable();

    console.log(car.point1, car.point2, car.point3, car.point4);

    // for (let i = 0; i < this.fences.length; i++) {
    //   if (this.checkCollision(this.car.car, this.fences[i])) {
    //     console.log("collision", i);
    //   }
    // }
  }

  moveCar(dt) {
    const origin = this.car.origin;
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

    // let test = this.checkCollision(this.fences[0], this.fences[0]);
    // console.log(test["min"], test["max"]);

    // let test = this.checkCollision(this.car.car, this.car.car);
    // console.log(test["min"]);

    for (let i = 0; i < this.fences.length; i++) {
      if (this.checkCollision(this.car.car, this.fences[i])) {
        console.log("collision", i);
        this.car.collision(dt, origin);
      }
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
    // document.addEventListener("mousemove", this.mousemoveHandler);
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

  disable() {
    // document.removeEventListener("mousemove", this.mousemoveHandler);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keyup", this.keyupHandler);

    for (let key in this.keys) {
      this.keys[key] = false;
    }
  }

  checkCollision(node1, node2) {
    if (!node1.point1 || !node1.point2 || !node2.point1 || !node2.point2) {
      console.log("nope");
      return false;
    }

    const node1_coordinates = {
      point1: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node1.scale, node1.point1),
        node1.translation
      ),
      point2: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node1.scale, node1.point2),
        node1.translation
      ),
      point3: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node1.scale, node1.point3),
        node1.translation
      ),
      point4: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node1.scale, node1.point4),
        node1.translation
      ),
    };

    const node2_coordinates = {
      point1: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node2.scale, node2.point1),
        node2.translation
      ),
      point2: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node2.scale, node2.point2),
        node2.translation
      ),
      point3: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node2.scale, node2.point3),
        node2.translation
      ),
      point4: vec3.add(
        vec3.create(),
        vec3.mul(vec3.create(), node2.scale, node2.point4),
        node2.translation
      ),
    };

    // const node1_coordinates = [
    //   vec3.add(vec3.create(), node1.translation, node1.point1),
    //   vec3.add(vec3.create(), node1.translation, node1.point2),
    //   vec3.add(vec3.create(), node1.translation, node1.point3),
    //   vec3.add(vec3.create(), node1.translation, node1.point4),
    // ];

    // return node1_coordinates;

    // console.log(
    //   node1_coordinates.point1,
    //   node1_coordinates.point2,
    //   node1_coordinates.point3,
    //   node1_coordinates.point4
    // );

    return this.intersect(node1_coordinates, node2_coordinates);
  }

  //FIX COLLISION
  intersect(a, b) {
    const p1 =
      a.point1[0] <= b.point4[0] &&
      a.point1[0] >= b.point1[0] &&
      a.point1[2] <= b.point4[2] &&
      a.point1[2] >= b.point1[2];
    const p2 =
      a.point2[0] <= b.point4[0] &&
      a.point2[0] >= b.point1[0] &&
      a.point2[2] <= b.point4[2] &&
      a.point2[2] >= b.point1[2];
    const p3 =
      a.point3[0] <= b.point4[0] &&
      a.point3[0] >= b.point1[0] &&
      a.point3[2] <= b.point4[2] &&
      a.point3[2] >= b.point1[2];
    const p4 =
      a.point4[0] <= b.point4[0] &&
      a.point4[0] >= b.point1[0] &&
      a.point4[2] <= b.point4[2] &&
      a.point4[2] >= b.point1[2];

    // console.log(p1 || p2 || p3 || p4);

    return p1 || p2 || p3 || p4;
  }
}
