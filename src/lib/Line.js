/**
 * @author Felix Cai / http://github.com/tari404
 *
 */

import * as THREE from 'three'

THREE.Line2 = function (geometry, material) {
  THREE.Mesh.call(this)
  this.type = 'Line2'
  this.geometry = geometry !== undefined ? geometry : new THREE.LineGeometry()
  this.material = material !== undefined ? material : new THREE.LineMaterial({ color: Math.random() * 0xffffff })
}

THREE.Line2.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
  constructor: THREE.Line2,
  isLine2: true,
  computeLineDistances: function () {
    const start = new THREE.Vector3()
    const end = new THREE.Vector3()

    var geometry = this.geometry

    var instanceStart = geometry.attributes.instanceStart
    var instanceEnd = geometry.attributes.instanceEnd
    var lineDistances = new Float32Array(2 * instanceStart.data.count)

    for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {
      start.fromBufferAttribute(instanceStart, i)
      end.fromBufferAttribute(instanceEnd, i)

      lineDistances[ j ] = (j === 0) ? 0 : lineDistances[ j - 1 ]
      lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo(end)
    }

    var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1) // d0, d1

    geometry.addAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)) // d0
    geometry.addAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)) // d1

    return this
  },
  clone: function () {
    return new this.constructor(this.geometry.clone(), this.material).copy(this)
  },
  copy: function (source) {
    THREE.Mesh.prototype.copy.call(this, source)
    return this
  }
})
