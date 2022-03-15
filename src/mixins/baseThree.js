import * as THREE from "three";

export const baseThree = {
    data() {
        return {
            scene: new THREE.Scene(),
            camera: null,
            renderer: null,
            cameraOptions: {
                fov: 50,
                near: 0.1,
                far: 1000,
            },
            BACKGROUND_COLOR: 0xfefefe,
            plane: {
                geometry: [5000, 5000, 1, 1],
                material: {
                    color: 0xcccccc,
                    shininess: 0,
                },
            },
            hasFog: false,
        }
    },
    mounted() {
        this.scene.background = new THREE.Color(this.BACKGROUND_COLOR);
        if (this.hasFog)
            this.scene.fog = new THREE.Fog(this.BACKGROUND_COLOR, 20, 100);
        this.canvas = document.querySelector("#chair");

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
    }
}