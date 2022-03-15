import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {colors} from "@/config/colors";

export const chairMixin = {
    colors,
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
    }
}