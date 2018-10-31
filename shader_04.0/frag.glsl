#ifdef GL_ES
precision mediump float;
#endif

// New: a place where we can get a color passed from the wertex shader
varying vec4 v_color;

void main(){
  gl_FragColor = v_color;
}