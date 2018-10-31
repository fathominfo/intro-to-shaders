<p><i>Note: this resource is from an internal workshop. You can read more about it <a href="https://medium.com/p/cb8ca9678c06/edit">here</a>. If you choose to edit the code, some familiarity with javascript is required: at the very leat, you need to be able to comment out code, and remove the double slashes that comment out code.</i></p>
  
<h1>Shaders</h1>
  <p>We'll describe shaders with a host of examples that you can play with. Fire up your text editor, because the fun lies in tweaking the code in the examples. In general, each example is set up so that with minor edits you can do fun changes. In many cases, the code will have sections that you can comment in or out that result in dramatic changes. </p>

  <p>What makes shaders special is that they are designed to run in parallel. For example, some are designed to run once for every pixel on the screen. If you are drawing a window that is 1,000 x 1,00 pixels at 30 frames a second, that makes 30,000,000 commands every second. By making them run in parallel (usually on special hardware called the GPU), drawing programs can do all sorts of complicated things a lot faster. </p>

  <p>But that advantage is also part of the catch: shaders talk to special hardware that render quickly, but that hardware is super picky about how you talk to it. Drawing with a javascript canvas is comparatively straightforward: you can tell it what color to use, and then draw a rectangle. Calling a shader from javascript is like asking where it wants to put some data, creating a special container to hold the data, telling the shader that your gonna send over the container, and then actually sending it over. If you send the wrong type of container, or put the wrong stuff in it, the shader might tell you what was wrong. Or it might not. It's really picky.</p>

  <p>Also note, there are some really great tutorials for learning shaders. Some are listed at the bottom of this page. This document is assembled for as a quick guide to play with over the course of a couple sessions. If you want to dive deeper, try those other resources. </p>


  <h3>The basics</h3>

  <p>A <a href="shader_01">really boring</a> example to show some basics. We are using a shader to color the sceen hot magenta. If all you want to do is color the page hot magenta, there are much easier ways to do this. But this demonstrates some of the hoops that you have to jump through in order to use shaders.</p>

  <p>Each example is its own WebGL program, made up of four files. The index.html file is there because it has to be, and it has as little as possible. The javascript file invokes the shader. There's a lot of administrivia in getting a shader to run, and we try to isolate that at the bottom of the javascript file. As we move from example to example, we try to flag the changes in the javascript file so that they are easy to find.
  <p>

  <p>The other two files are what makes the shader. The first file, <a href="shader_01/vert.glsl">vert.glsl</a>, is used to calculate the shape we draw on. It has to be there, but we don't do anything particularly interesting with it for the first examples. The other file, <a href="shader_01/frag.glsl">frag.glsl</a>, is the fragment shader. Here, all we are doing is setting a each pixel to magenta. gl_FragColor is a special variable that represents the color for that pixel. vec4(1.0, 0.0, 1.0,  1.0) is four numbers for red, green, blue, and the alpha value. It's important to notice that in shaders, color values run from 0.0 to 1.0, not 0 to 255. So, vec4(1.0, 1.0, 1.0, 1.0) is full opacity white, vec4(1.0, 0.0, 0.0, 0.5) is half-transparent red. Feel free to edit these numbers and reload the page. And notice that you probably need to keep the decimals in there. Shaders are finicky, and won't accept an integer where a float is expected.
  </p>



  <h3>Passing parameters</h3>
  <p>This builds off our really boring example to show how you can change things <a href="shader_02.0">over time</a>, or <a href="shader_02.1">by position</a>, or pass in <a href="shader_02.2">mouse coordinates</a>, or <a href="shader_02.3">all three</a>. Again, there are easier ways to do these. But the <a href="shader_02.1">position example</a> hints at some of the power of shaders. Here the shader is calculating the color for each pixel, one by one, independent of the pixels around it. Again, there are easier ways to get gradients, but this is the power we will soon unleash!</p>

  <p>Each of these examples has a parameter defined at the top of frag.glsl, declared in a line like "uniform float u_time;" or "uniform vec2 u_resolution;". "u_time" or "u_resolution" is the name we give the parameter; it could be "larry", or "elapsed_milliseconds". The other words are required keywords in glsl. You may recognize "float": that indicates that this variable has a decimal value. There are also "int", and datatypes of "vec2", "vec3", and "vec4", which are a pair of floats, a set of three floats, and a set of four floats respectively. There are also datatypes for matrices ("mat2", "mat3", and "mat4") and for images ("sampler2D" and "samplerCube").</p>

  <p>The "uniform" keyword is another required identifier. It indicates that the value is getting passed from javascript, and that it is the same for every pixel or vertex. Another option is "attribute", indicating a value passed from javascript that is different for each vertex. And another is "varying", which is a variable that is passed from the vertex shader to the fragment shader. In a shader program, the vertex code is always called first, and then the fragment code.</p>


  <h3>So, why shaders?</h3>

  <p>Here we finally start to show things that shaders make easy and performant.</p>

  <p>First off, repeating a pattern is trivially easy. With just a couple lines, we can split the gradients we made before into <a href="shader_03.0">multiple copies</a> to create tiling effects. And we can create <a href="shader_03.1">tiles of other shapes</a> as well. With just a few tweaks of code, we can span generations of grooviness.</p>

  <p>And since we are looking at things pixel by pixel, do you know what else is made of pixels? Pictures! In shader parlance, these are often called “textures”, since in early animations they were applied to different shapes to give them more, you guessed it, texture (since rendering lots of bumps or hairs is too costly). <a href="shader_03.2">Here</a> is a simple shader where we simply redraw every pixel in the image right to the screen. But in the <a href="shader_03.2/frag.glsl">frag.glsl</a> file, there are all sorts of variations on the color that you can comment in to explore what you can do. And we can also <a href="shader_03.3">re-apply all the color changing techniques</a> that we did earlier with the gradients.</p>

  <p>So far our shaders just deal with one pixel. But there are interesting effects you can create when you compare a pixel to those near it. In <a href="shader_03.4">this example</a>, we look at a pixel, and the eight pixels that surround it (above, below, left, right, and the diagonals). The way we combine those values is driven by a matrix that we pass in from the javascript, so whereas in most examples it's worth tweaking the <a href="shader_03.4/frag.glsl">frag.glsl</a> file, in this case, there are different options in <a href="shader_03.4/main.js">main.js</a> that are worth exploring.</p>

  <p>Beyond the scope of what we are covering here, it's worth noting that just messing with fragment shaders can lead to mind blowing results. For example, check out <a href="https://www.shadertoy.com/view/MdX3Rr">this virtual landscape</a> all driven by tweaking pixel values, with noise, etc.</p>


  <h3>Out of Flatland</h3>

  <p>As noted before, a WebGL shader is made up of two parts, the vertex shader and the fragment shader. All the fun we have had so far is on the fragment shader side of things. Our only use for the vertex shader has been to layout where our pictures will go. We did that by putting a vertex at each corner of the window, and then letting the fragment shader fill in that rectangle. But we can put the vertices anywhere, which we will do in a moment. </p>

  <p>But first, just a quick demo of a different way to define colors. In one of our <a href="shader_02.1">earlier examples</a>, we created gradients by having each pixel figure out where it was, and calculating its color based on its position. There is a simpler way. <a href="shader_04.0">We can put a color at each vertex</a>, and the fragment shader automagically will interpolate between the vertices, creating our gradients for us.</p>

  <p>But why use the vertices to just fill the window? We can <a href="shader_04.1">alter the shape that we draw</a>, and move it around. There are different ways of moving it: you can move the vertices around in javascript, or in the vertex shader, which we will explore later. The other option is to alter the space that the vertices are drawn in. That space is called the model, and shaders are optimized for this sort of transformation. We spend a fair amount of code setting up the transformation matrix in the <a href="shader_04.1/main.js">javascript</a>. In the <a href="shader_04.1/vert.glsl">vertex shader</a>, that transformation gets applied to the vertices with just one line of code. This is an example where the javascript file is set up for tweaking: try editing the matrix transformations in the "draw" function to get a feel for how they work. </p>

  <p>In the next example, we start moving to <a href="shader_04.2">3d shapes</a>. In addition to moving model with matrix transformations, we also want to define a perspective from which we view it. This will help preserve the feeling of depth, and the sense of watching from a certain location. This is set up in the <a href="shader_04.2/main.js">javascript file</a> around line 50 and we call it a projection matrix. You can try adjusting the field of vision, and the amount of translation as well. It's also fun to play with the transformations in the draw loop.</p>

  <p>We start on the cube itself around line 100. There different ways to set it up, but all of them involve building it up out of a set of triangles. Each corner needs to be placed in 3d space, so it need an x, a y, and a z coordinate. Our cube is centered around the coordinate 0,0,0, or the very center of our 3d space. Note that when we define the colors for each corner (starting around line 140), we need to pass in a color for each vertex. </p>

  <p>As mentioned before, 3d shapes themselves are built up of triangles. Mathematically, any shape with corners can be built up from triangles. For shapes that look round, the corners are placed close enough together that (hopefully) you can't tell they are there, like in <a href="shader_04.3">this sphere</a>. Here, the number of corners is set in the constant ARC_PRECISION at line 32. Try making that number smaller or larger: too small and you can see the corners. Too big, and the animation gets sluggish.  </p>

  <p><image src="images/trianglestrip.png" style="float:left"/>  When your code tells a vertex shader to draw a 3d shape, it has to pass the vertices, and it has to tell the shader how to group the individual vertices into triangles. The simplest is to to treat each set of three vertices as its own triangle. In <a href="shader_04.4">this example</a>, we have three triangles moving around in 3d space. When building up complex shapes, triangles sit next to each other, and share a side. You can take advantage of this and arrange the vertices so that every time you add a vertex, a new triangle gets added. In a TRIANGLE_STRIP, each set of three vertices in a row creates a new triangle: you get a triangle with vertices 0, 1, and 2, another triangle with vertices 1, 2, and 3, and so on. </p>

  <p style="clear:both"><image src="images/trianglefan.png" style="float:right;" width="300" />With a TRIANGLE_FAN, all the triangles share a common vertex, the first in the series. So you get a triangle at 0, 1, and 2, and your second triangles is at 0, 2, and 3. The next would be at 0, 3, and 4, and so on. You can play with how different triangles look by editing the draw function in the <a href="shader_04.4/main.js">main.js</a> file. Around line 195, try editing the replacing TRIANGLES with TRIANGLE_STRIP or TRIANGLE_FAN, and look at the different shapes you get. You can also tell the shader to just draw lines or points. With lines, you can't specify the cap or join, and the ability to control the line width is limited as well. Programs that require control over these line attributes often just re-implement lines as triangle based shapes. </p>

  <p>You can also instruct the shader to draw each vertex as a point. It will show up as a square, and sometimes WebGL will let you sepcify the size. That is done by setting gl_PointSize in the <a href="shader_04.4/vert.glsl">vertex shader</a>. If you set this example to drawing points, all the points rotate together as a group. If you want to see the points move more independently, then the most predictable way to control their individual movements is to do away with the matrix transformations. You can <a href="shader_04.5">control the location of each particle in javascript</a>, and pass the updated location for each frame. Or if the location of the particles follows a specific pattern, you can <a href="shader_04.6">pass the parameters for that pattern to the vertex shader</a>, and let it work out the precise location. These last two examples show the same types of movement, only one version implements the motion in the javascript file, and the other implements it in the vertex shader. This is the strategy we used for State Street and Athena.</p>

  <h4 style="clear:both">Bringing it All Together</h4>

  <p>So far, we focused on either fragment or vertex shaders separately. Together, they are even more powerful. In general, there are two broad ways to do this: you can draw an image every time you draw a point, or you can wrap an image around a shape. </p>

  <p>For <a href="shader_05.0">points</a>, you set up your shader so that the image is used as a sprite for every point. On the javascript side, the image set up is much like we did when we were looking at how fragment shaders manipulate images. The difference is in the <a href="shader_05.0/frag.glsl">fragment shader</a>: instead of grabbing a color from the image based on how it is stretched across vertices, we center the image on the current vertex (using "gl_PointCoord"), size it according to gl_PointSize, and the color from the corresponding pixel. We can still adjust the image according to other parts of the data: you can set the size of each point in the <a href="shader_05.0/vert.glsl">vertex</a> shader, and tweak the color in the <a href="shader_05.0/vert.glsl">fragment</a> shader. </p>

  <p>The other case we want to look at is wrapping a complex 3d shape in an image. Let's take the cube we had earlier, but instead of putting a color at each vertex, let's put a <a href="shader_05.1">picture on each face</a>. This example illustrates why they got the name "textures": calculating the 3d coordinates for each of those bumps would take a fair amount of work, especially in the early days of computer animation. It's much easier to convey the bumpy texture with a picture.</p>

  <a>Much like before, we need to pass in the corners of the cube, but we also have to let the shader know how the image should fit over those corners. So we build up each face of the cube with two triangles, and then stretch the image across those corners the same way for each face of the cube. Note that although the vertex coordinates go between -1 and 1, the texture coordinates from from 0 to 1. And the vertex coordinates go from 1 at the top to -1 at the bottom, the texture coordinates go from 0 at the top to 1 at the bottom. The changing scale and direction fits conventions defined by the graphics community, but seems inconsistent for first timers. </p>

  <p>Note that we don't have to use the entire image. When we set up the coordinates in the javascript, we could just use the center part of the image. Try uncommenting lines 204-207 in <a href="shader_05.1/main.js">the javascript file</a>. It also might make more sense with a different image, which you can change around line 325. Also note that we can change the color on the face of the cube that we did in earlier examples. By editing <a href="shader_05.1/frag.glsl">the fragment shader</a>, you set the color by the location on the face of the cube or the location over the background.</p>

  <p>Instead of repeating the same picture six times, it's more likely that you would want something <a href="shader_05.2">different on each face</a>? One obvious solution would be to load six separate images, but sadly you might run up against hardware limitations on the number of images you can use in a shader. So a common trick is to <a href="images/fathom.png">merge all the images into one</a>, and then tell the shader which parts of the image to put where. In this case, each face of the cube fits in a 160 pixel square, and the faces are arranged in <a href="images/fathom_w_guides.png">two rows</a>. Starting around line 158 in the <a href="shader_05.2/main.js">javascript</a> file, we track precisely which part of the image to grab for each side of the cube. Just like before, we need an image coordinate for every vertex coordinate, so you will see repeated coordinates as we build up the triangles for each face of the cube.</p>

  <p>Even though putting images on a cube seems intuitive, you can see it gets a little more complicated when we have to build up the cube from triangles. The good news is that the same techniques apply when wrapping images around more complicated shapes. Building off the <a href="shader_04.3">sphere example</a> earlier, we can <a href="shader_05.3">wrap a sphere in a texture</a> to build a globe. Here we are using an image from <a href="ftp://public.sos.noaa.gov/land/blue_marble/earth_vegetation/4096.jpg">NASA</a> to convey an earth devoid of clouds, entirely in daylight. We can also make it a <a href="shader_05.4">little more realistic</a> by adding a <a href="https://visibleearth.nasa.gov/view.php?id=79765">second image</a>, wrapping both of them around the sphere, but choosing which one we show (or even combining them) according to whether the Earth should be in daylight or not. Note the techniques for adding a second image highlight some of the administrative hassles of working with WebGL: before you can set it up, you have to tell the shader just which texture you are working with in a couple places. Also note, to compare our simple example with a real effort to model the globe, see <a href="http://roberthodgin.com/portfolio/work/world-economic-forum/" target="_">this project</a> by Robert Hodgin (many shaders, but not WebGL).</p>


  <h4 style="clear:both">Driving It with Data</h4>

  <p>Our next goal is to turn this globe into a data tool, a chloropleth globe, where each country is colored according to some color value. For the data, we will use a some <a href="data_prep/population_2018.json">2018 population data</a> gathered from sources <a href="https://population.un.org/wup/Download/">available from the UN</a>. </p>

  <p>There are several ways we could build out our data globe. For all of them, we need the shape of every country, and to color that shape according to the data. One method is to plot the borders of each country in 3d space, track the resulting vertices by country, and set a color for each vertex. But we are going to pursue a different technique that highlights some other quirks of WebGL, and that we have used in a few projects. </p>

  <p><figure style="float:right; width:237px;"><image src="images/europe.png" style="width: 100%;"/> <figcaption>What is that golden orange country in eastern Europe?</figcaption></figure>Our first resource will be a <a href="images/world.png">special map</a> that we built just for this purpose. It's not particularly pretty, but it is special. Each country has its own unique color, specifically the red channel. When translated into a number between 0 and 255, the red value in the RGB color corresponds to the country data in <a href="data_prep/population_2018.json">our data file</a>. We generated them specifically with this correposndence in mind. Here's an example: I go to the map, and look at the US. Using photoshop or something similar, I see the RGB values for the US are 1, 7, 17. Since the red value is "1", I know when I go to the data file, the US data will be at index position 1. Or let's say I am looking at eastern Europe, and I'm curious what that orange country is, but I don't know. Using the same tool as before, I get RGB of 243, 165, 35. Again, using the value of the red channel, I get the number 243. I go to the data file, and find that the item at index position 243 is "Serbia and Montenegro". While there, I notice the data file has "-1" for the total population; here, "-1" tells us that we don't have data for that country. Also, by the fact that the country is "Serbia and Montenegro", we know that the map is based on older data, since Montenegro split off into its own country in 2006. And that's true: we are repurposing a map we used for a project that had data stretchign back to 2001, so an older map was what we needed. Where the 2018 population countries don't align with the countries in our older project, there will be missing data. By the way, generating the map is a custom process, but has less to do with shaders, so we won't go into how to build that. </p>

  <p>Now that we have our special map, we can use it to <a href="shader_06.0">wrap the globe</a>. If we want to inspect the red channel by itself, we can edit the <a href="shader_06.0/frag.glsl">fragment shader</a> to color each country according to its red channel only. We can also check that the country lookup part of it is working by trying to color specific countries. With this step working, we have confidence that we can color each country correctly, which is a critical first step for a data globe. </p>

  <p>The next step is set the color for each country according to a data value. Now things get a little tricky. Since we have a map where each country corresponds to an index position, it would be great if we could hand off data to the shader arranged the same way: the USA data would be at array position 1, and the Serbia and Montenegro values would be at index 243. We can't pass it in as an attribute, since those need separate values for each vertex; our vertices correspond to the shape of the globe, not the countries in the the image. So we need to pass the data over as a uniform, a set of data that is the same for every vertex. Ideally, we could biuld up an array of numbers, and then look up values in that array, but shaders don't allow dynamic lookup of array values. They do allow dynamic lookups in tetures though! So our solution will be to encode the data in an image, pass that image to the shader, and then have the shader decode the image into the data we want. This may seem like a gnarly workaround, but it is a pretty typical solution.</p>

  <p>So how to encode the data in an image? Basically, we set up a system where each country corresponds to a pixel at a certain location, and then encode that countries data into the red, green, and blue values for that pixel. Since we have 253 countries in our list, we can use a picture with 256 pixels, or a 16x16 image. In our data, we have three data points per country: total population, urban population, and rural population. The values are reported in thousands: where it says "326767" for the total US population, that's 326 million, not 326 thousand. We could have a sticking point here: each channel only goes from 0-255, not up to 326 million. However, when we color the map, we want the area with the highest population to stand out the most, and everything else to be scaled to that. So rather than put the actual population number in the red channel, we will precalculate the number for each country as a percentage of the largest population. Then we will rescale that number to the 0-255 range, and put it in the red channel. Simlarluy, we can calculate each country's urban popluation as a percentage of its total population, and store that in the green channel. And repeat that with the rural population for the blue cahnnel. With our data arranged in rows of 16 pixels, we get an image that looks like <a href="shader_06.1/">this</a> (note we made it larger to see the distinct squares for each pixel). Where the square is black, there is no data. The orange square in the top row is at index position 3, which corresponds to China, the world's most populous country. The pink square in the second row corresponds to India. Compared to those two, most countries have low populations, and thus low values in the red channel; hence all the other squares of green and blue.
  </p>

  <p>Now we have a globe where we can set the color of all the countries, and a means of passing in data for all the countries. We can use these two results, and bring in the techniques for passing two images to the shader, and we will be almost there. Our last step is to have the <a href="shader_06.2/frag.glsl">fragment shader</a> fetch the data from the correct pixel on the data image. Once that is retrieved, we can <a href="shader_06.2/">color the globe</a> according to the total populatoin, the urban population, or the rural. </p>


  <h2>All the examples</h2>
  <ul>
    <li><a href="shader_01">1.0</a> A magenta shader</li>
    <li><a href="shader_02.0">2.0</a> Color changing over time</li>
    <li><a href="shader_02.1">2.1</a> Color changing by pixel position</li>
    <li><a href="shader_02.2">2.2</a> Color driven by mouse position</li>
    <li><a href="shader_02.3">2.3</a> Color by time, pixel position, and mouse</li>
    <li><a href="shader_03.0">3.0</a> First pass at tiling</li>
    <li><a href="shader_03.1">3.1</a> Rows of circles</li>
    <li><a href="shader_03.2">3.2</a> Showing an image</li>
    <li><a href="shader_03.3">3.3</a> Image in black &amp; white, combined with color by time, pixel position, and mouse</li>
    <li><a href="shader_03.4">3.4</a> Evaluating matrices of pixles in the fragment shader </li>
    <li><a href="shader_04.0">4.0</a> Gradients driven by colors attached to vertices</li>
    <li><a href="shader_04.1">4.1</a> The vertices *not* spanning the entire window (be sure to edit the draw function in main.js to enable the transformation matrix)</li>
    <li><a href="shader_04.2">4.2</a> Our first 3d shape: a cube</li>
    <li><a href="shader_04.3">4.3</a> A sphere</li>
    <li><a href="shader_04.4">4.4</a> A strange shape to illustrate TRIANGLES, TRIANGLE_STRIP, etc. (be sure to edit the draw function in main.js to group the vertices differently)</li>
    <li><a href="shader_04.5">4.5</a> Point shader, point position calculated in javascript</li>
    <li><a href="shader_04.6">4.6</a> Point shader, point position calculated in shader </li>
    <li><a href="shader_05.0">5.0</a> Point shader with image sprite</li>
    <li><a href="shader_05.1">5.1</a> Cube with texture</li>
    <li><a href="shader_05.2">5.2</a> More complicated texture mapping</li>
    <li><a href="shader_05.3">5.3</a> Mapping texture onto a sphere</li>
    <li><a href="shader_05.4">5.4</a> Sphere with two textures combined (day and night)</li>
    <li><a href="shader_06.0">6.0</a> Globe with each country colored by its data index</li>
    <li><a href="shader_06.1">6.1</a> A data image</li>
    <li><a href="shader_06.2">6.2</a> Data driven globe</li>
  </ul>


  <h2>Resources</h2>
  <h4>tutorials</h4>
  <ul>
  <li><a href="https://thebookofshaders.com/">https://thebookofshaders.com/</a>
  <li><a href="https://webglfundamentals.org/">https://webglfundamentals.org/</a>
  <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL">https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL</a>
  </ul>

  <h4>for <a href="https://processing.org">Processing</a></h4>
  <a href="https://processing.org/tutorials/pshader/">https://processing.org/tutorials/pshader/</a>

  <h4>inspiration</h4>
  <a href="https://www.shadertoy.com/">https://www.shadertoy.com/</a>


## License
```
The MIT License (MIT)

Copyright (c) 2015 Fathom Information Design

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```




*© 2018 Fathom Information Design*


