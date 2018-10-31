(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,



    positionLocation,
    colorLocation,

    resolutionUniformLocation,


    // New: we are going to start moving the vertices around in space.
    // Or more accuratly, we are going to move the space in which
    // the vertices are placed. According to convention, the layout
    // of the vertices is called the "model".
    modelUniform,

    // New: to move the vertices, we will use math! Each type of motion
    //  will be in its own matrix.
    translationMatrix,
    rotationMatrix,
    scaleMatrix,
    //And then we will merge all different types of motion into one matrix
    // to hand over to the shader
    modelMatrix

    ;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;



  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);

    resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, W, H);

    // New: where does the shader store the model
    modelUniform = gl.getUniformLocation(program, "u_model");
    // There are several ways we will move the model, and we will
    // track each in its own matrix.
    // Translation is the technical term for changing the location.
    translationMatrix = mat4.create();
    // Rotation rotates
    rotationMatrix = mat4.create();
    // and scale isgrowing or shrinking
    scaleMatrix = mat4.create();
    // we will combine translation, rotation, and scale into one matrix
    modelMatrix = mat4.create();

    // move the drawing position a bit to where we want to
    // start drawing the square.
    // note: with glmatrix.js, the first parameter
    // is always the matrix that you are writing to. Any values
    // in that matrix will be overwritten.
    mat4.translate(
      translationMatrix,   // the matrix that tracks the translated location
      translationMatrix,   // matrix to start from (which is not moved at this point)
      [-0.25, 0.25, 0.0]); // amount to translate

    mat4.rotate(
      rotationMatrix,  // the matrix that tracks the rotation
      rotationMatrix,  // matrix to to start from (unrotated here)
      Math.PI * .25,  // amount to rotate it
      [0, 0, 1] // the axis it rotates around: the center of the square
    );

    mat4.scale(
      scaleMatrix,  // the matrix that will track the scaling
      scaleMatrix,  // source matrix
      [2, .5,  1.0]); // the scaling amount in the x, y, and z directions


    // the positions of our vertices
    var corners = [
        0.0, 0.5,
        0.75, 0.0,
        -0.5, -0.0,
         0.0, -0.5
      ];
    // the colors for each vertex
    var colors = [
        1.0,  1.0,  1.0,  1.0,    // white
        1.0,  0.0,  0.0,  1.0,    // red
        0.0,  1.0,  0.0,  1.0,    // green
        0.0,  0.0,  1.0,  1.0,    // blue,
      ];

    // pass our vertex locations to the vertex shader
    positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);
  }




  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // New: combine the translation matrix and rotation matrix,
    // and store it in the modelMatrix
    mat4.multiply(modelMatrix, translationMatrix, rotationMatrix);

    // if you want to scale the positions as well,
    // mulitply the model matrix by the scale matrix
    // mat4.multiply(modelMatrix, modelMatrix, scaleMatrix);

    // order matters! Instead of translation and rotation first, try scaling and rotation first
    // mat4.multiply(modelMatrix, scaleMatrix, rotationMatrix);
    // mat4.multiply(modelMatrix, modelMatrix, translationMatrix);

    // make the rotation change a little each frame
    // mat4.rotate(
    //   rotationMatrix,  // destination matrix
    //   rotationMatrix,  // matrix to rotate
    //   Math.PI * .01 ,  // amount it rotates each frame
    //   [0, 0, 1] // the axis it rotates around: the center of the square
    // );

    gl.uniformMatrix4fv(modelUniform, false, modelMatrix);
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

