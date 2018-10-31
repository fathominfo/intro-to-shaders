attribute vec2 a_position;
// New: a place to get the color passed from js
attribute vec4 a_color;

// New: a place where we can tell the fragment shader what the color is
varying vec4 v_color;

void main() {
  gl_Position = vec4(a_position, 0, 1);
  v_color = a_color;
}