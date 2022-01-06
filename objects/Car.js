import { Utils } from "./geometry/index.js";

import { vec2, vec3 } from "../lib/gl-matrix-module.js";

export class Car {
  constructor(car, wheels) {
    this.car = car;
    this.wheels = wheels;
    this.origin = vec2.set(
      vec2.create(),
      car.translation[2],
      car.translation[0]
    );

    this.width = 20;
    this.length = this.width * 2;
    this.heading = 0;
    this.maxVelocity = 2;

    this.wheelRotation = 0;

    this.velocity = 0;
    this.steerAngle = 0;
    this.acceleration = 0;
    this.maxSteering = Math.PI / 8;
    this.wheelBase = this.length / 4;
    this.maxAcceleration = this.maxVelocity / 4;
    this.freeDeceleration = this.maxVelocity / 4;
    this.brakeDeceleration = this.maxVelocity;

    this.car.point1Base = vec3.clone(this.car.point1);
    this.car.point2Base = vec3.clone(this.car.point2);
    this.car.point3Base = vec3.clone(this.car.point3);
    this.car.point4Base = vec3.clone(this.car.point4);
  }

  //   get frontBox() {
  //     const {
  //       origin: { x, y },
  //       width,
  //       length,
  //       heading,
  //     } = this;

  //     const left = x + length * 0.25;
  //     const right = x + length / 2;
  //     const bottom = y + width * 0.25;
  //     const top = y - width * 0.25;
  //     const rotate = (point) => Utils.rotatePoint(point, { x, y }, heading);

  //     return new Box({
  //       points: [
  //         rotate({ x: left, y: top }),
  //         rotate({ x: right, y: top }),
  //         rotate({ x: right, y: bottom }),
  //         rotate({ x: left, y: bottom }),
  //       ],
  //     });
  //   }

  setVelocity(data) {
    this.velocity = data;
  }

  goBackward(dt) {
    if (this.velocity < 0) {
      this.acceleration = this.brakeDeceleration;
    } else {
      this.acceleration += dt;
      this.acceleration = Utils.clamp(
        this.acceleration,
        -this.maxAcceleration,
        this.maxAcceleration
      );
    }
  }

  goForward(dt) {
    if (this.velocity > 0) {
      this.acceleration = -this.brakeDeceleration;
    } else {
      this.acceleration -= dt;
      this.acceleration = Utils.clamp(
        this.acceleration,
        -this.maxAcceleration,
        this.maxAcceleration
      );
    }
  }

  release(dt) {
    if (Math.abs(this.velocity) > dt * this.freeDeceleration) {
      this.acceleration = -this.freeDeceleration * Math.sign(this.velocity);
    } else if (dt) {
      this.acceleration = -this.velocity / dt;
    }
  }

  rotate(steerAngle) {
    const { origin, heading, velocity, wheelBase } = this;
    const carHeading = vec2.set(
      vec2.create(),
      Math.cos(heading),
      Math.sin(heading)
    );
    const carSteering = vec2.set(
      vec2.create(),
      Math.cos(heading + steerAngle),
      Math.sin(heading + steerAngle)
    );
    const frontWheel = vec2.add(
      vec2.create(),
      origin,
      vec2.set(
        vec2.create(),
        carHeading[0] * (wheelBase / 2),
        carHeading[1] * (wheelBase / 2)
      )
    );
    const backWheel = vec2.sub(
      vec2.create(),
      origin,
      vec2.set(
        vec2.create(),
        carHeading[0] * (wheelBase / 2),
        carHeading[1] * (wheelBase / 2)
      )
    );

    vec2.add(
      frontWheel,
      frontWheel,
      vec2.set(
        vec2.create(),
        carSteering[0] * velocity,
        carSteering[1] * velocity
      )
    );
    vec2.add(
      backWheel,
      backWheel,
      vec2.set(
        vec2.create(),
        carHeading[0] * velocity,
        carHeading[1] * velocity
      )
    );
    vec2.set(
      this.origin,
      (frontWheel[0] + backWheel[0]) / 2,
      (frontWheel[1] + backWheel[1]) / 2
    );
    this.heading = Math.atan2(
      frontWheel[1] - backWheel[1],
      frontWheel[0] - backWheel[0]
    );
    this.steerAngle = steerAngle;

    this.updatePoints();
  }

  turnLeft(dt) {
    if (this.steerAngle > 0) {
      dt *= 2;
    }
    const angle = Utils.clamp(
      this.steerAngle - this.maxSteering * dt * 2,
      -this.maxSteering,
      this.maxSteering
    );

    this.rotate(angle);
  }

  turnRight(dt) {
    if (this.steerAngle < 0) {
      dt *= 2;
    }
    const angle = Utils.clamp(
      this.steerAngle + this.maxSteering * dt * 2,
      -this.maxSteering,
      this.maxSteering
    );

    this.rotate(angle);
  }

  collision(dt, origin) {
    this.velocity = -this.velocity * 2;
    this.origin = origin;
    this.rotate(dt);
    this.velocity = this.velocity / 5;
  }

  updateRotation(dt) {
    if (this.steerAngle > 0.1) {
      this.turnLeft(dt * 2);
    } else if (this.steerAngle < -0.1) {
      this.turnRight(dt * 2);
    } else {
      this.rotate(0);
    }
  }

  update(dt) {
    // console.log(this.car.translation);
    this.velocity = Utils.clamp(
      this.velocity + this.acceleration * dt,
      -this.maxVelocity,
      this.maxVelocity
    );

    this.wheelRotation += this.velocity;

    // this.velocity2 = vec3.set(vec3.create(), 0, 0, -this.velocity);

    // console.log(this.heading);

    //this.origin[1] += this.velocity;

    // console.log(this.car.translation);

    vec3.copy(
      this.car.translation,
      vec3.set(
        vec3.create(),
        this.origin[1],
        this.car.translation[1],
        this.origin[0]
      )
    );
    vec3.copy(this.car.rotation, vec3.set(vec3.create(), 0, this.heading, 0));

    vec3.copy(
      this.wheels[0].rotation,
      vec3.set(vec3.create(), this.wheelRotation, this.steerAngle, 0)
    );
    vec3.copy(
      this.wheels[1].rotation,
      vec3.set(vec3.create(), this.wheelRotation, this.steerAngle, 0)
    );

    vec3.copy(
      this.wheels[2].rotation,
      vec3.set(vec3.create(), this.wheelRotation, 0, 0)
    );
    vec3.copy(
      this.wheels[3].rotation,
      vec3.set(vec3.create(), this.wheelRotation, 0, 0)
    );

    this.car.updateMatrix();
    for (const wheel of this.wheels) {
      wheel.updateMatrix();
    }

    //this.rotate(this.steerAngle);
  }

  updatePoints() {
    const X1 = this.car.point1Base[0];
    const Y1 = this.car.point1Base[2];

    const X2 = this.car.point2Base[0];
    const Y2 = this.car.point2Base[2];

    const X3 = this.car.point3Base[0];
    const Y3 = this.car.point3Base[2];

    const X4 = this.car.point4Base[0];
    const Y4 = this.car.point4Base[2];

    let newX1 =
      X1 * Math.cos(this.car.rotation[1]) - Y1 * Math.sin(this.car.rotation[1]);
    let newY1 =
      X1 * Math.sin(this.car.rotation[1]) + Y1 * Math.cos(this.car.rotation[1]);
    let newX2 =
      X2 * Math.cos(this.car.rotation[1]) - Y2 * Math.sin(this.car.rotation[1]);
    let newY2 =
      X2 * Math.sin(this.car.rotation[1]) + Y2 * Math.cos(this.car.rotation[1]);
    let newX3 =
      X3 * Math.cos(this.car.rotation[1]) - Y3 * Math.sin(this.car.rotation[1]);
    let newY3 =
      X3 * Math.sin(this.car.rotation[1]) + Y3 * Math.cos(this.car.rotation[1]);
    let newX4 =
      X4 * Math.cos(this.car.rotation[1]) - Y4 * Math.sin(this.car.rotation[1]);
    let newY4 =
      X4 * Math.sin(this.car.rotation[1]) + Y4 * Math.cos(this.car.rotation[1]);
    // let newX1 = X1 + (this.length / 2) * Math.sin(this.car.rotation[1]);
    // let newY1 = Y1 + (this.length / 2) * Math.cos(this.car.rotation[1]);
    // let newX2 = X2 + (this.length / 2) * Math.sin(this.car.rotation[1]);
    // let newY2 = Y2 + (this.length / 2) * Math.cos(this.car.rotation[1]);
    this.car.point1[0] = newX1;
    this.car.point1[2] = newY1;

    this.car.point2[0] = newX2;
    this.car.point2[2] = newY2;

    this.car.point3[0] = newX3;
    this.car.point3[2] = newY3;

    this.car.point4[0] = newX4;
    this.car.point4[2] = newY4;
  }
}
