#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_color;
varying vec2 v_imagePosition;

uniform sampler2D u_image;
uniform sampler2D u_dataColors;


void main(){
  vec4 color = texture2D(u_image, v_imagePosition);
  gl_FragColor = color;


  /*
  To see the country lookup values, we can isolate the red channel.
  Oceans and things that are not countries are transparent.
  */
  // if (color.a <= 0.5) {
  //   gl_FragColor = vec4(1.0);
  // } else {
  //   gl_FragColor = vec4(color.r, 0.0, 0.0, 1.0);
  // }


  /*
  We can also test whether the country lookup is working
  */
  // if (color.a <= 0.5) {
  //   gl_FragColor = vec4(1.0);
  // } else {
  //   // get the color, and scale up from the shader range of 0-1 to
  //   // integers in the 0-255 range
  //   float countryColor = floor(color.r * 255.0);
  //   // Looking at the data file population_2018.json, the country at
  //   // index position 3.0 is China,
  //   // 1.0 is the USA
  //   // 24.0 is Chile
  //   // 33.0 is Ireland
  //   // 53.0 is Egypt
  //   // 212 is New Guinea
  //   if (countryColor == 212.0) {
  //     gl_FragColor = vec4(0.0, 0.5, 1.0, 1.0);
  //   } else {
  //     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  //   }
  // }
}