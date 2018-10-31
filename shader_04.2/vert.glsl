#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform mat4 u_model;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * u_model * a_position;
  v_color = a_color;
}