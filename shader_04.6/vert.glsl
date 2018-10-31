#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;
attribute vec4 a_color;

varying vec4 v_color;

// New: how many frames have been drawn
uniform float u_frameCount;

void main() {
  // New: in this version, a_position tracks the parameters
  // used to calculate the point's position"
  //    how much to rotate around the x axis every frame
  //    how much to rotate around the y axis every frame
  //    the distance from the center.
  //    where this point lies in the list of vertices
  // GLSL lets you access these paramters under different names,
  // but they all reference the same data points. The different
  // names can be intuitive for whatever you are working with.
  // You can use rgba when working with color, xyzw when working
  // with locations, and stpq when working with othter stuff.
  // Why not stuv instead of stpq? It's not entirely clear.
  // Here, we use s, t, and p (and maybe q), since the stufff
  // in a_position is not the actual x, y, and z coordinates
  // of the point.
  float x_rotation = a_position.s * u_frameCount;
  float y_rotation = a_position.t * u_frameCount;
  float radius = a_position.p;
  float x = cos(x_rotation) * cos(y_rotation) * radius;
  float y = sin(y_rotation) * radius;
  float z = sin(x_rotation) * cos(y_rotation) * radius;

  gl_Position = vec4(x, y, z, 1.0);
  gl_PointSize = 10.0;
  // gl_PointSize = a_position.q * 2.0;
  v_color = a_color;
}