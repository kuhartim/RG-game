import { vec2 } from "../lib/gl-matrix-module.js";

export class Boundary {
  constructor({ a, b }) {
    this.a = vec2.set(vec2.create(), a.x, a.y);
    this.b = vec2.set(vec2.create(), b.x, b.y);
  }
}
