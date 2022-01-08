import { vec3, mat4 } from "../../lib/gl-matrix-module.js";
import { Car } from "./Car.js";

export class Physics3 {
  constructor(scene, camera, cameraLocation, car, wheels, fences) {
    this.scene = scene;
    this.camera = camera;
    this.cameraLocation = cameraLocation;
    this.car = new Car(car, wheels, camera, cameraLocation);
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

  updateSpeed(element) {
    element.innerHTML = `${parseInt(-this.car.velocity * 50)} km/h`;
  }

  moveCar(dt, startTimer) {
    const origin = this.car.origin;

    if (this.keys["KeyW"]) {
      this.car.goForward(dt);
      startTimer();
    } else if (this.keys["KeyS"]) {
      this.car.goBackward(dt);
      startTimer();
    } else {
      this.car.release(dt);
    }

    if (this.keys["KeyA"]) {
      this.car.turnLeft(dt);
      startTimer();
    } else if (this.keys["KeyD"]) {
      this.car.turnRight(dt);
      startTimer();
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
    if (
      !node1 ||
      !node2 ||
      !node1.point1 ||
      !node1.point2 ||
      !node2.point1 ||
      !node2.point2
    ) {
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
    const minus = 1;
    const p1 =
      a.point1[0] + minus <= b.point4[0] - minus &&
      a.point1[0] - minus >= b.point1[0] + minus &&
      a.point1[2] + minus <= b.point4[2] - minus &&
      a.point1[2] - minus >= b.point1[2] + minus;
    const p2 =
      a.point2[0] + minus <= b.point4[0] - minus &&
      a.point2[0] - minus >= b.point1[0] + minus &&
      a.point2[2] + minus <= b.point4[2] - minus &&
      a.point2[2] - minus >= b.point1[2] + minus;
    const p3 =
      a.point3[0] + minus <= b.point4[0] - minus &&
      a.point3[0] - minus >= b.point1[0] + minus &&
      a.point3[2] + minus <= b.point4[2] - minus &&
      a.point3[2] - minus >= b.point1[2] + minus;
    const p4 =
      a.point4[0] + minus <= b.point4[0] - minus &&
      a.point4[0] - minus >= b.point1[0] + minus &&
      a.point4[2] + minus <= b.point4[2] - minus &&
      a.point4[2] - minus >= b.point1[2] + minus;

    // console.log(p1 || p2 || p3 || p4);

    return p1 || p2 || p3 || p4;
  }

  // changePoints(polygon) {
  //   return [
  //     {
  //       x: polygon.point1[0],
  //       y: polygon.point1[1],
  //     },
  //     {
  //       x: polygon.point2[0],
  //       y: polygon.point2[1],
  //     },
  //     {
  //       x: polygon.point4[0],
  //       y: polygon.point4[1],
  //     },
  //     {
  //       x: polygon.point3[0],
  //       y: polygon.point3[1],
  //     },
  //   ];
  // }

  // doPolygonsIntersect(a, b) {
  //   var polygons = [this.changePoints(a), this.changePoints(b)];
  //   var minA, maxA, projected, i, i1, j, minB, maxB;

  //   for (i = 0; i < polygons.length; i++) {
  //     // for each polygon, look at each edge of the polygon, and determine if it separates
  //     // the two shapes
  //     var polygon = polygons[i];
  //     for (i1 = 0; i1 < polygon.length; i1++) {
  //       // grab 2 vertices to create an edge
  //       var i2 = (i1 + 1) % polygon.length;
  //       var p1 = polygon[i1];
  //       var p2 = polygon[i2];

  //       // find the line perpendicular to this edge
  //       var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

  //       minA = maxA = undefined;
  //       // for each vertex in the first shape, project it onto the line perpendicular to the edge
  //       // and keep track of the min and max of these values
  //       for (j = 0; j < a.length; j++) {
  //         projected = normal.x * a[j].x + normal.y * a[j].y;
  //         if (isUndefined(minA) || projected < minA) {
  //           minA = projected;
  //         }
  //         if (isUndefined(maxA) || projected > maxA) {
  //           maxA = projected;
  //         }
  //       }

  //       // for each vertex in the second shape, project it onto the line perpendicular to the edge
  //       // and keep track of the min and max of these values
  //       minB = maxB = undefined;
  //       for (j = 0; j < b.length; j++) {
  //         projected = normal.x * b[j].x + normal.y * b[j].y;
  //         if (isUndefined(minB) || projected < minB) {
  //           minB = projected;
  //         }
  //         if (isUndefined(maxB) || projected > maxB) {
  //           maxB = projected;
  //         }
  //       }

  //       // if there is no overlap between the projects, the edge we are looking at separates the two
  //       // polygons, and we know there is no overlap
  //       if (maxA < minB || maxB < minA) {
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // }
}
