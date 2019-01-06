/**
 * @author Felix Cai / http://github.com/tari404
 *
 */

import * as THREE from 'three'
import LineGeometry from './LineGeometry'
import LineMaterial from './LineMaterial'

export default class Line2 extends THREE.Mesh {
  constructor (geometry, material) {
    super()

    this.type = 'Line2'
    this.geometry = geometry !== undefined ? geometry : new LineGeometry()
    this.material = material !== undefined ? material : new LineMaterial({ color: Math.random() * 0xffffff })
  }

  static isLine2 = true

  computeLineDistances () {
    const start = new THREE.Vector3()
    const end = new THREE.Vector3()

    var geometry = this.geometry

    var instanceStart = geometry.attributes.instanceStart
    var instanceEnd = geometry.attributes.instanceEnd

    const l = instanceStart.data.count
    const lineDistances = new Float32Array(2 * l)

    for (let i = 0, j = 0; i < l; i++, j += 2) {
      start.fromBufferAttribute(instanceStart, i)
      end.fromBufferAttribute(instanceEnd, i)

      lineDistances[ j ] = (j === 0) ? 0 : lineDistances[ j - 1 ]
      lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo(end)
    }
    const totalDistance = lineDistances[2 * l - 1] || 1
    const relativeDistances = lineDistances.map(dis => dis / totalDistance)

    var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(relativeDistances, 2, 1) // d0, d1

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
