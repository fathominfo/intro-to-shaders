(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {}),
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

    faceImage


    ;

  // make the canvas fill the window
  canvas.width = W;
  canvas.height = H;



  function initGLData() {
    // now we can get some config info
    gl.viewport(0, 0, W, H);

    modelUniform = gl.getUniformLocation(program, "u_model");
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
      Math.PI * .25,  // amount to rotate it
      [0, 0, 1] // the axis it rotates around: the center of the square
    );

    positionLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    /*
      New:
      in order to map the image to every face of the cube, we need
      a vertex at each corner of each face. Before we used a
      triangle strip and could cover all the faces of the cube
      with just 14 vertices and 14 colors. Now we define two
      triangles per face so 36 vertices.
    */
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
         // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         -1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,

      ]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // New: Our goal here is to place the same image
    // on each face of the cube. So for each corner
    // of each triangle above, we have to tell it which
    // corner of the image to use.

    var faceLocations = [
        // Front
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
        // Back
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
        // Top
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
        // Bottom
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
        // Right
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
        // Left
        0.0,  1.0,
        1.0,  1.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
      ];
    // Instead of pasting the image over as is,
    // we can grab different parts of the image
    // for (var i =0; i<faceLocations.length; i++) {
    //   // faceLocations[i] = faceLocations[i] * .5;
    //   faceLocations[i] = faceLocations[i] * .3 + .35;
    // }
    var imagePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, imagePositionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(faceLocations),
      gl.STATIC_DRAW
    );



    var imagePositionLocation = gl.getAttribLocation(program, "a_imagePosition");
    gl.enableVertexAttribArray(imagePositionLocation);
    gl.vertexAttribPointer(imagePositionLocation, 2, gl.FLOAT, false, 0, 0);

    // pass an image to the shader so it can be used to draw the points.
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
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, faceImage);
    // and tell the shader that we want to use this image for the uniform
    gl.uniform1i(imageUniform, 1);
    // and that this is the image to use for now
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);

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
      // [0, 1, 0] // the axis it rotates around: a vertical axis
      // [0, 1, 1] // the axis it rotates around: tilted
      [(Math.cos(elapsed * .001)+1)*.5, .5, 1] // the axis it rotates around: a moving axis
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

  faceImage = new Image();
  faceImage.addEventListener('load', ()=> {
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
  // Which image should we load? Just leave one
  // enabled, comment out the other two.
  faceImage.src = "../images/bumpy.jpeg";
  // faceImage.src = "../images/rust.jpg";
  // faceImage.src = "../images/f.png";






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

