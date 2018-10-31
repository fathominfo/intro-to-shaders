(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,

    positionLocation,
    colorLocation,
    positionBuffer,
    colorBuffer,

    // New: track how many frames have gone on
    frameCount,
    frameCountUniformLocation


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

    // We will be positioning things in 3d space, so tell the program
    // how we want it to handle things behind or in front of each other
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // New: we need to pass the number of frames to the shader,
    // so that it can calculate the updated position of each particle
    frameCountUniformLocation = gl.getUniformLocation(program, "u_frameCount");
    frameCount = 0;

    positionLocation = gl.getAttribLocation(program, "a_position");
    positionBuffer = gl.createBuffer();

    // New: we don't need to save the points so that they can
    // be adjusted in the draw loop. And the variables that
    // track their current position aren't needed either.
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

    // New: Before, we declared activePositions globally so we could
    // update it every time we called draw. Now we can declare it locally,
    // and just pass it once to the shader.
    // Instead of tracking actual positions, it now tracks the parameters
    // required to calculate each point's position.
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

    colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    colorBuffer = gl.createBuffer();
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
    // New: update the frame count and pass it to the shader
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

