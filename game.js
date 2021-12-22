import { Application } from "./engine/Application.js";

import { GLTFLoader } from "./engine/GLTFLoader.js";
import { Renderer } from "./engine/Renderer.js";

import { Physics } from "./Physics.js";

import { vec3, mat4 } from "./lib/gl-matrix-module.js";

const carDefaults = {
  velocity: [0, 0, 0],
  maxSpeed: 20,
  friction: 0.1,
  acceleration: 20,
};

class App extends Application {
  start() {
    this.time = Date.now();
    this.startTime = this.time;
    this.aspect = 1;

    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};

    this.load("./models/car/car.gltf");

    this.enable();
  }

  async load(uri) {
    this.loader = new GLTFLoader();
    await this.loader.load(uri);
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.camera = await this.loader.loadNode("Camera");
    this.physics = new Physics(this.scene);

    this.car = await this.loader.loadNode("car");

    this.loader.setNode("car", carDefaults);

    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    this.resize();
  }

  update() {
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    //car
    if (!this.car) return;

    const c = this.car;

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
      vec3.sub(c.rotation, c.rotation, vec3.set(vec3.create(), 0, 0.02, 0));
    }
    if (this.keys["KeyA"]) {
      vec3.add(c.rotation, c.rotation, vec3.set(vec3.create(), 0, 0.02, 0));
    }

    // 2: update velocity
    vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

    // 3: if no movement, apply friction
    vec3.scale(c.velocity, c.velocity, 1 - c.friction);

    // 4: limit speed
    const len = vec3.len(c.velocity);
    if (len > c.maxSpeed) {
      vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
    }

    if (this.physics) {
      this.physics.update(dt);
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;

    if (this.camera) {
      this.camera.camera.aspect = aspectRatio;
      this.camera.camera.updateMatrix();
    }
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

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const app = new App(canvas);
});
