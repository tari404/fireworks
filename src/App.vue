<template>
  <div id="app">
  </div>
</template>

<script>
import * as THREE from 'three'
import { CopyMaterial, ShaderPass, EffectComposer, RenderPass } from 'postprocessing'
// import OrbitControls from 'three-orbitcontrols'

import FireworkGeometry from './lib/FireworkGeometry'
import LineMaterial from './lib/LineMaterial'
import Firework from './lib/Firework'

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
scene.fog = new THREE.FogExp2(0x03060c, 0.01)

const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(0, 0, 0)
camera.lookAt(0, 0, -1)

const composer = new EffectComposer(renderer)

const copyMaterial = new CopyMaterial()
copyMaterial.blending = THREE.AdditiveBlending
const copyPass = new ShaderPass(copyMaterial)
copyPass.renderToScreen = true

const renderPass = new RenderPass(scene, camera)

composer.addPass(renderPass)
composer.addPass(copyPass)

const geometry = new FireworkGeometry(1)
const material = new LineMaterial({
  // blending: THREE.AdditiveBlending,
  vertexColors: THREE.VertexColors,
  depthTest: false,
  transparent: true,
  width: 2
})

class FireworkObj {
  constructor (geometry, material) {
    this.geometry = geometry
    this.material = material
    this.mesh = new Firework(geometry, material)

    this.mesh.computeLineDistances()
    this.refresh()
    this.resize()
  }

  update (time, core) {
    if (time > this.birth + 1100) {
      this.refresh(core)
    } else if (time > this.birth) {
      this.material.sqrtLifeTime = Math.sqrt((time - this.birth) / 1000)
    }
  }

  resize () {
    this.material.resolution.set(innerWidth, innerHeight)
  }

  refresh (core = 0) {
    this.birth = Date.now() + Math.random() * 1000
    const theta = (Math.random() - 0.5) * Math.PI + core
    const distance = Math.random() * 60 + 50
    this.geometry.updatePositions()
    this.geometry.baseColor.set(new THREE.Color().setHSL(1 - Math.random() * 0.48, 1, 0.6))
    this.geometry.updateColors()
    this.mesh.position.set(
      Math.cos(theta) * distance,
      Math.random() * 30,
      Math.sin(theta) * distance
    )
  }
}
const fireworks = []
for (let i = 0; i < 60; i++) {
  const firework = new FireworkObj(geometry.clone(), material.clone())
  scene.add(firework.mesh)
  fireworks.push(firework)
}

// const axesHelper = new THREE.AxesHelper(1)
// scene.add(axesHelper)

const planeGeometry = new THREE.CircleGeometry(8, 64)
const planeMateral = new THREE.MeshBasicMaterial({ color: 0x1b2c3c })
const plane = new THREE.Mesh(planeGeometry, planeMateral)
plane.rotation.set(-Math.PI / 2, 0, 0)
plane.position.setY(-2)
scene.add(plane)

const boxGeometry = new THREE.BoxGeometry(500, 500, 500)
const boxMateral = new THREE.MeshBasicMaterial({
  color: 0x03060c,
  side: THREE.DoubleSide
})
const box = new THREE.Mesh(boxGeometry, boxMateral)
scene.add(box)

let resizeReduction = 0
function resize () {
  fireworks.forEach(firework => {
    firework.resize()
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(innerWidth, innerHeight)
  composer.setSize(innerWidth, innerHeight)
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
}

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
      // firework.material.resolution.set(innerWidth, innerHeight)
      // material.resolution.set(innerWidth, innerHeight)
      // material.sqrtLifeTime = Math.sqrt(time % 2000 / 1000)
      // if (time % 2000 > 1700 && !colorLock) {
      //   colorLock = true
      //   material.color = new THREE.Color().setHSL(Math.random(), 0.9, 1)
      //   geometry.updatePositions()
      // }
      // if (time % 2000 < 500 && colorLock) {
      //   colorLock = false
      // }
      const rotateGamma = new THREE.Matrix4().makeRotationY(this.gamma * deg)
      const rotateBeta = new THREE.Matrix4().makeRotationX(this.beta * deg).multiply(rotateGamma)
      const rotateAlpha = new THREE.Matrix4().makeRotationZ(this.alpha * deg).multiply(rotateBeta)
      const rotate = new THREE.Matrix4().makeRotationX(-90 * deg).multiply(rotateAlpha)

      const dir = new THREE.Vector3(0, 0, -1).applyMatrix4(rotate)
      const thetaY = Math.atan2(dir.z, dir.x)

      const now = Date.now()
      fireworks.forEach(firework => {
        firework.update(now, thetaY)
      })

      camera.position.set(0, 0, 0)
      camera.setRotationFromMatrix(rotate)

      // composer.render(time)
      renderer.render(scene, camera)
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
