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

    points,


    activePositions
    ;

  const cos = Math.cos,
    sin = Math.sin;

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


    positionLocation = gl.getAttribLocation(program, "a_position");
    positionBuffer = gl.createBuffer();

    // New: create some points that will rotate around
    points = [];
    for (var i=0; i< 9; i++) {
      let xrot = .1 * (1 - Math.random()),
        yrot = .1 * (1 - Math.random()),
        radius = 1 - Math.random();
      radius += radius < 0 ? -.25 : .25;
      radius *= .5;
      var point = {
        "x_rotation_amount" : xrot,
        "y_rotation_amount" : yrot,
        "x_rotation" : xrot,
        "y_rotation" : yrot,
        "radius" : radius,
        "x" : cos(xrot) * cos(yrot) * radius,
        "y" : sin(yrot) * radius,
        "z" : sin(xrot) * cos(yrot) * radius
      }
      points.push(point);
    }


    activePositions = [];
    for (var i=0; i<points.length; i++) {
      var point = points[i];
      activePositions.push(point.x);
      activePositions.push(point.y);
      activePositions.push(point.z);
    }
    activePositions = new Float32Array(activePositions);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, activePositions, gl.STATIC_DRAW );
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


    


  }




  function draw() {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    for ( var i=0; i<points.length; i++) {
      var point = points[i],
        activeIndex = i * 3,
        radius = point.radius;       
      point.x_rotation += point.x_rotation_amount;
      point.y_rotation += point.y_rotation_amount;
      var xrot = point.x_rotation,
        yrot = point.y_rotation;
      point.x = cos(xrot) * cos(yrot) * radius;
      point.y =  sin(yrot) * radius;
      point.z = sin(xrot) * cos(yrot) * radius;
      activePositions[activeIndex] = point.x;
      activePositions[activeIndex + 1] = point.y;
      activePositions[activeIndex + 2] = point.z;
    };


    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, activePositions, gl.STATIC_DRAW );
    gl.drawArrays(gl.POINTS, 0, points.length);
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

