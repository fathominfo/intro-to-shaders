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
  if (color.a <= 0.5) {
    gl_FragColor = vec4(1.0);
  } else {
    /*
    what country is this on the map? 
    scale up the red channel to the 0-255 range
     */
    float countryColor = floor(color.r * 255.0);
    /* What are the x and y coordinates for this country on the data image? */
    float x = mod(countryColor,16.0)/16.0 + 0.5/16.0;
    float y = floor(countryColor/16.0)/16.0 + 0.5/16.0;
    /* grab the data for this country from the data image  */
    vec4 dataColor = texture2D(u_dataColors,vec2(x,y));
    // gl_FragColor = vec4(dataColor.rgb, 1.0);
    /* red encodes population as a % of the largest population */
    float popPct = dataColor.r;
    /* green encodes urban population as a % of the country's total */
    float urbanPct = dataColor.g;
    /* blue encodes rural population as a % of the country's total */
    float ruralPct = dataColor.b;
    // float c = popPct;
    float c = urbanPct;
    // float c = ruralPct;

    /* 0 indicates no data */
    if (c <  1.0/ 255.0) {
      /* if there's no data, color it dark gray */
      gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0);
    } else {
      /* color it according to the data */
      gl_FragColor = vec4(0.0, c, c, 1.0);
    }
  }
}