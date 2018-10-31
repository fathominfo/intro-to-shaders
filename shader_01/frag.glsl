#ifdef GL_ES
precision mediump float;
#endif

// this function gets called for each pixel within the shape we set up
// in the vertex shader
void main(){
  // assigning to gl_FragColor sets the color for this pixel
  gl_FragColor = vec4(1.0, 0.0, 1.0,  1.0);
}