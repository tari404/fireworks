<template>
  <div id="app">
  </div>
</template>

<script>
import * as THREE from 'three'
import { CopyMaterial, ShaderPass, EffectComposer, RenderPass } from 'postprocessing'
// import OrbitControls from 'three-orbitcontrols'

import LineGeometry from './lib/LineGeometry'
import LineMaterial from './lib/LineMaterial'
import Line2 from './lib/Line'

window.THREE = THREE
const deg = Math.PI / 180

let raf = 0

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

window.renderer = renderer

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(0, 2, 0)
camera.lookAt(1, 0, 0)

const composer = new EffectComposer(renderer)

const copyMaterial = new CopyMaterial()
copyMaterial.blending = THREE.AdditiveBlending
const copyPass = new ShaderPass(copyMaterial)
copyPass.renderToScreen = true

const renderPass = new RenderPass(scene, camera)

composer.addPass(renderPass)
composer.addPass(copyPass)

const geometry = new LineGeometry()

function updateColor (geometry, h) {
  const color = new THREE.Color()
  color.setHSL(h, 1.0, 1.0) // Temporarily only use material color
  const colors = []
  for (let i = 0; i < 18; i++) {
    colors.push(color.r, color.g, color.b)
  }
  geometry.setColors(colors)
}
updateColor(geometry, 0.81)

const material = new LineMaterial({
  // blending: THREE.AdditiveBlending,
  color: 0xd900ff,
  width: 4,
  vertexColors: THREE.VertexColors
})
const line = new Line2(geometry, material)

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

const raysCount = 60
for (let k = 0; k < 20; k++) {
  const r = Math.random() * Math.PI * 2
  const x = Math.sin(r) * 100
  const z = Math.cos(r) * 100
  for (let i = 0; i < raysCount; i++) {
    const positions = []
    const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    const speed = Math.random() * 0.7 + 0.5
    for (let j = 0; j < 18; j++) {
      positions.push(
        x + dir.x * j * speed,
        30 + dir.y * j * speed - j * j / 50,
        z + dir.z * j * speed
      )
    }
    const lineCopy = line.clone()
    lineCopy.geometry.setPositions(positions)
    lineCopy.computeLineDistances()
    scene.add(lineCopy)
  }
}

const axesHelper = new THREE.AxesHelper(1)
scene.add(axesHelper)

// const dir = new THREE.Vector3(1, 2, 0)
// dir.normalize()
// const origin = new THREE.Vector3(0, 0, 0)
// const length = 1
// const hex = 0xffff00
// const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex)
// scene.add(arrowHelper)

const planeGeometry = new THREE.CircleGeometry(10, 32)
const planeMateral = new THREE.MeshBasicMaterial({ color: 0xffffff })
const plane = new THREE.Mesh(planeGeometry, planeMateral)
plane.rotation.set(-Math.PI / 2, 0, 0)
plane.position.setY(-2)
scene.add(plane)

// const boxGeometry = new THREE.BoxBufferGeometry(1, 0.2, 1.5)
// const boxMateral = new THREE.MeshStandardMaterial({ color: 0xff00ff })
// const box = new THREE.Mesh(boxGeometry, boxMateral)
// const boxAxesHelper = new THREE.AxesHelper(0.9)
// box.add(boxAxesHelper)
// scene.add(box)

// const env = new THREE.HemisphereLight(0xffffff, 0x888888, 1.0)
// scene.add(env)

let resizeReduction = 0
function resize () {
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(innerWidth, innerHeight)
  composer.setSize(innerWidth, innerHeight)
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
}

let colorLock = false

export default {
  name: 'App',
  data () {
    return {
      alpha: 0,
      beta: 90,
      gamma: 0
    }
  },
  mounted () {
    window.addEventListener('deviceorientation', this.orient)
    window.addEventListener('resize', this.onresize)
    this.$el.appendChild(renderer.domElement)
    // const controls = new OrbitControls(camera, renderer.domElement)
    // controls.update()
    raf = requestAnimationFrame(this.render)
  },
  methods: {
    onresize () {
      clearTimeout(resizeReduction)
      resizeReduction = setTimeout(resize, 200)
    },
    orient (e) {
      this.alpha = e.alpha
      this.beta = e.beta
      this.gamma = e.gamma
    },
    render (time) {
      material.resolution.set(innerWidth, innerHeight)
      material.sqrtLifeTime = 0.7
      // material.sqrtLifeTime = Math.sqrt(time % 2000 / 1500)
      if (time % 2000 > 1700 && !colorLock) {
        colorLock = true
        // material.color = new THREE.Color().setHSL(Math.random(), 1, 0.6)
      }
      if (time % 2000 < 500 && colorLock) {
        colorLock = false
      }
      const rotateGamma = new THREE.Matrix4().makeRotationY(this.gamma * deg)
      const rotateBeta = new THREE.Matrix4().makeRotationX(this.beta * deg).multiply(rotateGamma)
      const rotateAlpha = new THREE.Matrix4().makeRotationZ(this.alpha * deg).multiply(rotateBeta)
      const rotate = new THREE.Matrix4().makeRotationX(-90 * deg).multiply(rotateAlpha)
      // const dir = new THREE.Vector3(0, -1, 0).applyMatrix4(rotateAlpha)
      camera.position.set(0, 0, 0)
      camera.setRotationFromMatrix(rotate)
      // camera.lookAt(dir)
      // box.setRotationFromMatrix(rotate)
      // camera.lookAt(0, 0, 0)
      // renderer.render(scene, camera)
      composer.render(time)
      raf = requestAnimationFrame(this.render)
    }
  },
  beforeDestroy () {
    cancelAnimationFrame(raf)
    window.removeEventListener('deviceorientation', this.orient)
    window.removeEventListener('resize', this.onresize)
  }
}
</script>

<style lang="stylus">
body
  margin 0
  background-color #000
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
canvas
  display block
</style>
