(()=>{
  var canvas = document.getElementById('shade'),
    gl = canvas.getContext('webgl', {premultipliedAlpha: false}),
    program,
    W = window.innerWidth,
    H = window.innerHeight,
    startTime,

    dataColorUniform,

    countryRGB,

    dataColorCanvas,
    dataColorCtx,
    dataColorImg = new Image(),
    dataTexture,

    popData

    ;






  function draw() {

    // Set clear color to black, fully opaque

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
        // we will use red, green, and blue channels to encode
        // total, urban and rural populations for each country.
        let countryData = popData[countryIndex],
          r = 0,
          g = 0,
          b = 0;
        if (countryData) {
          if (countryData.total > 0) {
            let urbanPct = countryData.urban / countryData.total,
              ruralPct = countryData.rural / countryData.total;
            // we will let 0 mean there is no data
            // so the lowest value will be 1, and the highest 
            // will be 255 (or 1 + 254)
            r = 1 + countryData.total / maxTotal * 254;
            g = 1 + urbanPct / maxUrbanPct * 254;
            b = 1 + ruralPct / maxRuralPct * 254;
          } else {
          }
        }
        /* to see just the population in the red channel */
        // let fs = 'rgb(' + Math.round(r) + ',0,0)';
        /* to see just the urban population percent in the green channel */
        // let fs = 'rgb(0,' + Math.round(g) + ',0)';
        /* to see just the rural population percent in the blue channel */
        // let fs = 'rgb(0,0,' + Math.round(b) + ')';
        /* to see them all combined */
        let fs = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
        // console.log(fs, countryData ? countryData.name : '', x, y);
        dataColorCtx.fillStyle = fs;
        dataColorCtx.fillRect(x,y,1,1);
        countryIndex++;
      }
    }
    dataColorImg.src = dataColorCanvas.toDataURL();
    // Append the  data image to the document to inspect it
    var body = document.getElementById('b');
    dataColorImg.style.width = '512px';
    dataColorImg.style.height = '512px';
    dataColorImg.style.position = 'absolute';
    dataColorImg.style.top = '0';
    dataColorImg.style.left = '0';
    dataColorImg.style.zIndex = '1000';
    body.appendChild(dataColorImg);
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
    var scale = 8;
    dataColorCanvas.width = 16 * scale;
    dataColorCanvas.height = 16 * scale;
    dataColorImg.width = 16 * scale;
    dataColorImg.height = 16 * scale;
    dataColorCtx = dataColorCanvas.getContext('2d');
    dataColorCtx.scale(scale, scale);
    dataColorCtx.fillStyle = 'white';
    dataColorCtx.fillRect(0,0,16,16);

    var launchShader = ()=>{
      dataColorImg.removeEventListener('load', launchShader);
      colorByPopulation();
      // setInterval(requestDraw, 33);
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

