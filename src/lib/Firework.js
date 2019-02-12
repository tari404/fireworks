/**
 * @author Felix Cai / http://github.com/tari404
 *
 */

import * as THREE from 'three'
import FireworkGeometry from './FireworkGeometry'
import LineMaterial from './LineMaterial'

export default class FireWork extends THREE.Mesh {
  constructor (geometry, material) {
    super()

    this.type = 'FireWork'
    this.geometry = geometry !== undefined ? geometry : new FireworkGeometry()
    this.material = material !== undefined ? material : new LineMaterial()
  }

  static isFireWork = true

  computeLineDistances () {
    const start = new THREE.Vector3()
    const end = new THREE.Vector3()

    var geometry = this.geometry

    var instanceStart = geometry.attributes.instanceStart
    var instanceEnd = geometry.attributes.instanceEnd

    const length = geometry.segments * geometry.amount
    const lineDistances = new Float32Array(2 * length)

    for (let i = 0, j = 0; i < length; i++, j++) {
      start.fromBufferAttribute(instanceStart, i)
      end.fromBufferAttribute(instanceEnd, i)
      if (j >= geometry.segments) {
        j -= geometry.segments
      }
      lineDistances[2 * i] = (j === 0) ? 0 : lineDistances[2 * i - 1]
      lineDistances[2 * i + 1] = lineDistances[2 * i] + start.distanceTo(end)
    }

    const segments = 2 * geometry.segments
    const relativeDistances = lineDistances.map((dis, index, array) => {
      const nextEndIndex = (Math.floor(index / segments) + 1) * segments - 1
      const totalDistance = array[nextEndIndex]
      return dis / totalDistance
    })

    const instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(relativeDistances, 2, 1) // d0, d1

    geometry.addAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)) // d0
    geometry.addAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)) // d1

    return this
  }

  clone () {
    return new this.constructor(this.geometry.clone(), this.material).copy(this)
  }

  copy (source) {
    THREE.Mesh.prototype.copy.call(this, source)
    return this
  }
}
