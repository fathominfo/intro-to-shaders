#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;

// this function gets called for each pixel within the shape we set up
// in the vertex shader
void main(){
  // instead of raw time, we will make a nice loop by taking the sine
  // of the elapsed time. Keep it above 0 with abs()
  float t = abs(sin(u_time / 1000.0));
  gl_FragColor = vec4(t, 0.0, 1.0,  1.0);
}