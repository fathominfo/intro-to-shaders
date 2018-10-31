(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,
    // New: our shader will change over time, so we need to know when it starts
    startTime,

    // New: we will pass the elapsed time to the shader
    // so we need to know where the shader wants us to put it.
    timeUniformLocation,
    positionLocation;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;

  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);
    // New: so this is where we will put the elpased time in our draw function
    timeUniformLocation = gl.getUniformLocation(program, "u_time");

    // Even though we aren't drawing anything really fancy,
    // we have to tell the GL Context how much of the screen we are drawing
    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      /**
      note that unlike processing or canvas.getContext('2d'),
      the screen coordinates are
        -1, 1 left to right
        1, -1 top to bottom
        and 0, 0 is the center
      and because GL is finicky, you have to specify them as floats,
      not ints, so add that '.0' to the end
      */
      new Float32Array([
        -1.0, 1.0,
         1.0, 1.0,
        -1.0, -1.0,
         1.0, -1.0]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }


  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
    // New: calculate how much time has passed, and pass it to the shader
    var elapsed = Date.now() - startTime;
    gl.uniform1f(timeUniformLocation, elapsed);
    // console.log(elapsed / 100.0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
          // New: instead of just drawing once,
          // we track the start time and call the draw loop every 30 milliseconds
          // roughly 30 times a second
          startTime = Date.now();
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

