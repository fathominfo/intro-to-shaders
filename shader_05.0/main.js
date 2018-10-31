(()=>{
  var canvas = document.getElementById('shade'),
    // New: when we create the WebGL context, we can pass it some options.
    // What we will be doing later is using an image to draw each point.
    // The images have a transparent background, so we want the shader to
    // mix colors when those images overlap. We tell the shader to do that
    // by passing in the "premultipliedAlpha : false" option
    gl = canvas.getContext('webgl', {premultipliedAlpha: false}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,

    
    frameCount,
    frameCountUniformLocation,

    // New: the image we will use to draw each point / particle.
    dotTexture
    ;

  const cos = Math.cos,
    sin = Math.sin,
    POINT_COUNT = 9;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;



  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);

    // New: the images we use to blend particles have transparent
    // backgrounds. FOr this to work as expected, we need to turn off
    // depth testing. If we don't the backgrounds don't show up as
    // transparent: they show up as black and block other particles.
    gl.disable(gl.DEPTH_TEST);
    // tell the shader that we want blending
    gl.enable(gl.BLEND);
    // and specify just how we want the blending to work
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);
    // there are many options for how you want blending to work
    // gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE)


    // New: pass an image to the shader so it can be used to draw the points.
    // where is it gonna go?
    var imageUniform = gl.getUniformLocation(program, "u_image");
    // Images are referred to as textures, and setting one up
    // is a bureaucratic operation.
    // Create a texture, and tell the shader that it is the one you want
    // to work with. Note that it is not yet attached to our image.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // now tell the texture to use our image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dotTexture);
    // and tell the shader that we want to use this image for the uniform
    gl.uniform1i(imageUniform, 1);
    // and that this is the image to use for now
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);



    frameCountUniformLocation = gl.getUniformLocation(program, "u_frameCount");
    frameCount = 0;

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();

    var points = [];
    for (var i=0; i < POINT_COUNT; i++) {
      let xrot = .1 * (1 - Math.random()),
        yrot = .1 * (1 - Math.random()),
        radius = 1 - Math.random();
      radius += radius < 0 ? -.25 : .25;
      radius *= .5;
      var point = {
        "x_rotation_amount" : xrot,
        "y_rotation_amount" : yrot,
        "radius" : radius
      }
      points.push(point);
    }

    var activePositions = [];
    for (var i=0; i<points.length; i++) {
      var point = points[i];
      activePositions.push(point.x_rotation_amount);
      activePositions.push(point.y_rotation_amount);
      activePositions.push(point.radius);
      activePositions.push(i+1);
    }
    activePositions = new Float32Array(activePositions);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, activePositions, gl.STATIC_DRAW );
    gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      // we send over a color for each vertex
      new Float32Array([
        1.0,  1.0,  1.0,  1.0,    // white
        1.0,  0.0,  0.0,  1.0,    // red
        0.0,  1.0,  0.0,  1.0,    // green

        0.0,  0.0,  1.0,  1.0,    // blue,
        1.0,  0.5,  0.0,  1.0,    // orange
        0.5,  0.0,  1.0,  1.0,    // violet

        1.0,  1.0,  0.0,  1.0,    // yellow
        0.0,  1.0,  1.0,  1.0,    // cyan
        1.0,  0.0,  1.0,  1.0,    // magenta
      ]),
      gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);


  }




  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    frameCount++;
    gl.uniform1f(frameCountUniformLocation, frameCount);
    gl.drawArrays(gl.POINTS, 0, POINT_COUNT);
  }






  // ██████╗  ██████╗ ██████╗ ██╗███╗   ██╗ ██████╗     ███████╗████████╗██╗   ██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██╔══██╗██║████╗  ██║██╔════╝     ██╔════╝╚══██╔══╝██║   ██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██████╔╝██║██╔██╗ ██║██║  ███╗    ███████╗   ██║   ██║   ██║█████╗  █████╗
  // ██╔══██╗██║   ██║██╔══██╗██║██║╚██╗██║██║   ██║    ╚════██║   ██║   ██║   ██║██╔══╝  ██╔══╝
  // ██████╔╝╚██████╔╝██║  ██║██║██║ ╚████║╚██████╔╝    ███████║   ██║   ╚██████╔╝██║     ██║
  // ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝


  dotTexture = new Image();
  dotTexture.addEventListener('load', ()=> {
    // new: fetch the shaders after the image is loaded
    // load files
    fetch('frag.glsl')
      .then(function(response) {
        return response.text();
      }).then(fragShaderText=>{
        // console.log(fragShaderText)
        fetch('vert.glsl')
          .then(function(response) {
            return response.text();
          }).then(vertShaderText=>{
            // console.log(vertShaderText);
            compileGL(fragShaderText, vertShaderText);
            initGLData();
            setInterval(requestDraw, 33);
          });
      });
  });
  dotTexture.src = "../images/dot.png";



  // build our program
  function compileGL(fragShaderText, vertShaderText) {
    var frag = loadShader(gl, gl.FRAGMENT_SHADER, fragShaderText);
    var vert = loadShader(gl, gl.VERTEX_SHADER, vertShaderText);
    program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
  }

  function requestDraw() {
    requestAnimationFrame(draw);
  }

  // straight outta mozilla
  //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    // Send the source to the shader object
    gl.shaderSource(shader, source);
    // Compile the shader program
    gl.compileShader(shader);
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }


})();

