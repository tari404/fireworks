/**
 * @author Felix Cai / http://github.com/tari404
 *
 */

import * as THREE from 'three'

THREE.LineGeometry = function () {
  THREE.InstancedBufferGeometry.call(this)

  const positions = [ -1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0 ]
  const uvs = [ -1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2 ]
  const index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5 ]

  this.setIndex(index)
  this.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  this.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

  this.type = 'LineGeometry'
}

THREE.LineGeometry.prototype = Object.assign(Object.create(THREE.InstancedBufferGeometry.prototype), {
  constructor: THREE.LineGeometry,
  isLineGeometry: true,
  setPositions: function (array) {
    // converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format
    var length = array.length - 3
    var points = new Float32Array(2 * length)
    for (var i = 0; i < length; i += 3) {
      points[ 2 * i ] = array[ i ]
      points[ 2 * i + 1 ] = array[ i + 1 ]
      points[ 2 * i + 2 ] = array[ i + 2 ]

      points[ 2 * i + 3 ] = array[ i + 3 ]
      points[ 2 * i + 4 ] = array[ i + 4 ]
      points[ 2 * i + 5 ] = array[ i + 5 ]
    }

    var instanceBuffer = new THREE.InstancedInterleavedBuffer(points, 6, 1) // xyz, xyz

    this.addAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0)) // xyz
    this.addAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3)) // xyz

    this.computeBoundingBox()
    this.computeBoundingSphere()

    return this
  },

  setColors: function (array) {
    // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format
    var length = array.length - 3
    var colors = new Float32Array(2 * length)
    for (var i = 0; i < length; i += 3) {
      colors[ 2 * i ] = array[ i ]
      colors[ 2 * i + 1 ] = array[ i + 1 ]
      colors[ 2 * i + 2 ] = array[ i + 2 ]

      colors[ 2 * i + 3 ] = array[ i + 3 ]
      colors[ 2 * i + 4 ] = array[ i + 4 ]
      colors[ 2 * i + 5 ] = array[ i + 5 ]
    }

    var instanceColorBuffer = new THREE.InstancedInterleavedBuffer(colors, 6, 1) // rgb, rgb

    this.addAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 0)) // rgb
    this.addAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 3)) // rgb

    return this
  },

  fromLine: function (line) {
    var geometry = line.geometry

    if (geometry.isGeometry) {
      this.setPositions(geometry.vertices)
    } else if (geometry.isBufferGeometry) {
      this.setPositions(geometry.position.array) // assumes non-indexed
    }
    // set colors, maybe
    return this
  },
  applyMatrix: function (matrix) {
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
  },

  fromWireframeGeometry: function (geometry) {
    this.setPositions(geometry.attributes.position.array)
    return this
  },

  fromEdgesGeometry: function (geometry) {
    this.setPositions(geometry.attributes.position.array)
    return this
  },

  fromMesh: function (mesh) {
    this.fromWireframeGeometry(new THREE.WireframeGeometry(mesh.geometry))
    // set colors, maybe
    return this
  },

  fromLineSegements: function (lineSegments) {
    var geometry = lineSegments.geometry

    if (geometry.isGeometry) {
      this.setPositions(geometry.vertices)
    } else if (geometry.isBufferGeometry) {
      this.setPositions(geometry.position.array) // assumes non-indexed
    }
    // set colors, maybe
    return this
  },

  computeBoundingBox: function () {
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
  },
  computeBoundingSphere: function () {
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
        console.error('THREE.LineGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this)
      }
    }
  },

  toJSON: function () {
    // todo
  },

  clone: function () {
    return new this.constructor()
  },

  copy: function (source) {
    // todo
    return this
  }
})
