/**
 * @author Felix Cai / http://github.com/tari404
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

import * as THREE from 'three'

import lineVS from './line.glsl.vs'
import lineFS from './line.glsl.fs'

THREE.UniformsLib.line = {
  linewidth: { value: 1 },
  resolution: { value: new THREE.Vector2(1, 1) },
  uSqrtLifeTime: { value: 0 }
}

THREE.ShaderLib['line'] = {
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    THREE.UniformsLib.fog,
    THREE.UniformsLib.line
  ]),
  vertexShader: lineVS,
  fragmentShader: lineFS
}

THREE.LineMaterial = function (parameters) {
  THREE.ShaderMaterial.call(this, {
    type: 'LineMaterial',
    uniforms: THREE.UniformsUtils.clone(THREE.ShaderLib['line'].uniforms),
    vertexShader: THREE.ShaderLib['line'].vertexShader,
    fragmentShader: THREE.ShaderLib['line'].fragmentShader
  })
  this.dashed = false
  Object.defineProperties(this, {
    color: {
      enumerable: true,
      get: function () {
        return this.uniforms.diffuse.value
      },
      set: function (value) {
        this.uniforms.diffuse.value = value
      }
    },
    linewidth: {
      enumerable: true,
      get: function () {
        return this.uniforms.linewidth.value
      },
      set: function (value) {
        this.uniforms.linewidth.value = value
      }
    },
    resolution: {
      enumerable: true,
      get: function () {
        return this.uniforms.resolution.value
      },
      set: function (value) {
        this.uniforms.resolution.value.copy(value)
      }
    },
    sqrtLifeTime: {
      enumerable: true,
      get: function () {
        return this.uniforms.uSqrtLifeTime.value
      },
      set: function (value) {
        this.uniforms.uSqrtLifeTime.value = value
      }
    }
  })
  this.setValues(parameters)
}

THREE.LineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype)
THREE.LineMaterial.prototype.constructor = THREE.LineMaterial

THREE.LineMaterial.prototype.isLineMaterial = true

THREE.LineMaterial.prototype.copy = function (source) {
  THREE.ShaderMaterial.prototype.copy.call(this, source)
  this.color.copy(source.color)
  this.linewidth = source.linewidth
  this.resolution = source.resolution
  // todo
  return this
}
