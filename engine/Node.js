import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Node {
  constructor(options = {}) {
    this.translation = options.translation
      ? vec3.clone(options.translation)
      : vec3.fromValues(0, 0, 0);
    this.rotation = options.rotation
      ? quat.clone(options.rotation)
      : quat.fromValues(0, 0, 0, 1);
    this.scale = options.scale
      ? vec3.clone(options.scale)
      : vec3.fromValues(1, 1, 1);
    this.matrix = options.matrix ? mat4.clone(options.matrix) : mat4.create();

    if (options.matrix) {
      this.updateTransform();
    } else if (options.translation || options.rotation || options.scale) {
      this.updateMatrix();
    }

    //zbris
    this.acc = vec3.fromValues(0, 0, 0);
    this.velocity = vec3.fromValues(1, 0, 0);

    this.transform = mat4.create();
    this.updateTransform();

    this.camera = options.camera || null;
    this.mesh = options.mesh || null;

    this.children = [...(options.children || [])];
    for (const child of this.children) {
      child.parent = this;
    }
    this.parent = null;

    if (
      this.mesh &&
      this.mesh.primitives &&
      this.mesh.primitives[0] &&
      this.mesh.primitives[0].attributes &&
      this.mesh.primitives[0].attributes.POSITION
    ) {
      const point1 =
        vec3.clone(this.mesh.primitives[0].attributes.POSITION.min) || null;
      const point2 =
        vec3.clone(this.mesh.primitives[0].attributes.POSITION.max) || null;

      if (point1 && point2) {
        const minX = Math.min(point1[0], point2[0]);
        const minY = Math.min(point1[2], point2[2]);

        const maxX = Math.max(point1[0], point2[0]);
        const maxY = Math.max(point1[2], point2[2]);

        console.log(minX, maxX);

        this.point1 = vec3.fromValues(minX, 0, minY);
        this.point4 = vec3.fromValues(maxX, 0, maxY);
        this.point2 = vec3.fromValues(minX, 0, maxY);
        this.point3 = vec3.fromValues(maxX, 0, minY);
      }
    }
  }

  updateTransform() {
    mat4.getRotation(this.rotation, this.matrix);
    mat4.getTranslation(this.translation, this.matrix);
    mat4.getScaling(this.scale, this.matrix);
  }

  getGlobalTransform() {
    if (!this.parent) {
      return mat4.clone(this.transform);
    } else {
      let transform = this.parent.getGlobalTransform();
      return mat4.mul(transform, transform, this.transform);
    }
  }

  updateMatrix() {
    const m = this.matrix;
    const degrees = this.rotation.map((x) => (x * 180) / Math.PI);
    const q = quat.fromEuler(quat.create(), ...degrees);
    const v = vec3.clone(this.translation);
    const s = vec3.clone(this.scale);
    mat4.fromRotationTranslationScale(m, q, v, s);
  }

  addChild(node) {
    this.children.push(node);
    node.parent = this;
  }

  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index >= 0) {
      this.children.splice(index, 1);
      node.parent = null;
    }
  }

  clone() {
    return new Node({
      ...this,
      children: this.children.map((child) => child.clone()),
    });
  }
}
