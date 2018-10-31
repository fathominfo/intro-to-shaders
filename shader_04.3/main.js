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

    modelMatrix,

    pointCount

    ;


  const ARC_PRECISION = 50;

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


    // New: we will creatig a lot or vertices, too many to hand curate the
    // color for each vertex. So here we create a list of colors, which we
    // will draw from programmatically as we set up the sphere coordinates.
    const colorSources = [
        [1.0,  1.0,  1.0,  1.0],    // white
        [1.0,  0.0,  0.0,  1.0],    // red
        [0.0,  1.0,  0.0,  1.0],    // green

        [0.0,  0.0,  1.0,  1.0],    // blue,
        [1.0,  0.5,  0.0,  1.0],    // orange
        [0.0,  1.0,  0.5,  1.0],    // violet

        [0.5,  0.0,  1.0,  1.0],    // yellow
        [1.0,  1.0,  0.0,  1.0],    // yellow
        [0.0,  1.0,  1.0,  1.0],    // cyan
        [1.0,  0.0,  1.0,  1.0],    // magenta
        [0.0,  0.5,  1.2,  1.0]
        ];


    // New: rather than curate the vertices, we will generate them using
    // good ole trigonometry.
    var coords = [],
      colors = [];
    const cos = Math.cos,
      sin = Math.sin,
      PI = Math.PI,
      TAU = PI * 2,
      HALF_PI = PI * .5,
      INCREMENT = PI / ARC_PRECISION,
      // because floats can get imprecise, allow ourselves to
      // overshoot the last row a little bit
      LIMIT = HALF_PI + INCREMENT/2;
    // we need to track many vertices we will draw
    pointCount = 0;
    // we will build out the sphere row by row
    for (var lat = -HALF_PI; lat <= LIMIT; lat += INCREMENT) {
      var previousRow = lat - INCREMENT;
      var prevY = sin(previousRow),
        currentY = sin(lat),
      // var prevY = sin(previousRow * 2),
      //   currentY = sin(lat * 2),
        cosPrevious = cos(previousRow),
        cosCurrent = cos(lat),
        // cosPrevious = cos(previousRow * 3),
        // cosCurrent = cos(lat * 3),
        colorIndex = 0;
      // build out the triangles for this row
      for (var lon = 0; lon <= TAU; lon += INCREMENT) {
        var cosLon = cos(lon),
          sinLon = sin(lon),
          // sinLon = sin(Math.pow(lon/TAU, 2) * TAU),
          previousX = cosPrevious * cosLon,
          currentX = cosCurrent * cosLon,
          previousZ = cosPrevious * sinLon,
          currentZ = cosCurrent * sinLon,
          color = colorSources[colorIndex];
        coords.push(previousX);
        coords.push(prevY);
        coords.push(previousZ);
        // add each elemnt of the color to the color array
        for (var i=0; i<color.length; i++) {
          colors.push(color[i]);
        }
        pointCount++;
        coords.push(currentX);
        coords.push(currentY);
        coords.push(currentZ);
        // add each elemnt of the color to the color array
        for (var i=0; i<color.length; i++) {
          colors.push(color[i]);
        }
        pointCount++;
        colorIndex = (colorIndex + 1) % colorSources.length;
      }
    }

    // we will feed the vertex array and the color array to the shader at the same time,
    // and they need to stay in synch.
    // But each vertex coordinate has 3 elements (x, y, and z)
    // and each color has 4 elements (r, g, b, and a). So we need to tell the shader
    // how many elements to grab from each array in ordeer to keep them in synch.
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    // the shader should grab 3 elements for each vertex
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // the shader should grab 4 elements for each color
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
    mat4.multiply(modelMatrix, modelMatrix, scaleMatrix);

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
      // [0, 1, 1] // the axis it rotates around: tilted
      [(Math.cos(elapsed * .001)+1)*.5, .5, 1] // the axis it rotates around: a moving axis
    );


    gl.uniformMatrix4fv(modelUniform, false, modelMatrix);
    // New: because we don't know how many vertices we will create at the outset,
    // we tracked the number of vertices in this variable that we will now pass
    // as a parameter.
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointCount);
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

