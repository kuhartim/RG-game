import { Application } from "./engine/Application.js";

import { GLTFLoader } from "./engine/GLTFLoader.js";
import { Renderer } from "./engine/Renderer.js";

import { Physics } from "./Physics.js";
import { Physics2 } from "./Physics2.js";
import { Physics3 } from "./Physics3.js";

import { vec3, mat4 } from "./lib/gl-matrix-module.js";

class App extends Application {
  start() {
    this.time = Date.now();
    this.startTime = this.time;
    this.aspect = 1;

    this.load("./models/car/car.gltf");
  }

  async load(uri) {
    this.loader = new GLTFLoader();
    await this.loader.load(uri);
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.camera = await this.loader.loadNode("Camera");
    // this.physics = new Physics(this.scene);

    this.car = await this.loader.loadNode("car");
    // this.plane = await this.loader.loadNode("Plane");
    const wheels = [
      await this.loader.loadNode("sp_leva"),
      await this.loader.loadNode("sp_desna"),
      await this.loader.loadNode("z_leva"),
      await this.loader.loadNode("z_desna"),
    ];

    this.ph3 = new Physics3(this.scene, this.car, wheels);

    // let wheels = [
    //   await this.loader.loadNode("sp_desna"),
    //   await this.loader.loadNode("sp_leva"),
    //   await this.loader.loadNode("z_desna"),
    //   await this.loader.loadNode("z_leva"),
    // ];

    // this.ph2 = new Physics2(this.plane, wheels);

    //this.loader.setNode("car", carDefaults);

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

  async update() {
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.ph3) {
      this.ph3.moveCar(dt);
      this.ph3.update(dt);
    }

    // if (this.physics) {
    //   this.physics.moveCar(this.car, dt);
    //   this.physics.update(dt);
    // }

    // if (this.ph2) {
    //   this.ph2.updatePhysics(dt, this.car, this.plane);
    //   this.ph2.updateScene(this.scene);
    // }
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
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const app = new App(canvas);
});
