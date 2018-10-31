#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

// New: the image
uniform sampler2D u_image;

// New: the image coordinate, passed from the vertex shader
varying vec2 v_imagePosition;

void main(){
  vec4 color = texture2D(u_image, v_imagePosition);
  // copy the color from the image, and use it for the current pixel
  gl_FragColor = color;
  // You could also write that as:
  // gl_FragColor = color.rgba;

  // And here's where it gets fun. GLSL makes it really easy to switch up the colors
  // instead of Roy G Biv, let's Ruth Bader Ginsburg!
  // that is swap the blue and green values
  // gl_FragColor = color.rbga;
  // or we can swap to blue, red, and green
  // gl_FragColor = color.brga;

  // it's also trivial to make it negative
  // gl_FragColor = vec4(1.0 - color.rgb, 1.0);

  // or grayscale
  // float grayscale = max(max(color.r, color.g), color.b);
  // gl_FragColor = vec4(vec3(grayscale), 1.0);

  // and we can add a threshold to that to make it black and white
  // float bw = step(0.5, grayscale);

  // or instead we can add contrast but not a harsh black and white
  // float bw = smoothstep(0.1, 0.8, grayscale);
  // gl_FragColor = vec4(vec3(bw), 1.0);

  // or replace white with red
  // gl_FragColor = vec4(bw, 0.0, 0.0, 1.0);

  // or replace black with red
  // gl_FragColor = vec4(1.0, bw, bw, 1.0);



}