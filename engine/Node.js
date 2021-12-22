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

    this.transform = mat4.create();
    this.updateTransform();

    this.camera = options.camera || null;
    this.mesh = options.mesh || null;

    this.children = [...(options.children || [])];
    for (const child of this.children) {
      child.parent = this;
    }
    this.parent = null;
  }

  updateTransform() {
    // mat4.getRotation(this.rotation, this.matrix);
    // mat4.getTranslation(this.translation, this.matrix);
    // mat4.getScaling(this.scale, this.matrix);

    const m = this.matrix;
    const degrees = this.rotation.map(x => x * 180 / Math.PI);
    const q = quat.fromEuler(quat.create(), ...degrees);
    const v = vec3.clone(this.translation);
    const s = vec3.clone(this.scale);
    mat4.fromRotationTranslationScale(m, q, v ,s);
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
    // mat4.fromRotationTranslationScale(
    //   this.matrix,
    //   this.rotation,
    //   this.translation,
    //   this.scale
    // );

    const m = this.matrix;
    mat4.identity(m);
    mat4.translate(m, m, this.translation);
    mat4.rotateY(m, m, this.rotation[1]);
    mat4.rotateX(m, m, this.rotation[0]);
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
