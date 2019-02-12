/**
 * @author Felix Cai / http://github.com/tari404
 *
 */

import * as THREE from 'three'

export default class FireworkGeometry extends THREE.InstancedBufferGeometry {
  constructor (
    velocity = 5,
    amount = 32,
    segments = 10,
    baseColor = 0xd900ff
  ) {
    super()

    this.velocity = velocity
    this.amount = amount
    this.segments = segments
    this.baseColor = baseColor

    const positions = [ -1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0 ]
    const uvs = [ -1, 2, 1, 2, -1, 1, 1, 1, -1, 0, 1, 0 ]
    const index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3 ]

    this.setIndex(index)
    this.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    this.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

    this.type = 'FireworkGeometry'

    this.updatePositions()
    this.updateColors()
  }

  static isFireworkGeometry = true

  updatePositions () {
    const g = 9.80665
    const m = 0.01
    // converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format
    // const length = this.amount * this.segments
    const points = []
    for (let i = 0; i < this.amount; i++) {
      const thetaY = Math.random() * Math.PI * 2
      const thetaX = (Math.random() - 0.5) * Math.PI
      let dy = this.velocity * Math.sin(thetaX)
      const dxz = this.velocity * Math.cos(thetaX)
      const dx = dxz * Math.cos(thetaY)
      const dz = dxz * Math.sin(thetaY)
      let x = 0
      let y = 0
      let z = 0
      points.push(x, y, z)
      for (let step = 1; step < this.segments; step++) {
        y += dy
        x += dx
        z += dz
        dy -= m * g
        points.push(x, y, z, x, y, z)
      }
      points.push(x + dx, y + dy, z + dz)
    }

    const buffer = new Float32Array(points)

    var instanceBuffer = new THREE.InstancedInterleavedBuffer(buffer, 6, 1) // xyz, xyz

    this.addAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0)) // xyz
    this.addAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3)) // xyz

    this.computeBoundingBox()
    this.computeBoundingSphere()

    return this
  }

  updateColors () {
    const length = this.amount * this.segments
    const colors = new Float32Array(6 * length)

    colors.fill(this.baseColor)

    var instanceColorBuffer = new THREE.InstancedInterleavedBuffer(colors, 6, 1) // rgb, rgb

    this.addAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 0)) // rgb
    this.addAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 3)) // rgb

    return this
  }

  applyMatrix (matrix) {
    var start = this.attributes.instanceStart
    var end = this.attributes.instanceEnd

    if (start !== undefined) {
      matrix.applyToBufferAttribute(start)

      matrix.applyToBufferAttribute(end)

      start.data.needsUpdate = true
    }

    if (this.boundingBox !== null) {
      this.computeBoundingBox()
    }

    if (this.boundingSphere !== null) {
      this.computeBoundingSphere()
    }

    return this
  }

  computeBoundingBox () {
    const box = new THREE.Box3()
    if (this.boundingBox === null) {
      this.boundingBox = new THREE.Box3()
    }
    const start = this.attributes.instanceStart
    const end = this.attributes.instanceEnd
    if (start !== undefined && end !== undefined) {
      this.boundingBox.setFromBufferAttribute(start)
      box.setFromBufferAttribute(end)
      this.boundingBox.union(box)
    }
  }

  computeBoundingSphere () {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere()
    }

    if (this.boundingBox === null) {
      this.computeBoundingBox()
    }

    const vector = new THREE.Vector3()

    var start = this.attributes.instanceStart
    var end = this.attributes.instanceEnd

    if (start !== undefined && end !== undefined) {
      var center = this.boundingSphere.center

      this.boundingBox.getCenter(center)

      var maxRadiusSq = 0

      for (var i = 0, il = start.count; i < il; i++) {
        vector.fromBufferAttribute(start, i)
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector))

        vector.fromBufferAttribute(end, i)
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector))
      }

      this.boundingSphere.radius = Math.sqrt(maxRadiusSq)

      if (isNaN(this.boundingSphere.radius)) {
        console.error('LineGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this)
      }
    }
  }

  toJSON () {
    // todo
  }

  clone () {
    // todo
  }

  copy (source) {
    // todo
    return this
  }
}
