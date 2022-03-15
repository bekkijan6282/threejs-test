<template>
  <section class="home">
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
      console.log(this.startGeometry)
      // this.startGeometry.vertices.forEach(p => {
      //   p.velocity += p.acceleration;
      //   p.y -= p.velocity;
      //   if(p.y < -200) {
      //     p.y = 200;
      //     p.velocity = 0;
      //   }
      // })
      this.startGeometry.verticesNeedUpdate = true;
      this.stars.rotation.y += 0.02;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
    },
    createStartParticle() {
      this.startGeometry = new THREE.BufferGeometry();
      var pointsArray = new Array()
      for(let i=0;i<6000;i++) {
        let star = new THREE.Vector3(
            Math.random() * 8000 - 100,
            Math.random() * 8000 - 100,
            Math.random() * 8000 - 100,
        );
        pointsArray.push(star)
        star.velocity = 0;
        star.acceleration = 0.2
        // this.startGeometry.vertices.push(star)
      }
      this.startGeometry.setFromPoints(pointsArray)
      let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 5
      })
      this.stars = new THREE.Points(this.startGeometry, starMaterial);
      this.scene.add(this.stars)
    }
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
</style>