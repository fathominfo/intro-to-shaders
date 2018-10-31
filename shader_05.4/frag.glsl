#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_color;

uniform sampler2D u_dayImage;
uniform sampler2D u_nightImage;
uniform vec2 u_resolution;

varying vec2 v_imagePosition;


void main(){
  vec4 dayColor = texture2D(u_dayImage, v_imagePosition);
  vec4 nightColor = texture2D(u_nightImage, v_imagePosition);
  // copy the color from the image, and use it for the current pixel
  // gl_FragColor = dayColor;
  // gl_FragColor = dayColor;
  vec2 st = gl_FragCoord.xy / u_resolution;
  if (st.x >= 0.6) {
    gl_FragColor = dayColor;
  } else if (st.x < 0.5) {
    gl_FragColor = nightColor;
  } else {
    float f = smoothstep(0.5, 0.6, st.x);
    gl_FragColor = ((1.0 - f) * nightColor + f * dayColor);
  }
}