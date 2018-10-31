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

    mapImage,
    dataColorUniform,

    countryRGB,

    dataColorCanvas,
    dataColorCtx,
    dataColorImg = new Image(),
    dataTexture,

    popData

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
    gl.enable(gl.BLEND);

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
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, mapImage.width, mapImage.height);


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
    for (var lat = -HALF_PI; lat <= LIMIT; lat += INCREMENT) {
      var previousRow = lat - INCREMENT,
        prevY = sin(previousRow),
        currentY = sin(lat),
        cosPrevious = cos(previousRow),
        cosCurrent = cos(lat);
      for (var lon = 0; lon <= TAU; lon += INCREMENT) {
        var cosLon = cos(lon),
          sinLon = sin(lon),
           previousX = cosPrevious * cosLon,
          currentX = cosCurrent * cosLon,
          previousZ = cosPrevious * sinLon,
          currentZ = cosCurrent * sinLon;
        coords.push(previousX);
        coords.push(prevY);
        coords.push(previousZ);
        textureCoords.push(lon/TAU);
        textureCoords.push((previousRow+HALF_PI)/PI);
        pointCount++;
        coords.push(currentX);
        coords.push(currentY);
        coords.push(currentZ);
        textureCoords.push(lon/TAU);
        textureCoords.push((lat+HALF_PI)/PI);
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

    var imageUniform = gl.getUniformLocation(program, "u_image");
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // New: here, we switch the last parameter in how we want to render the texture
    // from LINEAR to NEAREST. When textures get applied to surfaces, they get
    // stretched and bunched, and onscreen pixels don't always correspond to
    // image pixels. This parameter controls what happens when the screen pixel
    // falls into one of those "between pixel" areas.
    // When rendering images, we often want to interpolate between pixel values.
    // That prevents weird choppy edges showing up.
    // But here, the map texture isn't getting rendred directly. Each country on the map
    // has its own color, and we will use the color to lookup some data. So imagine the
    // color we get for the US is 1, and the number for Mexico is 10. If we did a linear
    // interpolation, we would get (1 + 10) /2 = 5.5, which we woudl truncate to 5.
    // 5  happens to be the index for Germany, and so along the border between the US
    // and Mexico, we would be looking up a little line of Germany data. So instead of
    // interpolating, we use the value from the NEAREST pixel.
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapImage);
    gl.uniform1i(imageUniform, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);


    dataColorUniform = gl.getUniformLocation(program, "u_dataColors");
    dataTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dataColorImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // New: again, using NEAREST instead of LINEAR. See note above.
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(dataColorUniform,1);
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);

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


    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dataTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dataColorImg);

    gl.uniformMatrix4fv(modelUniform, false, modelMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointCount);
  }


  function colorByPopulation() {
    // what is the max population?
    var maxTotal = 0,
      maxUrbanPct = 0,
      maxRuralPct = 0;
    popData.forEach(item=>{
      if (item.total > 0) {
        maxTotal = Math.max(maxTotal, item.total);
        maxUrbanPct = Math.max(maxUrbanPct, item.urban / item.total);
        maxRuralPct = Math.max(maxRuralPct, item.rural / item.total);
      }
    });
    dataColorCtx.clearRect(0,0,16,16);
    var countryIndex = 0;
    for ( var y=0;y<16;y++) {
       for ( var x=0;x<16;x++) {
        // we will use red green and blue channels to encode
        // total, urban and rural populations for each country.
        let countryData = popData[countryIndex],
          r = 0,
          g = 0,
          b = 0;
        if (countryData) {
          if (countryData.total > 0) {
            let urbanPct = countryData.urban / countryData.total,
              ruralPct = countryData.rural / countryData.total;
            r = 1 + countryData.total / maxTotal * 254;
            g = 1 + urbanPct / maxUrbanPct * 254;
            b = 1 + ruralPct / maxRuralPct * 254;
            //console.log(countryData.name, countryData.total, r, x, y);
          } else {
            //console.log(countryData.name, countryData.total, r, x, y);
          }
        }
        let fs = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
        console.log(fs, countryData ? countryData.name : '', x, y);
        // let fs = 'rgb(' + Math.round(r) + ',0,0)';
        dataColorCtx.fillStyle = fs;
        dataColorCtx.fillRect(x,y,2,2);
        countryIndex++;
      }
    }
    dataColorImg.src = dataColorCanvas.toDataURL();
    // It can be helpful for debugging to append your data image to
    // the document so that you see the results
    // var body = document.getElementById('b');
    // dataColorImg.style.width = '256px';
    // dataColorImg.style.height = '256px';
    // dataColorImg.style.position = 'absolute';
    // dataColorImg.style.top = '0';
    // dataColorImg.style.left = '0';
    // dataColorImg.style.zIndex = '1000';
    // body.appendChild(dataColorImg);
  }





  function initDataImage(){
    countryRGB = new Float32Array(256*3);
    for ( var i=0;i<256;i++) {
      let i3 = i*3;
      countryRGB[i3] = 0; //Math.abs(Math.sin(Math.random() * Math.PI * 2)) * 255;
      countryRGB[i3+1] = 0;
      countryRGB[i3+2] = 0;
    }
    // create an image we can use for setting colors in the globe fragment shader
    dataColorCanvas = document.createElement('canvas');
    dataColorCtx = dataColorCanvas.getContext('2d');
    dataColorCanvas.width = 16;
    dataColorCanvas.height = 16;
    dataColorImg.width = 16;
    dataColorImg.height = 16;
    dataColorCtx.fillStyle = 'white';
    dataColorCtx.fillRect(0,0,16,16);

    var launchShader = ()=>{
      dataColorImg.removeEventListener('load', launchShader);
      initGLData();
      colorByPopulation();
      setInterval(requestDraw, 33);
    }
    dataColorImg.addEventListener('load', launchShader);
    dataColorImg.src = dataColorCanvas.toDataURL();
  }





  // ██████╗  ██████╗ ██████╗ ██╗███╗   ██╗ ██████╗     ███████╗████████╗██╗   ██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██╔══██╗██║████╗  ██║██╔════╝     ██╔════╝╚══██╔══╝██║   ██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██████╔╝██║██╔██╗ ██║██║  ███╗    ███████╗   ██║   ██║   ██║█████╗  █████╗
  // ██╔══██╗██║   ██║██╔══██╗██║██║╚██╗██║██║   ██║    ╚════██║   ██║   ██║   ██║██╔══╝  ██╔══╝
  // ██████╔╝╚██████╔╝██║  ██║██║██║ ╚████║╚██████╔╝    ███████║   ██║   ╚██████╔╝██║     ██║
  // ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝


  // load files

  mapImage = new Image();
  mapImage.addEventListener('load', ()=> {
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
            fetch('population_2018.json')
              .then(function(response) {
                return response.json();
              }).then(popDataResponse=>{
                popData = popDataResponse;
                // New: we have one more step before launching the shader.
                // We are going to encode our data into an image, and then
                // kick off the shader program.
                initDataImage();
            });
          });
      });
  });
  // mapImage.src = "../images/bumpy.jpeg";
  // mapImage.src = "../images/rust.jpg";
  // mapImage.src = "../images/f.png";
  mapImage.src = "../images/world.png";




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

