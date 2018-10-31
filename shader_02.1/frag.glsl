#ifdef GL_ES
precision mediump float;
#endif

// New: the screen resolution
uniform vec2 u_resolution;

// this function gets called for each pixel within the shape we set up
// in the vertex shader
void main(){
  // assigning to gl_FragColor sets the color for this pixel
  // New: the screen resolution
  // the shader space is in 0-1, but we want to color each pixel according to a gradient.
  // So we need to rescale the coordinate space by the screen resolution
  vec2 st = gl_FragCoord.xy/u_resolution;
  gl_FragColor = vec4(0.0, st.x, st.y,  1.0);
}