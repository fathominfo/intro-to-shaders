#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
// New: the mouse position
uniform vec2 u_mouse;

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;
  // New: the mouse position
  vec2 mouse = u_mouse/u_resolution;
  // draw something differnt on the left and right sides of the mouse
  if (st.x < mouse.x) {
    gl_FragColor = vec4(1.0, 0.0, 1.0,  1.0);
  } else {
    gl_FragColor = vec4(0.0, 1.0, 1.0,  1.0);
  }

}