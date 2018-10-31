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
  // or use the red channel to drive how dark a pixel is
  // and use the position in the screen to drive the rbg value
  // float bw = color.r;
  // vec2 st = gl_FragCoord.xy/1024.0;
  // gl_FragColor = vec4(0.0, st.x * bw, st.y * bw, 1.0);
  // Or use the position on the face of the cube to drive the rbg value
  // vec2 st2 = v_imagePosition.xy;
  // gl_FragColor = vec4(0.0, st2.x * bw, st2.y * bw, 1.0);
  // or combine them
  // gl_FragColor = vec4(st2.x * bw, st.x * st2.y * bw, st.y * bw, 1.0);
}