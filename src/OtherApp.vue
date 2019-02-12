<template>
  <div id="app">
  </div>
</template>

<script>
import * as THREE from 'three'
import {
  CopyMaterial, ShaderPass, EffectComposer, RenderPass,
  EffectPass, SMAAEffect
} from 'postprocessing'
import OrbitControls from 'three-orbitcontrols'

import FireworkGeometry from './lib/FireworkGeometry'
import LineMaterial from './lib/LineMaterial'
import Firework from './lib/Firework'

window.THREE = THREE
// const deg = Math.PI / 180

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
camera.position.set(0, 40, 60)
camera.lookAt(0, 0, 0)

const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)

const areaImage = new Image()
areaImage.src = SMAAEffect.areaImageDataURL
const searchImage = new Image()
searchImage.src = SMAAEffect.searchImageDataURL
const smaa = new SMAAEffect(searchImage, areaImage)
smaa.setOrthogonalSearchSteps(8)
const effectPass = new EffectPass(camera, smaa)

const copyMaterial = new CopyMaterial()
// copyMaterial.blending = THREE.AdditiveBlending
const copyPass = new ShaderPass(copyMaterial)
copyPass.renderToScreen = true

composer.addPass(renderPass)
composer.addPass(effectPass)
composer.addPass(copyPass)

const geometry = new FireworkGeometry(1.6)
const material = new LineMaterial({
  // blending: THREE.AdditiveBlending,
  transparent: true,
  color: 0xd900ff,
  width: 3
})
const firework = new Firework(geometry, material)
firework.computeLineDistances()
// firework.position.set(0, 40, -60)
scene.add(firework)

const axesHelper = new THREE.AxesHelper(1)
scene.add(axesHelper)

const planeGeometry = new THREE.CircleGeometry(10, 64)
const planeMateral = new THREE.MeshBasicMaterial({
  color: 0x999999
})
const plane = new THREE.Mesh(planeGeometry, planeMateral)
plane.rotation.set(-Math.PI / 2, 0, 0)
plane.position.setY(-2)
scene.add(plane)

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
  mounted () {
    window.addEventListener('resize', this.onresize)
    this.$el.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.update()
    raf = requestAnimationFrame(this.render)
  },
  methods: {
    onresize () {
      clearTimeout(resizeReduction)
      resizeReduction = setTimeout(resize, 200)
    },
    render (time) {
      material.resolution.set(innerWidth, innerHeight)
      // material.sqrtLifeTime = 0.7
      material.sqrtLifeTime = Math.sqrt(time % 2000 / 1000)
      if (time % 2000 > 1700 && !colorLock) {
        colorLock = true
        material.color = new THREE.Color().setHSL(Math.random(), 1, 0.6)
        geometry.updatePositions()
      }
      if (time % 2000 < 500 && colorLock) {
        colorLock = false
      }
      // camera.position.set(0, 40, 60)
      // camera.lookAt(0, 0, 0)

      // composer.render(time)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(this.render)
    }
  },
  beforeDestroy () {
    cancelAnimationFrame(raf)
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
