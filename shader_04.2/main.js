(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,
    startTime,

    positionLocation,
    colorLocation,

    modelUniform,


    // New: we are going to define where we are watching from,
    // which will enable a sense of foreshortening
    projectionUniform,
    // the matrix for the projection that will be passed to the shader
    projectionMatrix,

    translationMatrix,
    rotationMatrix,
    scaleMatrix,

    modelMatrix

    ;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;



  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);

    // New: get the locations where the shader wants the model and projection
    modelUniform = gl.getUniformLocation(program, "u_model");
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
    projectionUniform = gl.getUniformLocation(program, "u_projection");

    // note: with glmatrix.js, the first parameter
    // is always the matrix that you are writing to. Any values
    // in that matrix will be overwritten.
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
      translationMatrix,   // the matrix that tracks the translated location
      translationMatrix,   // matrix to start from (which is not moved at this point)
      [-0.0, 0.0, -6.0]); // amount to translate

    mat4.rotate(
      rotationMatrix,  // the matrix that tracks the rotation
      rotationMatrix,  // matrix to to start from (unrotated here)
      Math.PI * .25,  // amount to rotate it
      [0, 0, 1] // the axis it rotates around: the center of the square
    );

    positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    /*
      New: the cube we are building out has corners like
      D --- E
      |  C -+- F
      |  |  |  |
      A -+- H  |
         B --- G
      So square ABCD is on the left, EFGH is on the right,
      ADEH is in back, BCFG is in front, etc.

      Each face of the cube is a square, and we nuild each square
      with two triangles.
    */

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
         // Front face
        -1.0, -1.0,  1.0, // a
         1.0, -1.0,  1.0, // b
         1.0,  1.0,  1.0, // c
        -1.0, -1.0,  1.0, // a
         1.0,  1.0,  1.0, // c
        -1.0,  1.0,  1.0, // d

        // Back face
        -1.0, -1.0, -1.0, // h
        -1.0,  1.0, -1.0, // e
         1.0,  1.0, -1.0, // f
        -1.0, -1.0, -1.0, // h
         1.0,  1.0, -1.0, // f
         1.0, -1.0, -1.0, // g

        // Top face
        -1.0,  1.0, -1.0, // e
        -1.0,  1.0,  1.0, // d
         1.0,  1.0,  1.0, // c
        -1.0,  1.0, -1.0, // e
         1.0,  1.0,  1.0, // c
         1.0,  1.0, -1.0, // f

        // Bottom face
        -1.0, -1.0, -1.0, // h
         1.0, -1.0, -1.0, // g
         1.0, -1.0,  1.0, // b
        -1.0, -1.0, -1.0, // h
         1.0, -1.0,  1.0, // b
        -1.0, -1.0,  1.0, // a

        // Right face
         1.0, -1.0, -1.0, // g
         1.0,  1.0, -1.0, // f
         1.0,  1.0,  1.0, // c
         1.0, -1.0, -1.0, // g
         1.0,  1.0,  1.0, // c
         1.0, -1.0,  1.0, // b

        // Left face
        -1.0, -1.0, -1.0, // h
        -1.0, -1.0,  1.0, // a
        -1.0,  1.0,  1.0, // d
        -1.0, -1.0, -1.0, // h
        -1.0,  1.0,  1.0, // d
        -1.0,  1.0, -1.0, // e


      ]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      // New: we send over a color for each vertex,
      // in the same order as the vertices
      new Float32Array([
         // Front face
        1.0,  1.0,  1.0,  1.0,    // a: white
        1.0,  0.0,  0.0,  1.0,    // b: red
        0.0,  1.0,  0.0,  1.0,    // c: green
        1.0,  1.0,  1.0,  1.0,    // a: white
        0.0,  1.0,  0.0,  1.0,    // c: green
        0.0,  0.0,  1.0,  1.0,    // d: blue,

        // Back face
        1.0,  0.0,  1.0,  1.0,    // h: magenta,
        1.0,  1.0,  0.0,  1.0,    // e: yellow
        1.0,  0.5,  1.0,  1.0,    // f: orange
        1.0,  0.0,  1.0,  1.0,    // h: magenta,
        1.0,  0.5,  1.0,  1.0,    // f: orange
        0.0,  1.0,  1.0,  1.0,    // g: cyan

        // Top face
        1.0,  1.0,  0.0,  1.0,    // e: yellow
        0.0,  0.0,  1.0,  1.0,    // d: blue,
        0.0,  1.0,  0.0,  1.0,    // c: green
        1.0,  1.0,  0.0,  1.0,    // e: yellow
        0.0,  1.0,  0.0,  1.0,    // c: green
        1.0,  0.5,  1.0,  1.0,    // f: orange

        // Bottom face
        1.0,  0.0,  1.0,  1.0,    // h: magenta,
        0.0,  1.0,  1.0,  1.0,    // g: cyan
        1.0,  0.0,  0.0,  1.0,    // b: red
        1.0,  0.0,  1.0,  1.0,    // h: magenta,
        1.0,  0.0,  0.0,  1.0,    // b: red
        1.0,  1.0,  1.0,  1.0,    // a: white

        // Right face
        0.0,  1.0,  1.0,  1.0,    // g: cyan
        1.0,  0.5,  1.0,  1.0,    // f: orange
        0.0,  1.0,  0.0,  1.0,    // c: green
        0.0,  1.0,  1.0,  1.0,    // g: cyan
        0.0,  1.0,  0.0,  1.0,    // c: green
        1.0,  0.0,  0.0,  1.0,    // b: red

        // Left face
        1.0,  0.0,  1.0,  1.0,    // h: magenta,
        1.0,  1.0,  1.0,  1.0,    // a: white
        0.0,  0.0,  1.0,  1.0,    // d: blue,
        1.0,  0.0,  1.0,  1.0,    // h: magenta,
        0.0,  0.0,  1.0,  1.0,    // d: blue,
        1.0,  1.0,  0.0,  1.0,    // e: yellow

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


    elapsed = Date.now() - startTime;



    // and store it in the modelMatrix
    mat4.multiply(modelMatrix, translationMatrix, rotationMatrix);

    // if you want to scale the positions as well,
    // mulitply the model matrix by the scale matrix
    // mat4.multiply(modelMatrix, modelMatrix, scaleMatrix);

    // order matters! Instead of translation and rotation first, try scaling and rotation first
    // mat4.multiply(modelMatrix, rotationMatrix, scaleMatrix);
    // mat4.multiply(modelMatrix, modelMatrix, translationMatrix);

    // rotate the square a little each time
    mat4.rotate(
      rotationMatrix,  // destination matrix
      rotationMatrix,  // matrix to rotate
      Math.PI * .01 ,  // amount it rotates each frame
      // [0, 0, 1] // the axis it rotates around: the center of the front face
      // New: now that we are rotating in 3D space, we can do much more interesting
      // rotations
      // [0, 1, 0] // the axis it rotates around: a vertical axis
      [0, 1, 1] // the axis it rotates around: tilted
      // [(Math.cos(elapsed * .001)+1)*.5, .5, 1] // the axis it rotates around: a moving axis
    );


    gl.uniformMatrix4fv(modelUniform, false, modelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
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

