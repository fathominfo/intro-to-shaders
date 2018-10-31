(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,
    startTime,

    positionLocation,
    colorLocation,
    positionBuffer,
    colorBUffer,

    // New: we are going to start positioning vertices in space!
    modelUniform,
    projectionUniform,

    translationMatrix,
    rotationMatrix,
    scaleMatrix,

    modelMatrix,
    projectionMatrix

    ;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;



  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);

    // New: get the locations where the shader wants the model and projection
    modelUniform = gl.getUniformLocation(program, "u_model");
    projectionUniform = gl.getUniformLocation(program, "u_projection");
    // We will be positioning things in 3d space, so tell the program
    // how we want it to handle things behind or in front of each other
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // straight from mozilla!
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = W / H;
    const zNear = 0.1;
    const zFar = 100.0;
    projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);


    translationMatrix = mat4.create();
    rotationMatrix = mat4.create();
    scaleMatrix = mat4.create();
    modelMatrix = mat4.create();
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      translationMatrix,     // destination matrix
      translationMatrix,     // matrix to translate
      [-0.0, 0.0, -6.0]); // amount to translate


    mat4.rotate(
      rotationMatrix,  // destination matrix
      rotationMatrix,  // matrix to rotate
      Math.PI * .2 ,  // amount it rotates each frame
      [0, 0, 1] // the axis it rotates around: the center of the square
    );

    mat4.scale(
      scaleMatrix,  // destination matrix
      scaleMatrix,  // matrix to rotate
      [2, .5, 1.5]);       // axis to rotate around


    // Even though we aren't drawing anything really fancy,
    // we have to tell the GL Context how much of the screen we are drawing
    positionLocation = gl.getAttribLocation(program, "a_position");
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    /*
      New: we aren;'t building a cube this time,
      but a more abstract shape. The coordinates are tweaked so that
      they work with TRIANGLES, TRIANGLE_STRIP, or TRIANGLE_FAN.
    */

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, -1.0, 0.0,
        0.5, 0.0, 0.5,
        -0.5, 0.0, 0.5,

        0.0, 0.0, 0.25,
        -1.0, 0.0, -0.5,
        0.0, 1.0, -0.5,

        0.0, 0.0, -1.0,
        0.25, 1.0, -1.5,
        1.0, 0.0, -1.5

      ]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
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


    gl.uniformMatrix4fv(projectionUniform, false, projectionMatrix);


  }




  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var elapsed = Date.now() - startTime;

    // // rotate the square a little each time
    mat4.rotate(
      rotationMatrix,  // destination matrix
      rotationMatrix,  // matrix to rotate
      Math.PI * .01 ,  // amount it rotates each frame
      // [0, 0, 1] // the axis it rotates around: the center of the square
      // [0, 1, 0] // rotate around a vertical axis
      // [0, 1, 1] // rotate around a tilting axis
      [(Math.cos(elapsed * .001)+1)*.5, .5, 1] // rotate around a moving axis
    );



    mat4.multiply(
      modelMatrix, // the results go here
      translationMatrix, // when you multiply this matrix
      rotationMatrix // by this matrix
      );

    // mat4.multiply(
    //   modelMatrix, // the results go here
    //   modelMatrix, // even when we are multiplying the same matrix
    //   scaleMatrix // by a different matrix
    // );


    gl.uniformMatrix4fv(modelUniform, false, modelMatrix);

    // New: try different ways of grouping the vertices we pass to the shader
    gl.drawArrays(gl.TRIANGLES, 0, 9);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 9);
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 9);
    // gl.drawArrays(gl.LINES, 0, 9);
    // gl.drawArrays(gl.LINE_STRIP, 0, 9);
    // gl.drawArrays(gl.LINE_LOOP, 0, 9);
    // gl.drawArrays(gl.POINTS, 0, 9);
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

