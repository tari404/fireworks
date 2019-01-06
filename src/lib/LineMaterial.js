/**
 * @author Felix Cai / http://github.com/tari404
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  sqrtLifeTime: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

import * as THREE from 'three'

import lineVS from './line.glsl.vs'
import lineFS from './line.glsl.fs'

const lineUniforms = THREE.UniformsUtils.merge([
  THREE.UniformsLib.common,
  THREE.UniformsLib.fog,
  {
    width: { value: 1 },
    resolution: { value: new THREE.Vector2(1, 1) },
    uSqrtLifeTime: { value: 0 }
  }
])

export default class LineMaterial extends THREE.ShaderMaterial {
  constructor (parameters) {
    super({
      type: 'LineMaterial',
      uniforms: THREE.UniformsUtils.clone(lineUniforms),
      vertexShader: lineVS,
      fragmentShader: lineFS
    })

    this.dashed = false
    this.setValues(parameters)
  }

  get color () {
    return this.uniforms.diffuse.value
  }
  set color (value) {
    this.uniforms.diffuse.value = value
  }

  get width () {
    return this.uniforms.width.value
  }
  set width (value) {
    this.uniforms.width.value = value
  }

  get resolution () {
    return this.uniforms.resolution.value
  }
  set resolution (value) {
    this.uniforms.resolution.value.copy(value)
  }

  get sqrtLifeTime () {
    return this.uniforms.uSqrtLifeTime.value
  }
  set sqrtLifeTime (value) {
    this.uniforms.uSqrtLifeTime.value = value
  }

  static isLineMaterial = true

  copy (source) {
    THREE.ShaderMaterial.prototype.copy.call(this, source)
    this.color.copy(source.color)
    this.linewidth = source.linewidth
    this.resolution = source.resolution
    // todo
    return this
  }
}
