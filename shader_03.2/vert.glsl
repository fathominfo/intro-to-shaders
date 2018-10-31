attribute vec2 a_position;

// New: the image coordinates
// the attribute gets it from the js program
attribute vec2 a_imagePosition;
// and stashes it in the varying version, which allows
// it to pass to the fragment shader
varying vec2 v_imagePosition;

void main() {
  v_imagePosition = a_imagePosition;
  gl_Position = vec4(a_position, 0, 1);
}