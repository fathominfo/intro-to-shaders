#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float circle(in vec2 st, in float radius ) {
  vec2 l = st - vec2(0.5);
  return 1.0 - smoothstep(
    radius - radius * 0.01,
    radius + radius * 0.01,
    dot(l,l) * 4.0
  );

}


void main() {
  vec2 st = gl_FragCoord.xy/min(u_resolution.x,u_resolution.y);
  vec3 rgb = vec3(0.0);
  // vec2 st2 = st * 10.0;
  vec2 st2 = st * 5.0;
  // float t = u_time / 1000.0;
  // st2 *= 0.1 + (sin(t) + 1.0) * 10.0 ;
  // st2 *= (1.1 + cos(t) ) * 10.0;
  // st2 *= (1.1 + cos(t) * sin(st2.y)*cos(st2.x)) * 10.0;
  st2 = fract(st2);
  // st2 *= st2;
  // rgb = vec3(st2,0.0);
  // float c = min(st2.x, st2.y);
  // rgb = vec3(c);

  float c = circle(st2,0.5);
  // // rgb = vec3(c, 0.5 + 0.5*c, 1.0);
  rgb = vec3(c);
  // rgb = vec3(c, 1.0-st.x, st.y);
  // float c2 = circle(st2,0.15);
  // if (c2 > 0.5) {
  //   rgb = vec3(0.0, 0.0, 0.0);
  //   // rgb = vec3(c2, 1.0-st.x, st.y);
  // }
  // rgb = vec3(c, 1.0-st.x, st.y);
  gl_FragColor = vec4(rgb,1.0);
}