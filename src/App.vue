<template>
  <div id="app">
  </div>
</template>

<script>
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'

import './lib/LineGeometry'
import './lib/LineMaterial'
import './lib/Line'

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  premultipliedAlpha: false,
  antialias: true
})
renderer.setSize(innerWidth, innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(0, -50, 50)
camera.lookAt(0, 0, 0)

window.THREE = THREE

const color = new THREE.Color()
const colors = []
for (let i = 0; i < 18; i++) {
  color.setHSL(0.81, 1.0, 0.5)
  colors.push(color.r, color.g, color.b)
}
const geometry = new THREE.LineGeometry()
geometry.setColors(colors)
const material = new THREE.LineMaterial({
  // blending: THREE.AdditiveBlending,
  color: 0xffffff,
  linewidth: 4,
  vertexColors: THREE.VertexColors
})
const line = new THREE.Line2(geometry, material)

window.material = material

// const positions = []
// const dire = new THREE.Vector3(Math.random() - 1, Math.random() - 1, Math.random() - 1)
// for (let j = 0; j < 20; j++) {
//   positions.push(
//     dire.x * j,
//     dire.y * j,
//     dire.z * j
//   )
// }
// line.geometry.setPositions(positions)
// line.computeLineDistances()
// scene.add(line)

const raysCount = 200
for (let i = 0; i < raysCount; i++) {
  const positions = []
  const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
  const speed = Math.random() * 0.7 + 0.5
  for (let j = 0; j < 18; j++) {
    positions.push(
      dir.x * j * speed,
      6 + dir.y * j * speed - j * j / 50,
      dir.z * j * speed
    )
  }
  const lineCopy = line.clone()
  lineCopy.geometry.setPositions(positions)
  lineCopy.geometry.setColors(colors)
  lineCopy.computeLineDistances()
  scene.add(lineCopy)
}

// const axesHelper = new THREE.AxesHelper(1)
// scene.add(axesHelper)

// const dir = new THREE.Vector3(1, 2, 0)
// dir.normalize()
// const origin = new THREE.Vector3(0, 0, 0)
// const length = 1
// const hex = 0xffff00
// const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex)
// scene.add(arrowHelper)

export default {
  name: 'App',
  mounted () {
    window.addEventListener('resize', this.onresize)
    this.$el.appendChild(renderer.domElement)
    // const controls = new OrbitControls(camera, renderer.domElement)
    // controls.update()
    requestAnimationFrame(this.render)
  },
  methods: {
    onresize () {
      renderer.setSize(innerWidth, innerHeight)
      camera.aspect = innerWidth / innerHeight
      camera.updateProjectionMatrix()
    },
    render (time) {
      material.resolution.set(innerWidth, innerHeight)
      material.sqrtLifeTime = Math.sqrt(time % 2000 / 1500)
      camera.position.set(Math.sin(time / 5000) * 50, -50, Math.cos(time / 5000) * 50)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      requestAnimationFrame(this.render)
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onresize)
  }
}
</script>

<style lang="stylus">
body
  margin 0
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  background-color #000
canvas
  display block
</style>
