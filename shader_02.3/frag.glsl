#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;
  // instead of raw time, we will make a nice loop by taking the sine
  // of the elapsed time. Keep it above 0 with abs()
  float t = u_time / 1000.0;
  vec2 mouse = u_mouse/u_resolution;
  // draw something different on the left and right sides of the mouse
  if (st.x < mouse.x) {
    gl_FragColor = vec4(abs(sin(t)), st.x, st.y,  1.0);
  } else {
    gl_FragColor = vec4(st.y, abs(sin(st.x)), abs(cos(t)), 1.0);
  }
}