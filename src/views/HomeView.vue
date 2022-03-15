<template>
  <section class="home">
    <div id="nav-card">
      <router-link to="/car">
        <h4>Car 3D Model</h4>
        <div class="w-100 text-center">
          <img src="/models/lotus/Lotus_HW_logo_diffuse.jpg" class="w-100" alt="">
        </div>
      </router-link>
    </div>
    <div id="chair-card">
      <router-link to="chair">
        <h4 class="mb-1">Chair 3D Model</h4>
        <div class="w-100 text-center">
          <img src="/images/chair/cushions.svg" class="w-100" alt="">
        </div>
      </router-link>
    </div>
    <div id="homePage"></div>
  </section>
</template>

<script>
import * as THREE from "three"

export default  {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  data() {
    return {
      scene: new THREE.Scene(),
      camera: null,
      renderer: null,
      startGeometry: null,
      stars: null,
    }
  },
  mounted() {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 1;
    this.camera.rotation.x = Math.PI / 2;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('homePage').appendChild(this.renderer.domElement);
    this.createStartParticle()
    this.render()

  },
  methods: {
    render() {
      this.startGeometry.verticesNeedUpdate = true;
      this.stars.rotation.z += 0.0005;
      this.stars.rotation.x -= 0.0005;
      this.stars.rotation.y += 0.0001;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
    },
    createStartParticle() {
      this.startGeometry = new THREE.BufferGeometry();
      var pointsArray = new Array()
      for(let i=0;i<500000;i++) {
        let star = new THREE.Vector3(
            Math.random() * 8000 - 500,
            Math.random() * 8000 - 500,
            Math.random() * 8000 - 500,
        );
        pointsArray.push(star)
        star.velocity = 0;
        star.acceleration = 0.1
        // this.startGeometry.vertices.push(star)
      }
      this.startGeometry.setFromPoints(pointsArray)
      let starMaterial = new THREE.PointsMaterial({
        color: 0xffffe0,
        size: 2.5
      })
      this.stars = new THREE.Points(this.startGeometry, starMaterial);
      this.scene.add(this.stars)
    },
  },
  beforeDestroy() {
    this.scene.clear()
    this.camera.clear()
    this.renderer.clear()
    this.renderer = null
    document.querySelector('#homePage').remove()
  }
}
</script>

<style>
  .home {
    width: 100vw;
    height: 100vh;
    margin: 0;
    background: black;
    overflow: hidden;
  }
  #nav-card {
    position: absolute;
    top: 30%;
    left: 10%;
    width: 13%;
    background: #ffffff;
    padding: 10px;
    border-radius: 8px;
    opacity: 0.6;
    z-index: 1;
  }

  #nav-card:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    opacity: .4;
    z-index: -1;
  }

  #chair-card {
    position: absolute;
    top: 30%;
    right: 10%;
    width: 13%;
    background: #ffffff;
    padding: 10px;
    border-radius: 8px;
    opacity: 0.6;
    z-index: 1;
  }
</style>