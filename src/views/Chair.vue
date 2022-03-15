<template>
  <section>
    <div class="options">
      <div class="option --is-active" data-option="legs">
        <img
            src="/images/chair/legs.svg"
            alt=""
        />
      </div>
      <div class="option" data-option="cushions">
        <img
            src="/images/chair/cushions.svg"
            alt=""
        />
      </div>
      <div class="option" data-option="base">
        <img
            src="/images/chair/base.svg"
            alt=""
        />
      </div>
      <div class="option" data-option="supports">
        <img
            src="/images/chair/supports.svg"
            alt=""
        />
      </div>
      <div class="option" data-option="back">
        <img
            src="/images/chair/back.svg"
            alt=""
        />
      </div>
    </div>
    <canvas id="c"></canvas>
    <div class="controls">
      <div id="js-tray" class="tray">
        <div id="js-tray-slide" class="tray__slide"></div>
      </div>
    </div>
  </section>
</template>

<script>
import { colors } from '../config/colors';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

var chairModel;


export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Chair',
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
          color: 0xcccccc,
          shininess: 0,
        },
      },
      MODEL_PATH: "/models/chair/chair.glb",
      chairModel: null,
      activeOption: 'legs',
      options: null,
      loaded: false,
      initRotate: 0,
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
    this.buildCustomColors();
    this.addListenerToSwatches()
    this.handleChairOptionSet()
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
    buildCustomColors() {
      var palette = document.getElementById('js-tray-slide');

      for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');
        if (color.texture) {
          swatch.style.backgroundImage = "url("+color.texture+")";
        } else {
          swatch.style.background = '#'+color.color;
        }

        swatch.setAttribute('data-key',i);
        palette.append(swatch);
      }
    },
    addListenerToSwatches() {
      var swatches = document.querySelectorAll('.tray__swatch');

      for (const swatch of swatches) {
        swatch.addEventListener('click', this.handleSwatchClick);
      }
    },
    handleSwatchClick(e) {
      let color = colors[parseInt(e.target.dataset.key)];
      let new_mtl;
      if (color.texture) {
        let txt = new THREE.TextureLoader().load(color.texture);
        txt.repeat.set( color.size[0], color.size[1], color.size[2]);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;
        new_mtl = new THREE.MeshPhongMaterial({
          color: parseInt('0x'+color.color),
          shininess: color.shininess ? color.shininess : 10
        });
      }   else
      {
        new_mtl = new THREE.MeshPhongMaterial({
          color: parseInt('0x' + color.color),
          shininess: color.shininess ? color.shininess : 10

        });
      }

      this.setMaterial( this.activeOption, new_mtl);
    },
    setMaterial( type, mtl) {
      chairModel.traverse((o) => {
        if (o.isMesh && o.nameID != null) {
          if(o.nameID == type) {
            o.material = mtl;
          }
        }
      })
    },
    handleChairOptionSet() {
      this.options = document.querySelectorAll('.option');
      for (const option of this.options) {
        option.addEventListener('click', this.handleOptionCLick)
      }
    },
    handleOptionCLick(e) {
      let option = e.target;
      this.activeOption = e.target.dataset.option;
      for (const otherOption of this.options) {
        otherOption.classList.remove('--is-active');
      }
      option.classList.add('--is-active');
    },
    initialRotation() {
      this.initRotate++;
      if (this.initRotate <= 120) {
        chairModel.rotation.y += Math.PI / 60;
      } else {
        this.loaded = true;
      }
    },
    render() {
      // const DRAG_NOTICE = document.getElementById('js-drag-notice');
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
      if (this.resizeRendererToDisplaySize()) {
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
      }
      if (chairModel != null && this.loaded == false) {
        this.initialRotation();
        // DRAG_NOTICE.classList.add('start');

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
