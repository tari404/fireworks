uniform vec3 diffuse;
// uniform float opacity;

uniform float uSqrtLifeTime;

varying float vLineDistance;

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vUv;

void main() {

  #include <clipping_planes_fragment>

  if (uSqrtLifeTime < vLineDistance + vUv.x * vUv.x / 100.0) {
    discard;
  }

  // if (vUv.y > 1.0) {
  //   float a = vUv.x;
  //   float b = vUv.y - 1.0;
  //   float len2 = a * a + b * b;

  //   if (len2 > 1.0) discard;
  // }

  float attenuation = uSqrtLifeTime - vLineDistance;
  float opacity = 2.5 * (1.0 - attenuation / uSqrtLifeTime) * (1.0 - uSqrtLifeTime);

  vec4 diffuseColor = vec4(diffuse, opacity);

  #include <logdepthbuf_fragment>
  #include <color_fragment>

  gl_FragColor = vec4(diffuseColor.rgb, diffuseColor.a);

  #include <premultiplied_alpha_fragment>
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>

}