#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// New: the image
uniform sampler2D u_image;

// New: the image coordinate, passed from the vertex shader
varying vec2 v_imagePosition;

void main(){
  vec4 color = texture2D(u_image, v_imagePosition);

  // vec2 xy = fract(v_imagePosition.st * 10.0);
  // vec4 color = texture2D(u_image, xy);

  float grayscale = max(max(color.r, color.g), color.b);
  // float bw = step(0.5, grayscale);
  // or we can soften the edges a bit
  float bw = smoothstep(0.3, 0.5, grayscale);

  // we can use that B&W to mask the original color
  gl_FragColor = vec4(vec3(bw) * color.rgb, 1.0);

  // or we can use some other color based on pixel position
  vec2 st = gl_FragCoord.xy/u_resolution;
  float t = u_time / 1000.0;
  vec2 mouse = u_mouse/u_resolution;

  vec3 fillColor;
  if (st.x < mouse.x) {
    fillColor = vec3(abs(sin(t)), st.x, st.y);
  } else {
    fillColor = vec3(st.y, abs(sin(st.x)), abs(cos(t)));
  }

  gl_FragColor = vec4(bw * fillColor,  1.0);
}