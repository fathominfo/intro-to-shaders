#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform float u_frameCount;

void main() {
  float x_rotation = a_position.x * u_frameCount;
  float y_rotation = a_position.y * u_frameCount;
  float radius = a_position.z;
  float x = cos(x_rotation) * cos(y_rotation) * radius;
  float y = sin(y_rotation) * radius;
  float z = sin(x_rotation) * cos(y_rotation) * radius;

  gl_Position = vec4(x, y, z, 1.0);
  gl_PointSize = 32.0;
  // gl_PointSize = a_position.w * 10.0;
  v_color = a_color;
}