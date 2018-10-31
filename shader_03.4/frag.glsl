#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_matrix[9];


// New: the image
uniform sampler2D u_image;

// New: the image coordinate, passed from the vertex shader
varying vec2 v_imagePosition;

void main(){
  vec4 color = vec4(vec3(0.0), 1.0);
  for ( float i=0.0;i < 9.0;i++) {
    float xoff = mod(i, 3.0) - 1.0;
    float yoff = floor(i / 3.0) - 1.0;
    vec2 coord = vec2(xoff, yoff) / u_resolution;
    vec4 c = texture2D(u_image, v_imagePosition.st + coord);
    float matVal = u_matrix[int(i)];
    color += matVal * c;
  }
  float gray = max(max(color.r, color.g), color.b);
  // gray = pow(gray, .25);
  color = texture2D(u_image, v_imagePosition);
  color.rgb = vec3(gray);
  // color.rgb = vec3(pow(color.r, .5), pow(color.g, .5), pow(color.b, .5));
  gl_FragColor = color;
}