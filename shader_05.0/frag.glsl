#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_color;

// New: the image
uniform sampler2D u_image;

void main(){
  vec4 imageColor = texture2D(u_image, gl_PointCoord.st);
  gl_FragColor = imageColor;
}