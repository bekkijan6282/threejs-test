<template>
  <section>
    <canvas id="c"></canvas>
  </section>
</template>

<script>
import { colors } from '../config/colors';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default {
  name: 'HomeView',
  colors,
  data() {
    return {
      scene: new THREE.Scene(),
      camera: null,
      cameraOptions: {
        fov: 50,
        near: 0.1,
        far: 1000,
      },
      renderer: null,
      BACKGROUND_COLOR: 0xfefefe,
      canvas: null,
      cameraFar: 5,
      hemisphereLightOptions: {
        skyColor: 0xffffff,
        groundColor: 0xffffff,
        intensity: 0.61,
      },
      dirLightOptions: {
        color: 0xffffff,
        intensity: 0.54,
        position: [-8,12,8],
      },
      plane: {
        geometry: [5000,5000,1,1],
        material: {
          color: 0x0e4c94,
          shininess: 0,
        },
      },
      MODEL_PATH: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb",
      chairModel: null,
    }
  },
  mounted () {
    this.scene.background = new THREE.Color(this.BACKGROUND_COLOR);
    this.scene.fog = new THREE.Fog(this.BACKGROUND_COLOR, 20, 100);
    this.canvas = document.querySelector("#c");

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
        this.cameraOptions.fov,
        window.innerWidth / window.innerHeight,
        this.cameraOptions.near,
        this.cameraOptions.far
    );

    this.camera.position.z = this.cameraFar;
    this.camera.position.x = 0;

    this.setHemiLight();
    this.setDirLight();
    this.setPlane();
    this.setChairModel()
    this.setControls();
    // this.setSphere()


    this.render();
  },
  methods: {
    setHemiLight () {
      var hemiLight = new THREE.HemisphereLight(
          this.hemisphereLightOptions.skyColor,
          this.hemisphereLightOptions.groundColor,
          this.hemisphereLightOptions.intensity,
      );
      hemiLight.position.set(0, 50, 0);
      this.scene.add(hemiLight);
    },
    setDirLight() {
      var dirLight = new THREE.DirectionalLight(
          this.dirLightOptions.color,
          this.dirLightOptions.intensity,
      );
      dirLight.position.set(...this.dirLightOptions.position);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024,1024);
      this.scene.add(dirLight);
    },
    setPlane() {
      var planeGeometry = new THREE.PlaneGeometry(...this.plane.geometry);
      var planeMaterial = new THREE.MeshPhongMaterial(this.plane.material);

      var plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -0.5 * Math.PI;
      plane.receiveShadow = true;
      plane.position.y = -1;
      this.scene.add(plane);
    },
    setSphere() {
      var geometry = new THREE.TorusGeometry(.7, .2, 16, 100);
      var material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xff0000,
      });

      var sphere = new THREE.Points(geometry, material);
      this.scene.add(sphere);
    },

    setChairModel() {
      var chairModel;
      var tempScene = this.scene;

      new GLTFLoader().load(
          this.MODEL_PATH,
          function (gltf) {
            chairModel = gltf.scene;
            chairModel.traverse((o) => {
              if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
              }
            });

            chairModel.scale.set(2,2,2);
            chairModel.position.y = -1;

            const INITIAL_MTL = new THREE.MeshPhongMaterial({
              color: 0xf3f3f3,
              shininess: 1,
            });

            const INITIAL_MAP = [
              { childID: "back", mtl: INITIAL_MTL },
              { childID: "base", mtl: INITIAL_MTL },
              { childID: "cushions", mtl: INITIAL_MTL },
              { childID: "legs", mtl: INITIAL_MTL },
              { childID: "supports", mtl: INITIAL_MTL },
            ];


            function initColor(parent, type, mtl) {
              parent.traverse((o) => {
                if (o.isMesh) {
                  if (o.name.includes(type)) {
                    o.material = mtl;
                    o.nameID = type; // Set a new property to identify this object
                  }
                }
              });
            }

            for (let object of INITIAL_MAP) {
              initColor(chairModel,object.childID, object.mtl);
            }
            tempScene.add(chairModel)
          },
          undefined,
          function (error) {
            console.log(error);
          }
      )
    },
    setControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.maxPolarAngle = Math.PI / 2;
      controls.minPolarAngle = Math.PI / 3;
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.dampingFactor = 0.1;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.2;
    },
    resizeRendererToDisplaySize() {
      const canvas = this.renderer.domElement;
      var width = window.innerWidth;
      var height = window.innerHeight;
      var canvasPixelWidth = canvas.width / window.devicePixelRatio;
      var canvasPixelHeight = canvas.height / window.devicePixelRatio;

      const needResize =
          canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
      }
      return needResize;
    },
    render() {
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
      if (this.resizeRendererToDisplaySize()) {
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
      }
    }

  }
}
</script>
<style>
body,
html {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Raleway", sans-serif;
  font-size: 14px;
  color: #444444;
}
* {
  touch-action: manipulation;
}
*,
*:before,
*:after {
  box-sizing: border-box;
}
body {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

#c {
  width: 100%;
  height: 100%;
  display: block;
  top: 0;
  left: 0;
}

.controls {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.options {
  position: absolute;
  left: 0;
}
.option {
  background-size: cover;
  background-position: 50%;
  background-color: white;
  margin-bottom: 3px;
  padding: 10px;
  height: 55px;
  width: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.option:hover {
  border-left: 5px solid white;
  width: 58px;
}
.option.--is-active {
  border-right: 3px solid red;
  width: 58px;
  cursor: default;
}
.option.--is-active:hover {
  border-left: none;
}
.option img {
  height: 100%;
  width: auto;
  pointer-events: none;
}
.info {
  padding: 0 1em;
  display: flex;
  justify-content: flex-end;
}
.info p {
  margin-top: 0;
}
.tray {
  width: 100%;
  height: 50px;
  position: relative;
  overflow-x: hidden;
}
.tray__slide {
  position: absolute;
  display: flex;
  left: 0;
  /*   transform: translateX(-50%);
    animation: wheelin 1s 2s ease-in-out forwards; */
}
.tray__swatch {
  transition: 0.1s ease-in;
  height: 50px;
  min-width: 50px;
  flex: 1;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  background-size: cover;
  background-position: center;
}
.tray__swatch:nth-child(5n + 5) {
  margin-right: 20px;
}
.drag-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2em;
  width: 10em;
  height: 10em;
  box-sizing: border-box;
  font-size: 0.9em;
  font-weight: 800;
  text-transform: uppercase;
  text-align: center;
  border-radius: 5em;
  background: white;
  position: absolute;
}
.drag-notice.start {
  animation: popout 0.25s 3s forwards;
}
@keyframes popout {
  to {
    transform: scale(0);
  }
}
@keyframes wheelin {
  to {
    transform: translateX(0);
  }
}
@media (max-width: 960px) {
  .options {
    top: 0;
  }
  .info {
    padding: 0 1em 1em 0;
  }
  .info__message {
    display: flex;
    align-items: flex-end;
  }
  .info__message p {
    margin: 0;
    font-size: 0.7em;
  }
}
@media (max-width: 720px) {
  .info {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 1em 1em;
  }
  .info__message {
    margin-bottom: 1em;
  }
}
@media (max-width: 680px) {
  .info {
    padding: 1em 2em;
  }
  .info__message {
    display: none;
  }
  .options {
    bottom: 50px;
  }
  .option {
    margin-bottom: 1px;
    padding: 5px;
    height: 45px;
    width: 45px;
    display: flex;
  }
  .option.--is-active {
    border-right: 2px solid red;
    width: 47px;
  }
  .option img {
    height: 100%;
    width: auto;
    pointer-events: none;
  }
}
</style>
