import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Physics2 {
  constructor(plane, wheels) {
    /**
     * Physics
     **/
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.gravity.set(0, -1, 0);
    this.world.defaultContactMaterial.friction = 0;

    var groundMaterial = new CANNON.Material("groundMaterial");
    var wheelMaterial = new CANNON.Material("wheelMaterial");
    var wheelGroundContactMaterial = new CANNON.ContactMaterial(
      wheelMaterial,
      groundMaterial,
      {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
      }
    );

    this.world.addContactMaterial(wheelGroundContactMaterial);

    // car physics body
    var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1, 2.5));
    console.log(chassisShape);
    this.chassisBody = new CANNON.Body({ mass: 150 });
    this.chassisBody.addShape(chassisShape);
    this.chassisBody.position.set(1, 5, 1);
    this.chassisBody.angularVelocity.set(0, 0, 0); // initial velocity

    // car visual body
    // var geometry = new THREE.BoxGeometry(2, 0.6, 4); // double chasis shape
    // var material = new THREE.MeshBasicMaterial({
    //   color: 0xffff00,
    //   side: THREE.DoubleSide,
    // });
    // var box = new THREE.Mesh(geometry, material);
    // scene.add(box);

    // parent vehicle object
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0, // x
      indexUpAxis: 1, // y
      indexForwardAxis: 2, // z
    });

    console.log(this.vehicle);

    // wheel options
    var options = {
      radius: 0.5,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 45,
      suspensionRestLength: 0.4,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.5,
      maxSuspensionForce: 200000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
      maxSuspensionTravel: 0.25,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    var axlewidth = 1.1;
    options.chassisConnectionPointLocal.set(-axlewidth, 0, 1);
    this.vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(axlewidth, 0, 1);
    this.vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-axlewidth, 0, -1);
    this.vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(axlewidth, 0, -1);
    this.vehicle.addWheel(options);

    this.vehicle.addToWorld(this.world);

    // car wheels
    var wheelBodies = [];
    // var wheelVisuals = [];
    this.vehicle.wheelInfos.forEach(function (wheel) {
      var shape = new CANNON.Cylinder(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        20
      );
      var body = new CANNON.Body({ mass: 1, material: wheelMaterial });
      var q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      body.addShape(shape, new CANNON.Vec3(), q);
      wheelBodies.push(body);
      // wheel visual body
      //   var geometry = new THREE.CylinderGeometry(
      //     wheel.radius,
      //     wheel.radius,
      //     0.4,
      //     32
      //   );
      //   var material = new THREE.MeshPhongMaterial({
      //     color: 0xd0901d,
      //     emissive: 0xaa0000,
      //     side: THREE.DoubleSide,
      //     flatShading: true,
      //   });
      //   var cylinder = new THREE.Mesh(geometry, material);
      //   cylinder.geometry.rotateZ(Math.PI / 2);
      //   wheelVisuals.push(cylinder);
      //   scene.add(cylinder);
    });

    // update the wheels to match the physics
    this.world.addEventListener(
      "postStep",
      function () {
        for (var i = 0; i < wheels.length; i++) {
          this.vehicle.updateWheelTransform(i);
          var t = this.vehicle.wheelInfos[i].worldTransform;
          // update wheel physics
          wheelBodies[i].position.copy(t.position);
          wheelBodies[i].quaternion.copy(t.quaternion);
          // update wheel visuals
          let wheel = wheels[i];
          vec3.set(
            wheel.translation,

            t.position.x,
            t.position.y,
            t.position.z
          );
          quat.set(
            wheel.rotation,
            t.quaternion.x,
            t.quaternion.y,
            t.quaternion.z,
            t.quaternion.w
          );
          // wheelVisuals[i].position.copy(t.position);
          // wheelVisuals[i].quaternion.copy(t.quaternion);
        }
      }.bind(this)
    );
    // var q = plane.quaternion;
    this.planeBody = new CANNON.Body({
      mass: 0, // mass = 0 makes the body static
      material: groundMaterial,
      shape: new CANNON.Plane(),
      quaternion: new CANNON.Quaternion(-Math.PI / 2, 0, 0, 1),
    });
    console.log(this.planeBody);
    this.world.add(this.planeBody);

    /**
     * Main
     **/
    this.enable();
  }

  updatePhysics(dt, car, plane) {
    if (this.world) this.world.step(dt);
    // update the chassis position
    vec3.set(
      car.translation,

      this.chassisBody.position.x,
      this.chassisBody.position.y,
      this.chassisBody.position.z
    );

    quat.set(
      car.rotation,
      this.chassisBody.quaternion.x,
      this.chassisBody.quaternion.y,
      this.chassisBody.quaternion.z,
      this.chassisBody.quaternion.w
    );

    // vec3.set(
    //   plane.translation,

    //   this.planeBody.position.x,
    //   this.planeBody.position.y,
    //   this.planeBody.position.z
    // );

    // quat.set(
    //   plane.rotation,
    //   this.planeBody.quaternion.x,
    //   this.planeBody.quaternion.y,
    //   this.planeBody.quaternion.z,
    //   this.planeBody.quaternion.w
    // );

    // console.log(
    //   this.chassisBody.position.x,
    //   this.chassisBody.position.y,
    //   this.chassisBody.position.z
    // );
    // console.log(car.translation);
    // box.position.copy(chassisBody.position);
    // box.quaternion.copy(chassisBody.quaternion);
  }

  updateScene(scene) {
    scene.traverse((node) => {
      node.updateMatrix();
      // node.updateTransform();
    });
  }

  navigate(e) {
    if (e.type != "keydown" && e.type != "keyup") return;
    var keyup = e.type == "keyup";
    this.vehicle.setBrake(0, 0);
    this.vehicle.setBrake(0, 1);
    this.vehicle.setBrake(0, 2);
    this.vehicle.setBrake(0, 3);

    var engineForce = 800,
      maxSteerVal = 0.3;
    switch (e.keyCode) {
      case 38: // forward
        this.vehicle.applyEngineForce(keyup ? 0 : -engineForce, 2);
        this.vehicle.applyEngineForce(keyup ? 0 : -engineForce, 3);
        break;

      case 40: // backward
        this.vehicle.applyEngineForce(keyup ? 0 : engineForce, 2);
        this.vehicle.applyEngineForce(keyup ? 0 : engineForce, 3);
        break;

      case 39: // right
        this.vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 2);
        this.vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 3);
        break;

      case 37: // left
        this.vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 2);
        this.vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 3);
        break;
    }
  }

  enable() {
    document.addEventListener("keydown", this.navigate.bind(this));
    document.addEventListener("keyup", this.navigate.bind(this));
  }

  disable() {
    document.removeEventListener("keydown", this.navigate.bind(this));
    document.removeEventListener("keyup", this.navigate.bind(this));
  }
}
