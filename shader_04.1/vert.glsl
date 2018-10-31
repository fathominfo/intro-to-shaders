#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform mat4 u_model;

uniform vec2 u_resolution;

void main() {
  float s = min(u_resolution.x, u_resolution.y);
  vec4 scale = vec4(vec2(s, s) / u_resolution, 1.0, 1.0);
  gl_Position = u_model * a_position * scale;
  v_color = a_color;
}