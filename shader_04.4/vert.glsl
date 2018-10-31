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
  // New: should we decide to render points, how big should they be?
  gl_PointSize = 10.0;
  v_color = a_color;
}