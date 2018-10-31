(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {premultipliedAlpha: false}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,
    startTime,

    positionLocation,

    modelUniform,


    projectionUniform,
    projectionMatrix,

    translationMatrix,
    rotationMatrix,
    scaleMatrix,

    modelMatrix,

    daylightImage,
    nighttimeImage



    ;


  const ARC_PRECISION = 50;


  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;



  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);

    modelUniform = gl.getUniformLocation(program, "u_model");
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // tell the shader that we want blending
    // gl.enable(gl.BLEND);
    // // and specify just how we want the blending to work
    // // gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    // gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    // gl.blendEquation(gl.FUNC_ADD);

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

    gl.uniformMatrix4fv(projectionUniform, false, projectionMatrix);

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
      Math.PI,  // amount to rotate it
      [1, 0, 0] // the axis it rotates around: the center of the square
    );

    mat4.scale(
      scaleMatrix,  // the matrix that tracks the rotation
      scaleMatrix,  // matrix to to start from (unrotated here)
      [1.5, 1.5, 1.5]
    );



    positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var coords = [],
      textureCoords = [];
    const cos = Math.cos,
      sin = Math.sin,
      PI = Math.PI,
      TAU = PI * 2,
      HALF_PI = PI * .5,
      INCREMENT = PI / ARC_PRECISION,
      // because floats can get imprecise, allow ourselves to
      // overshoot the last row a little bit
      LIMIT = HALF_PI + INCREMENT/2;
    pointCount = 0;


    for (var lat = -HALF_PI + INCREMENT; lat <= LIMIT; lat += INCREMENT) {
      var previousRow = lat - INCREMENT,
        prevY = sin(previousRow),
        currentY = sin(lat),
        cosPrevious = cos(previousRow),
        cosCurrent = cos(lat),
        previousTextureY = (previousRow+HALF_PI)/PI,
        currentTextureY = (lat+HALF_PI)/PI;

      for (var lon = 0; lon <= TAU + .001; lon += INCREMENT) {
        var cosLon = cos(lon),
          sinLon = sin(lon),
          previousX = cosPrevious * cosLon,
          currentX = cosCurrent * cosLon,
          previousZ = cosPrevious * sinLon,
          currentZ = cosCurrent * sinLon,
          textureX = lon/TAU;
        coords.push(previousX);
        coords.push(prevY);
        coords.push(previousZ);
        textureCoords.push(textureX);
        textureCoords.push(previousTextureY);
        pointCount++;
        coords.push(currentX);
        coords.push(currentY);
        coords.push(currentZ);
        textureCoords.push(textureX);
        textureCoords.push(currentTextureY);
        pointCount++;
      }
    }


    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(coords),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);


    var resolutionUniform = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniform, W, H);



    // New: Our goal here is to place the same image
    // on each face of the cube. So for each corner
    // of each triangle above, we have to tell it which
    // corner of the image to use.
    var imagePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, imagePositionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(textureCoords),
      gl.STATIC_DRAW
    );
    var imagePositionLocation = gl.getAttribLocation(program, "a_imagePosition");
    gl.enableVertexAttribArray(imagePositionLocation);
    gl.vertexAttribPointer(imagePositionLocation, 2, gl.FLOAT, false, 0, 0);




    // pass an image to the shader so it can be used to draw the points.
    // where is it gonna go?
    var dayImageUniform = gl.getUniformLocation(program, "u_dayImage");
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, daylightImage);
    gl.uniform1i(dayImageUniform, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);


    var nightImageUniform = gl.getUniformLocation(program, "u_nightImage");
    var texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nighttimeImage);
    gl.uniform1i(nightImageUniform, 1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

  }




  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(1.0, 1.0, 1.0, 0.1);
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
      Math.PI * -.005,  // amount it rotates each frame
      // [0, 0, 1] // the axis it rotates around: the center of the front face
      [0, 1, 0] // the axis it rotates around: a vertical axis
      // [0, 1, 1] // the axis it rotates around: tilted
      // [(Math.cos(elapsed * .001)+1)*.5, .5, 1] // the axis it rotates around: a moving axis
    );


    gl.uniformMatrix4fv(modelUniform, false, modelMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointCount);
  }






  // ██████╗  ██████╗ ██████╗ ██╗███╗   ██╗ ██████╗     ███████╗████████╗██╗   ██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██╔══██╗██║████╗  ██║██╔════╝     ██╔════╝╚══██╔══╝██║   ██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██████╔╝██║██╔██╗ ██║██║  ███╗    ███████╗   ██║   ██║   ██║█████╗  █████╗
  // ██╔══██╗██║   ██║██╔══██╗██║██║╚██╗██║██║   ██║    ╚════██║   ██║   ██║   ██║██╔══╝  ██╔══╝
  // ██████╔╝╚██████╔╝██║  ██║██║██║ ╚████║╚██████╔╝    ███████║   ██║   ╚██████╔╝██║     ██║
  // ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝


  // load files

  nighttimeImage = new Image();
  daylightImage = new Image();
  daylightImage.addEventListener('load', ()=> {
    nighttimeImage.addEventListener('load', ()=> {
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
              startTime = Date.now();
              setInterval(requestDraw, 33);
            });
        });
    });
    nighttimeImage.src = "../images/dnb_land_ocean_ice.2012.3600x1800.jpg";
  });
  // daylightImage.src = "../images/world.png";
  daylightImage.src = "../images/nasa_blue_marble.4096.jpg";
  // courtesy of NASA
  // https://visibleearth.nasa.gov/view.php?id=79765
  // ftp://public.sos.noaa.gov/land/blue_marble/earth_vegetation/4096.jpg







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

