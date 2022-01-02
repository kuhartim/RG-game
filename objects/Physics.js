import { vec3, mat4 } from "../lib/gl-matrix-module.js";

export class Physics {
  constructor(scene) {
    this.scene = scene;

    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};

    this.enable();
  }

  moveCar(car, dt) {
    //car
    if (!car) return;

    const c = car;

    const forward = vec3.set(
      vec3.create(),
      -Math.sin(c.rotation[1]),
      0,
      -Math.cos(c.rotation[1])
    );

    // 1: add movement acceleration
    let acc = vec3.create();
    if (this.keys["KeyW"]) {
      vec3.add(acc, acc, forward);
    }
    if (this.keys["KeyS"]) {
      vec3.sub(acc, acc, forward);
    }
    if (this.keys["KeyD"]) {
      vec3.sub(c.rotation, c.rotation, vec3.set(vec3.create(), 0, 0.01, 0));
    }
    if (this.keys["KeyA"]) {
      vec3.add(c.rotation, c.rotation, vec3.set(vec3.create(), 0, 0.01, 0));
    }

    // 2: update velocity
    vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

    // 3: if no movement, apply friction
    if (!this.keys["KeyW"] && !this.keys["KeyS"]) {
      vec3.scale(c.velocity, c.velocity, 1 - c.friction);
      console.log("test");
    }

    // 4: limit speed
    const len = vec3.len(c.velocity);
    if (len > c.maxSpeed) {
      vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
    }
  }

  update(dt) {
    this.scene.traverse((node) => {
      if (node.velocity) {
        vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
        this.scene.traverse((other) => {
          if (node !== other) {
            //this.resolveCollision(node, other);
          }
        });
        node.updateMatrix();
        // node.updateTransform();
      }
    });
  }

  intervalIntersection(min1, max1, min2, max2) {
    return !(min1 > max2 || min2 > max1);
  }

  aabbIntersection(aabb1, aabb2) {
    return (
      this.intervalIntersection(
        aabb1.min[0],
        aabb1.max[0],
        aabb2.min[0],
        aabb2.max[0]
      ) &&
      this.intervalIntersection(
        aabb1.min[1],
        aabb1.max[1],
        aabb2.min[1],
        aabb2.max[1]
      ) &&
      this.intervalIntersection(
        aabb1.min[2],
        aabb1.max[2],
        aabb2.min[2],
        aabb2.max[2]
      )
    );
  }

  resolveCollision(a, b) {
    // Update bounding boxes with global translation.
    const ta = a.getGlobalTransform();
    const tb = b.getGlobalTransform();

    const posa = mat4.getTranslation(vec3.create(), ta);
    const posb = mat4.getTranslation(vec3.create(), tb);

    const mina = vec3.add(vec3.create(), posa, a.aabb.min);
    const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
    const minb = vec3.add(vec3.create(), posb, b.aabb.min);
    const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

    // Check if there is collision.
    const isColliding = this.aabbIntersection(
      {
        min: mina,
        max: maxa,
      },
      {
        min: minb,
        max: maxb,
      }
    );

    if (!isColliding) {
      return;
    }

    // Move node A minimally to avoid collision.
    const diffa = vec3.sub(vec3.create(), maxb, mina);
    const diffb = vec3.sub(vec3.create(), maxa, minb);

    let minDiff = Infinity;
    let minDirection = [0, 0, 0];
    if (diffa[0] >= 0 && diffa[0] < minDiff) {
      minDiff = diffa[0];
      minDirection = [minDiff, 0, 0];
    }
    if (diffa[1] >= 0 && diffa[1] < minDiff) {
      minDiff = diffa[1];
      minDirection = [0, minDiff, 0];
    }
    if (diffa[2] >= 0 && diffa[2] < minDiff) {
      minDiff = diffa[2];
      minDirection = [0, 0, minDiff];
    }
    if (diffb[0] >= 0 && diffb[0] < minDiff) {
      minDiff = diffb[0];
      minDirection = [-minDiff, 0, 0];
    }
    if (diffb[1] >= 0 && diffb[1] < minDiff) {
      minDiff = diffb[1];
      minDirection = [0, -minDiff, 0];
    }
    if (diffb[2] >= 0 && diffb[2] < minDiff) {
      minDiff = diffb[2];
      minDirection = [0, 0, -minDiff];
    }

    vec3.add(a.translation, a.translation, minDirection);
    a.updateTransform();
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
