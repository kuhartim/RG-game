import { Box, Utils } from "./geometry/index.js";

import { vec2, vec3 } from "./lib/gl-matrix-module.js";

export class Car {
  constructor(car) {
    this.car = car;
    this.origin = vec2.set(vec2.create(), 0, 0);

    this.width = 20;
    this.length = this.width * 2;
    this.heading = 0;
    this.maxVelocity = 1;

    this.velocity = 0;
    this.steerAngle = 0;
    this.acceleration = 0;
    this.accelerationFactor = 5;
    this.maxSteering = Math.PI / 6;
    this.wheelBase = this.length / 4;
    this.maxAcceleration = this.maxVelocity / 4;
    this.freeDeceleration = this.maxVelocity / 4;
    this.brakeDeceleration = this.maxVelocity;
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

  goBackward(dt) {
    if (this.velocity > 0) {
      this.acceleration = -this.brakeDeceleration;
    } else {
      this.acceleration -= this.accelerationFactor * dt;
      this.acceleration = Utils.clamp(
        this.acceleration,
        -this.maxAcceleration,
        this.maxAcceleration
      );
    }
  }

  goForward(dt) {
    if (this.velocity < 0) {
      this.acceleration = this.brakeDeceleration;
      console.log("Brake");
    } else {
      this.acceleration += this.accelerationFactor * dt;
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
  }

  turnLeft(dt) {
    const angle = Utils.clamp(
      this.steerAngle - this.maxSteering * dt,
      -this.maxSteering,
      this.maxSteering
    );

    this.rotate(angle);
  }

  turnRight(dt) {
    const angle = Utils.clamp(
      this.steerAngle + this.maxSteering * dt,
      -this.maxSteering,
      this.maxSteering
    );

    this.rotate(angle);
  }

  updateRotation(dt) {
    if (this.steerAngle > 0) {
      this.turnLeft(dt * 2);
    } else if (this.steerAngle < 0) {
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

    // this.velocity2 = vec3.set(vec3.create(), 0, 0, -this.velocity);

    // console.log(this.heading);

    //this.origin[1] += this.velocity;

    // console.log(this.car.translation);

    vec3.copy(
      this.car.translation,
      vec3.set(vec3.create(), this.origin[1], 0, -this.origin[0])
    );
    vec3.copy(this.car.rotation, vec3.set(vec3.create(), 0, -this.heading, 0));

    this.car.updateMatrix();

    //this.rotate(this.steerAngle);
  }
}
