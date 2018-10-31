(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,
    startTime,
    frameCount = 0,

    mouseX, mouseY,
    mouseUniformLocation,
    resolutionUniformLocation,
    timeUniformLocation,
    matrixUniformLocation,
    positionLocation,

    // New: let's mess with an image
    img,
    // and we will need to pass in image coordinates separate from
    // the general vertex positions
    imagePositionLocation
    ;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;


  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);
    mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
    resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    timeUniformLocation = gl.getUniformLocation(program, "u_time");
    matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

    gl.uniform2f(resolutionUniformLocation, W, H);

    // Even though we aren't drawing anything really fancy,
    // we have to tell the GL Context how much of the screen we are drawing
    positionLocation = gl.getAttribLocation(program, "a_position");
    imagePositionLocation = gl.getAttribLocation(program, "a_imagePosition");
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
      gl.STATIC_DRAW );
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);



    // scale the image up to cover
    var aspect = W/H,
      imgAspect = img.width / img.height,
      imgW, imgH,
      imgL, imgR,
      imgT, imgB;
    if (imgAspect == aspect) {
      imgH = 1.0;
      imgW = 1.0;
      imgL = 0.0;
      imgT = 0.0;
    } else if (imgAspect > aspect) {
      imgT = 0.0;
      imgH = 1.0;
      imgW = aspect / imgAspect;
      imgL = (imgW - 1.0) * -.5;
    } else {
      imgW = 1.0;
      imgL = 0.0;
      imgH = imgAspect / aspect;
      imgT = (imgH - 1.0) * -.5;
      imgT = 0.0;
    }
    imgR = imgL + imgW;
    imgB = imgT + imgH;


    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        imgL, imgT,
        imgR, imgT,
        imgL, imgB,
        imgR, imgB]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(imagePositionLocation);
    gl.vertexAttribPointer(imagePositionLocation, 2, gl.FLOAT, false, 0, 0);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    /*****

    Try these different versions of the 'matrix' variable
    to get different effects in the image.


    **/
    // set the matrix
    // var matrix = [0,  0,  0,
    //               0,  1.0,  0,
    //               0,   0,  0]; // untransformed
    // var matrix = [-1, -1, -1,
    //               -1,  8, -1,
    //               -1, -1, -1]; // edge
    // var matrix = [-1, -1, -1,
    //               -1,  9, -1,
    //               -1, -1, -1]; // sharpen
    // var matrix = [-1,  1, 1,
    //               -1, .5, 1,
    //               -1, -1, 1]; // emboss
    // var matrix = [1/9.0, 1/9.0, 1/9.0,
    //               1/9.0,  1/9.0, 1/9.0,
    //               1/9.0, 1/9.0, 1/9.0]; // blur
    var matrix = [0,  2,  0,
                  -2, 0,  2,
                  0, -2,  0]; // gettin' wiggy!
    gl.uniform1fv(matrixUniformLocation, matrix);
  }


  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
    var elapsed = Date.now() - startTime;
    gl.uniform1f(timeUniformLocation, elapsed / 1000.0);
    gl.uniform2f(mouseUniformLocation, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }




  // ██████╗  ██████╗ ██████╗ ██╗███╗   ██╗ ██████╗     ███████╗████████╗██╗   ██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██╔══██╗██║████╗  ██║██╔════╝     ██╔════╝╚══██╔══╝██║   ██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██████╔╝██║██╔██╗ ██║██║  ███╗    ███████╗   ██║   ██║   ██║█████╗  █████╗
  // ██╔══██╗██║   ██║██╔══██╗██║██║╚██╗██║██║   ██║    ╚════██║   ██║   ██║   ██║██╔══╝  ██╔══╝
  // ██████╔╝╚██████╔╝██║  ██║██║██║ ╚████║╚██████╔╝    ███████║   ██║   ╚██████╔╝██║     ██║
  // ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝




  img = new Image();
  img.addEventListener('load', ()=> {
    // new: fetch the shaders after the image is loaded
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
          requestDraw();
        });
    });
  });
  img.src = "../images/home.jpg";
  // img.src = "../images/dd.jpeg";




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

