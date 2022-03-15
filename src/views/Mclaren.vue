<template>
  <div class="component-main">
    <div class="options-list">
      <ul class="options-ul">
        <li class="options-li"><a href="/">Home</a></li>
        <li class="options-li"><a href="/chair">Chair model</a></li>
        <li class="options-li" @click="getOptionClick('wheel')">Wheel</li>
        <li class="options-li" @click="getOptionClick('tyre')">Tyre</li>
        <li class="options-li" @click="getOptionClick('headLights')">Head lights</li>
        <li class="options-li" @click="getOptionClick('body')">Body</li>
        <li class="options-li" @click="getOptionClick('dashboard')">Dashboard</li>
        <li class="options-li" @click="getOptionClick('interiors')">Interiors</li>
      </ul>
    </div>
    <canvas id="c"></canvas>

    <b-modal v-model="detailActive" hide-footer hide-header-close>
      <div style="width: 100%">
        <CarDetail :detail="activeCarDetail" @handleNewColor="handleNewColor" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import CarDetail from "@/components/CarDetail";
import {tyresName, wheelsName, headLights, interiors} from "@/config/carparts";

var carModel;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Mclaren",
  components: {CarDetail},
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
      cameraFar: 10,
      hemisphereLightOptions: {
        skyColor: 0xffffff,
        groundColor: 0xffffff,
        intensity: 0.61,
      },
      dirLightOptions: {
        color: 0xffffff,
        intensity: 0.54,
        position: [-2,8,8],
      },
      plane: {
        geometry: [5000,5000,1,1],
        material: {
          color: 0xcccccc,
          shininess: 0,
        },
      },
      MODEL_PATH: "/models/lotus/lotus.gltf",
      activeCarDetail: null,
      detailActive: false,
      initRotate: 0,
    };
  },
  mounted() {
    this.scene.background = new THREE.Color(this.BACKGROUND_COLOR);
    this.scene.fog = new THREE.Fog(this.BACKGROUND_COLOR, 20, 100);
    this.canvas = document.querySelector("#c");

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

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
    this.loadModel()
    this.setControls();

    this.render();

    window.addEventListener('keydown', this.handleKeyPressDown);

  },
  methods: {
    setHemiLight () {
      var hemiLight = new THREE.HemisphereLight(
          this.hemisphereLightOptions.skyColor,
          this.hemisphereLightOptions.groundColor,
          this.hemisphereLightOptions.intensity,
      );
      hemiLight.position.set(20, 20, 50);
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
    loadModel() {
      var tempScene = this.scene;

      new OBJLoader().load(
          '/models/lotus/lotusobj.obj',
          function (obj) {
            obj.traverse((o) => {
              if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                if(tyresName.includes(o.name)) {
                  o.material = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shininess: 1,
                  });
                }
                else if(wheelsName.includes(o.name)) {
                  o.material = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    shininess: 1,
                  });
                }
                else if (headLights.includes(o.name)) {
                  o.material = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    shininess: 1,
                  });
                }
                else if (o.name === 'Lotus_HW_glass') {
                  o.material = new THREE.MeshPhysicalMaterial({
                    transparent: true
                  })
                }
                else if (interiors.includes(o.name)) {
                  o.material = new THREE.MeshPhongMaterial({
                    color: 0xc07116,
                    shininess: 1,
                  });
                }
                else {
                  o.material = new THREE.MeshPhongMaterial({
                    color: 0xff0000,
                    shininess: 1,
                  });
                }
              }
            });

            obj.scale.set(0.02, 0.02,0.02)
            obj.position.y = -0.7
            carModel = obj
            tempScene.add(obj);
          }
      )
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
        this.initialRotation()
      }
    },
    getOptionClick(option) {
      this.activeCarDetail = option;
      this.detailActive = true;
    },
    handleNewColor(color) {
      this.detailActive = false;
      var c = color.replace('#','')
      carModel.traverse((o) => {
        if (this.activeCarDetail === 'wheel') {
          if(wheelsName.includes(o.name)) {
            o.material = new THREE.MeshPhongMaterial({
              color: parseInt('0x'+c),
              shininess: 1,
            });
          }
        } else if (this.activeCarDetail === 'tyre') {
          if(tyresName.includes(o.name)) {
            o.material = new THREE.MeshPhongMaterial({
              color: parseInt('0x'+c),
              shininess: 1,
            });
          }
        } else if (this.activeCarDetail === 'headLights') {
          if (headLights.includes(o.name)) {
            o.material = new THREE.MeshPhongMaterial({
              color: parseInt('0x'+c),
              shininess: 1,
            });
          }
        } else if (this.activeCarDetail === 'body') {
          if (o.name === 'Lotus_HW_body' || o.name === 'Lotus_HW_body3') {
            o.material = new THREE.MeshPhongMaterial({
              color: parseInt('0x'+c),
              shininess: 1,
            })
          }
        } else if(this.activeCarDetail === 'dashboard') {
          if (o.name === 'Lotus_HW_dashboard1') {
            o.material = new THREE.MeshPhongMaterial({
              color: parseInt('0x'+c),
              shininess: 1,
            })
          }
          // eslint-disable-next-line no-dupe-else-if
        } else if(this.activeCarDetail === 'interiors') {
          if (interiors.includes(o.name)) {
            o.material = new THREE.MeshPhongMaterial({
              color: parseInt('0x'+c),
              shininess: 1,
            })
          }
        }
      })
    },
    handleKeyPressDown(e) {
      if(e.key === 'ArrowUp') {
        carModel.position.x -= 0.01;
      }
      if(e.key === 'ArrowDown') {
        carModel.position.x += 0.01;
      }
      if(e.key === 'ArrowRight') {
        carModel.position.z -= 0.01
      }
      if(e.key === 'ArrowLeft') {
        carModel.position.z += 0.01
      }
    },
    initialRotation() {
      if(carModel) {
        this.initRotate ++;
        if(this.initRotate <= 140) {
          carModel.rotation.y += Math.PI / 60;
        }
      }
    }
  },
  beforeDestroy() {
    this.scene.clear()
    this.camera.clear()
    this.renderer.clear()
    this.renderer = null
    document.querySelector('#c').remove()
  }

}
</script>

<style>
  .options-list {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  .options-ul {
    padding: 15px;
    text-align: left;
    width: 200px;
    border: 1px solid;
    list-style: none;
    border-radius: 10px;
  }
  .options-li {
    margin-bottom: 5px;
    border-bottom: 1px solid #ccc;
    padding: 5px;
  }
  .component-main{
    width: 90%;
    height: 100%;
  }
</style>