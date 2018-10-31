#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_color;

uniform sampler2D u_image;

varying vec2 v_imagePosition;


void main(){
  vec4 color = texture2D(u_image, v_imagePosition);
  // copy the color from the image, and use it for the current pixel
  gl_FragColor = color;
  // or replace it with nicer colors
  // if (color.a >= .5) {
  //   gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0);
  // } else {
  //   gl_FragColor = vec4(1.0);
  // }
}