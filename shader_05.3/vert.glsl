#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;

// New: the image coordinates
// the attribute gets it from the js program
attribute vec2 a_imagePosition;
// and stashes it in the varying version, which allows
// it to pass to the fragment shader
varying vec2 v_imagePosition;

uniform mat4 u_model;
uniform mat4 u_projection;


void main() {
  gl_Position = u_projection * u_model * a_position;
  v_imagePosition = a_imagePosition;
}