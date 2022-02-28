"use strict";

var file_name = "tes.txt"

window.addEventListener("load", () => {

  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#c");

  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  
  var lineTools = document.getElementById("line-tools");
  var polyTools = document.getElementById("poly-tools");
  var inputLine = document.getElementById("line");
  var inputPolygon = document.getElementById("polygon");
  var importButton = document.getElementById("import");

  polyTools.style.display = "none";
  inputLine.addEventListener("click", e => {
    polyTools.style.display = "none";
    lineTools.style.display = "block";
  });
  inputPolygon.addEventListener("click", e => {
    polyTools.style.display = "block";
    lineTools.style.display = "none";
  });
  importButton.addEventListener("click", e => {
    file_name = document.getElementById("input_file_name").value;
    data = import_data(file_name)
    draw(gl)
  })

  var help = document.getElementById("help");
  var helptext = document.getElementById("help-text");
  helptext.style.display = "none";
  help.addEventListener("click", e => {
    if (helptext.style.display == "none") {
      helptext.style.display = "flex";
    }
    else {
      helptext.style.display = "none";
    }
  });

  var garis = document.getElementById("garis");
  garis.addEventListener("click", e => {
    document.getElementById("help-garis").style.display = "block";
    document.getElementById("help-ppanjang").style.display = "none";
    document.getElementById("help-persegi").style.display = "none";
    document.getElementById("help-poligon").style.display = "none";
    document.getElementById("help-import-export").style.display = "none";
  })

  var ppanjang = document.getElementById("persegi-panjang");
  ppanjang.addEventListener("click", e => {
    document.getElementById("help-garis").style.display = "none";
    document.getElementById("help-ppanjang").style.display = "block";
    document.getElementById("help-persegi").style.display = "none";
    document.getElementById("help-poligon").style.display = "none";
    document.getElementById("help-import-export").style.display = "none";
  })

  var persegi = document.getElementById("persegi");
  persegi.addEventListener("click", e => {
    document.getElementById("help-garis").style.display = "none";
    document.getElementById("help-ppanjang").style.display = "none";
    document.getElementById("help-persegi").style.display = "block";
    document.getElementById("help-poligon").style.display = "none";
    document.getElementById("help-import-export").style.display = "none";
  })

  var poligon = document.getElementById("poligon");
  poligon.addEventListener("click", e => {
    document.getElementById("help-garis").style.display = "none";
    document.getElementById("help-ppanjang").style.display = "none";
    document.getElementById("help-persegi").style.display = "none";
    document.getElementById("help-poligon").style.display = "block";
    document.getElementById("help-import-export").style.display = "none";
  })

  var importexport = document.getElementById("import-export");
  importexport.addEventListener("click", e => {
    document.getElementById("help-garis").style.display = "none";
    document.getElementById("help-ppanjang").style.display = "none";
    document.getElementById("help-persegi").style.display = "none";
    document.getElementById("help-poligon").style.display = "none";
    document.getElementById("help-import-export").style.display = "block";
  })


  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // Prepare data
  var data = import_data(file_name)

  var selectedObject = {objectType: type.NULL};
  var moveCoordinates = false;
  var rectCoordinates = [];
  var rectIndex = [];
  var startAt = [];

  var r1 = 1,g1 = 0,b1 = 0;

  draw(gl);

  function startDrawingLine(e){
    click = true;
    var point = pointer(e);

    if (selectedObject.objectType == type.LINE){
      moveCoordinates = true;
      startAt = [point.x,point.y]
    } else{
      data[type.LINE].coordinates.push(point.x,point.y);
    }
  }

  function stopDrawingLine(e){
    click = false;
    var point = pointer(e);
    // Penanganan jika hanya mengklik sekali / membuat sebuah point saja
    if (point.x == data[type.LINE].coordinates[data[type.LINE].coordinates.length-2] && point.y == data[type.LINE].coordinates[data[type.LINE].coordinates.length-1]){
      data[type.LINE].coordinates.pop();
      data[type.LINE].coordinates.pop();
      // for (var ii = 0; ii < 4; ii++) {
      //   data[type.LINE].colors.pop();
      // }
      // console.log(data[type.LINE])
      
      let selectedLineId = data[type.LINE].coordinates.findIndex(function (element, index, array){
        if (index % 4 == 0){
          // check x0 value
          if (pointToLineDistance(point.x,point.y,element,array[index+1],array[index+2],array[index+3]) < 3){
            return true;
          }
        }
        return false;
      });
      if (selectedLineId != -1){
        selectLine(selectedLineId); 
      }     
      return;
    }

    if (moveCoordinates){
      let distanceFromVertex1 = pointToPointDistance(startAt[0],startAt[1],data[type.LINE].coordinates[selectedObject.offset],data[type.LINE].coordinates[selectedObject.offset+1])
      let distanceFromVertex2 = pointToPointDistance(startAt[0],startAt[1],data[type.LINE].coordinates[selectedObject.offset+2],data[type.LINE].coordinates[selectedObject.offset+3])

      if (pointToLineDistance(startAt[0],startAt[1],data[type.LINE].coordinates[selectedObject.offset],data[type.LINE].coordinates[selectedObject.offset+1],data[type.LINE].coordinates[selectedObject.offset+2],data[type.LINE].coordinates[selectedObject.offset+3]) > 5){
        unselectLine();
        return;
      }

      if (distanceFromVertex1 < distanceFromVertex2){
        // geser titik awal garis
        data[type.LINE].coordinates[selectedObject.offset] = point.x;
        data[type.LINE].coordinates[selectedObject.offset+1] = point.y; 
      } else{
        // geser titik akhir garis
        data[type.LINE].coordinates[selectedObject.offset+2] = point.x;
        data[type.LINE].coordinates[selectedObject.offset+3] = point.y;  
      }
      // update original coordinates
      selectedObject.original_coordinates = data[type.LINE].coordinates.slice(selectedObject.offset,selectedObject.offset+4)

      // gambar ulang garis pada koordinat baru
      draw(gl); 
    } else{
      data[type.LINE].coordinates.push(point.x,point.y);
      data[type.LINE].colors.push(document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1);  
      data[type.LINE].colors.push(document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1);  
      draw(gl); 
    }
  }

  // Global variabel untuk Rectangle
  var pos0;
  var pos1;
  var click = false;

  function startDrawingRectangle(e){
    pos0 = pointer(e);

    if (!moveCoordinates) {
      //draw Rectangle
      data[type.RECTANGLE].coordinates.push(pos0.x, pos0.y);
      
      for (var ii = 0; ii < 6; ii++) {
        data[type.RECTANGLE].colors.push(document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1);
      }

      click = true;
    }  
  }

  function stopDrawingRectangle(e){
    click = false;
    var point = pointer(e);

    if (moveCoordinates) {
      //cari jarak minimum
      let distanceFromVertex = pointToPointDistance(pos0.x,pos0.y,data[type.RECTANGLE].coordinates[selectedObject.vertexId],data[type.RECTANGLE].coordinates[selectedObject.vertexId+1])
      
      if (distanceFromVertex > 10) {
        unselectRectangle();

        rectCoordinates = [];
        rectIndex = [];

        return;
      } else {
        var rect_newX = rectCoordinates[0];
        var rect_newY = rectCoordinates[1];
        
        for (var ii = 0; ii < 12; ii++) {
          if (rectCoordinates[ii] == rect_newX) {
            rectCoordinates[ii] = point.x;
          }
          if (rectCoordinates[ii] == rect_newY) {
            rectCoordinates[ii] = point.y;
          }
        }

        for (var ii = 0; ii < 12; ii++) {
          data[type.RECTANGLE].coordinates[rectIndex[ii]] = rectCoordinates[ii];
        }

        draw(gl); 
      }
    } else{
      // Penanganan jika hanya mengklik sekali / membuat sebuah point saja
      if (point.x == pos0.x && point.y == pos0.y) {
        data[type.RECTANGLE].coordinates.pop();
        data[type.RECTANGLE].coordinates.pop();
    
        for (var ii = 0; ii < 6 * 4; ii++) {
          data[type.RECTANGLE].colors.pop();
        }

        // mencari titik pada vertex dan akan menjadikannya selectedObject jika ditemukan
        searchPointInRect(point.x,point.y);
      }
    }
  }

  var isStart = false;
  var isDone = true;

  const start = document.getElementById("Start");
  start.addEventListener("click", startDraw);

  function startDraw() {
    if (document.getElementById("polygon").checked == true) {
      if (!isStart) {
        isStart = true;
        isDone = false;
      }
    }
  }

  const done = document.getElementById("Done");
  done.addEventListener("click", doneDraw);

  function doneDraw() {
    if (document.getElementById("polygon").checked == true) {
      isDone = true;
      isStart = false;
      data[type.POLYGON].coordinates.push('.');
      data[type.POLYGON].colors.push('.');
      data[type.POLYGON].colors.push('.');
    }
  }

  function startDrawingPolygon(e) {
    click = true;
    var point = pointer(e);

    if (selectedObject.objectType == type.POLYGON){
      moveCoordinates = true;
      startAt = [point.x,point.y]
    } else {
      if (isStart) {
        data[type.POLYGON].coordinates.push(point.x,point.y);
        data[type.POLYGON].colors.push(document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1);
        console.log("Semua data");
        console.log(data[type.POLYGON].coordinates);
        console.log(data[type.POLYGON].colors);
      }
    }
  }

  function stopDrawingPolygon(e) {
    click = false;
    var point = pointer(e);

    if (!moveCoordinates) {
      if (isDone) {
        searchPointInPolygon(point.x, point.y);
      }
      draw(gl);
    }
    else {
      if (pointToPointDistance(startAt[0], startAt[1], data[type.POLYGON].coordinates[selectedObject.vertexSelectedId], data[type.POLYGON].coordinates[selectedObject.vertexSelectedId+1]) > 5){
        unselectPolygon();
        return;
      }

      data[type.POLYGON].coordinates[selectedObject.vertexSelectedId] = point.x;
      data[type.POLYGON].coordinates[selectedObject.vertexSelectedId+1] = point.y;
      
      // update original coordinates
      selectedObject.original_coordinates = data[type.POLYGON].coordinates.slice(selectedObject.offset,selectedObject.offset+selectedObject.vertexAmount*2)

      changePolygonColor(data[type.POLYGON].coordinates[selectedObject.vertexSelectedId], data[type.POLYGON].coordinates[selectedObject.vertexAmount]);
      // gambar ulang polyhon pada koordinat baru
      draw(gl); 
    }
  }

  function drawPolygon(gl) {
    var n_polygon = 1;
    var coordinates = data[type.POLYGON].coordinates;
    var colors = data[type.POLYGON].colors;
    for (var i = 0; i < coordinates.length; i++) {
      if ((i != coordinates.length - 1) && (coordinates[i] == ".")) {
        n_polygon += 1;
        // console.log("Banyak poligon");
        // console.log(n_polygon);
      }
    }
    var start = 0;
    for (var j = 0; j < n_polygon; j++) {
      console.log("Draw ke");
      console.log(j+1);
      var coorDraw = [];
      var colorDraw = [];
      for (var i = start; i < coordinates.length; i++) {
        if (coordinates[i] != ".") {
          coorDraw.push(coordinates[i]);
          if (start % 2 == 0) {
            if (i % 2 == 0) {
              for (var k = 0; k < 4; k++){
                colorDraw.push(colors[i*2+k])
              }
            }
          }
          else {
            if (i % 2 == 1) {
              for (var k = 0; k < 4; k++){
                colorDraw.push(colors[(i)*2+k])
              }
            }
          }
        }
        else if (coordinates[i] == '.') {
          start = i + 1;
          break;
        }
      }
      drawPoly(coorDraw, colorDraw, gl);
    }
  }

  function drawPoly(coorDraw, colorDraw, gl) {
    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    
    // Create a buffer for the positions.
    var positionBufferPoly = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferPoly);
    // Set Geometry.
    // console.log("Coordinate Draw");
    // console.log(coorDraw);
    setGeometry(gl, coorDraw);

    // Create a buffer for the colors.
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Set the colors.
    console.log("Color Draw");
    console.log(colorDraw);
    setColors(gl, colorDraw);

    var translation = [0, 0];
    var angleInRadians = 0;
    var scale = [1, 1];

    drawScene();

  // Draw the scene.
    function drawScene() {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas.
      // gl.clear(gl.COLOR_BUFFER_BIT);

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the position attribute
      gl.enableVertexAttribArray(positionLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferPoly);

      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionLocation, size, type, normalize, stride, offset);

      // Turn on the color attribute
      gl.enableVertexAttribArray(colorLocation);

      // Bind the color buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

      // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      var size = 4;          // 4 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          colorLocation, size, type, normalize, stride, offset);

      // Compute the matrix
      var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
      matrix = m3.translate(matrix, translation[0], translation[1]);
      matrix = m3.rotate(matrix, angleInRadians);
      matrix = m3.scale(matrix, scale[0], scale[1]);

      // Set the matrix.
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      // Draw the geometry.
      var primitiveType = gl.TRIANGLE_FAN;
      var offset = 0;
      var count = (coorDraw.length) / 2;
      // console.log("Banyak");
      // console.log(count);
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  // Event listener
  canvas.addEventListener('mousedown', function(e) {
      if (document.getElementById("rectangle").checked == true) {  
          startDrawingRectangle(e);
      } 
      else if (document.getElementById("line").checked == true) { 
          startDrawingLine(e); 
      }
      else if (document.getElementById("polygon").checked == true) {
          startDrawingPolygon(e);
      }
  });

  canvas.addEventListener('mousemove', function(e) {
    if (document.getElementById("rectangle").checked == true && !moveCoordinates) {
      if (click) {
        pos1 = pointer(e);

        if (data[type.RECTANGLE].coordinates.length % 12 != 2) {
              for (var ii = 0; ii < 10; ii++) {
                data[type.RECTANGLE].coordinates.pop();
              }
        }

        if (e.ctrlKey) {
            var h = Math.abs(pos0.y - pos1.y);
            var w = Math.abs(pos0.x - pos1.x);

            var max_param = Math.max(h,w);

            if (pos1.x >= pos0.x && pos1.y >= pos0.y) {
                pos1.x = pos0.x + max_param;
                pos1.y = pos0.y + max_param;
            } else if (pos1.x >= pos0.x && pos1.y < pos0.y) {
                pos1.x = pos0.x + max_param;
                pos1.y = pos0.y - max_param;
            } else if (pos1.x < pos0.x && pos1.y < pos0.y) {
                pos1.x = pos0.x - max_param;
                pos1.y = pos0.y - max_param;
            } else {
                pos1.x = pos0.x - max_param;
                pos1.y = pos0.y + max_param;
            }
        } 

        data[type.RECTANGLE].coordinates.push(pos1.x);
        data[type.RECTANGLE].coordinates.push(pos0.y);
        
        data[type.RECTANGLE].coordinates.push(pos0.x);
        data[type.RECTANGLE].coordinates.push(pos1.y);

        data[type.RECTANGLE].coordinates.push(pos0.x);
        data[type.RECTANGLE].coordinates.push(pos1.y);

        data[type.RECTANGLE].coordinates.push(pos1.x);
        data[type.RECTANGLE].coordinates.push(pos0.y);

        data[type.RECTANGLE].coordinates.push(pos1.x);
        data[type.RECTANGLE].coordinates.push(pos1.y);

        draw(gl);
      }
    }
  });

  canvas.addEventListener('mouseup', function(e) {
    if (document.getElementById("rectangle").checked == true) {
      stopDrawingRectangle(e);
    } else if (document.getElementById("line").checked == true) {
      stopDrawingLine(e);
    } else if (document.getElementById("polygon").checked == true) {
      stopDrawingPolygon(e);
    }
  });
  
  // add lineLenghtSlider event handler
  var lineLengthSlider = document.querySelector("#lineLengthSlider");
  lineLengthSlider.addEventListener("change", function (e){
      if (selectedObject.objectType == type.LINE){
        let start_center = {
          x : (selectedObject.original_coordinates[0]+selectedObject.original_coordinates[2])/2,
          y : (selectedObject.original_coordinates[1]+selectedObject.original_coordinates[3])/2
        }
        let end_center = {
          x : (selectedObject.original_coordinates[0]*lineLengthSlider.value + selectedObject.original_coordinates[2]*lineLengthSlider.value)/2,
          y : (selectedObject.original_coordinates[1]*lineLengthSlider.value + selectedObject.original_coordinates[3]*lineLengthSlider.value)/2
        }
        let translate = [end_center.x-start_center.x,end_center.y-start_center.y]
    
        for (let i = 0; i < 4; i++){
          data[type.LINE].coordinates[selectedObject.offset+i] = selectedObject.original_coordinates[i] * lineLengthSlider.value
          if (i%2 == 0){
            data[type.LINE].coordinates[selectedObject.offset+i] -= translate[0];
          } else{
            data[type.LINE].coordinates[selectedObject.offset+i] -= translate[1];
          }
        }
        draw(gl)
      }
  })

  var saveBtn = document.getElementById("save");
  saveBtn.addEventListener('click', () => {
    export_data(file_name,data);
  })

  function draw(gl){
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawLine(gl);
    drawRect(gl);
    drawPolygon(gl);
  }
  
  function drawLine(gl) {
    // setup GLSL program
    // var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
    
    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer for positions.
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
    // Set Geometry.
    // console.log("line coordinate : ", data[type.LINE].coordinates)
    // console.log("line colors : ", data[type.LINE].colors)

    setGeometry(gl, data[type.LINE].coordinates);

    // Create a buffer for the colors.
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl, data[type.LINE].colors);
  
    var translation = [0, 0];
    var angleInRadians = 0;
    var scale = [1,1];

    // drawScene(data[type.LINE]);
    drawScene(data[type.LINE]);

    function drawScene(data) {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);
  
      // Turn on the attribute
      gl.enableVertexAttribArray(positionAttributeLocation);
  
      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionAttributeLocation, size, type, normalize, stride, offset);
  
      // Turn on the color attribute
      gl.enableVertexAttribArray(colorLocation);
  
      // Bind the color buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  
      // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      var size = 4;          // 4 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          colorLocation, size, type, normalize, stride, offset);
  
      // Compute the matrix
      var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
      matrix = m3.translate(matrix, translation[0], translation[1]);
      matrix = m3.rotate(matrix, angleInRadians);
      matrix = m3.scale(matrix, scale[0], scale[1]);
  
      // Set the matrix.
      gl.uniformMatrix3fv(matrixLocation, false, matrix);
  
      // Draw the geometry.
      var primitiveType = gl.LINES;
      var offset = 0;
      var count = (data.coordinates.length)/2;
      gl.drawArrays(primitiveType, offset, count);
    }
  }  
  
  // Fill the buffer with the values that define a triangle.
  // Note, will put the values in whatever buffer is currently
  // bound to the ARRAY_BUFFER bind point
  function setGeometry(gl, coordinates) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(coordinates),
        gl.STATIC_DRAW);
  }
  
  function setColors(gl, colorArray){
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
          colorArray),
        gl.STATIC_DRAW);
  }  

  function selectLine(selectedLineId){
    moveCoordinates = true
    lineLengthSlider.value = 1;
    // set red the selected line
    selectedObject.objectType = type.LINE;
    selectedObject.offset  = selectedLineId;
    // save original color and coordinates
    selectedObject.original_color = data[type.LINE].colors.slice(selectedLineId*2,selectedLineId*2+8)
    selectedObject.original_coordinates = data[type.LINE].coordinates.slice(selectedLineId,selectedLineId+4)
    for (let i = selectedLineId*2;i < selectedLineId*2+8;i+=4){
      // set selected line red
      data[type.LINE].colors[i]=r1
      data[type.LINE].colors[i+1]=g1
      data[type.LINE].colors[i+2] = b1
      data[type.LINE].colors[i+3]=1
    }
    draw(gl);
  }

  function unselectLine(){
    // unselect currently selected line
    
    if (selectedObject.objectType == type.LINE){
      // set the selected line to original color
      for (let i = selectedObject.offset*2;i < selectedObject.offset*2+8;i+=4){
        data[type.LINE].colors[i]= selectedObject.original_color[0]
        data[type.LINE].colors[i+1]= selectedObject.original_color[1]
        data[type.LINE].colors[i+2] = selectedObject.original_color[2]
        data[type.LINE].colors[i+3]= selectedObject.original_color[3]
      }        
      selectedObject = {objectType: type.NULL};
      moveCoordinates = false;
    }
    draw(gl);
  }

  function selectRectangle(selectedRectId, selectedVertexId){
    moveCoordinates = true;
    // set red the selected rectangle
    selectedObject.objectType = type.RECTANGLE;
    selectedObject.offset  = selectedRectId;
    selectedObject.vertexId = selectedVertexId;

    // save original color and coordinates
    selectedObject.original_color = data[type.RECTANGLE].colors.slice(selectedRectId*24,selectedRectId*24+24)
    selectedObject.original_coordinates = data[type.RECTANGLE].coordinates.slice(selectedRectId*12,selectedRectId*12+12)
    
    for (let i = selectedRectId*24;i < selectedRectId*24+24;i+=4){
      // set selected line red
      data[type.RECTANGLE].colors[i] = r1
      data[type.RECTANGLE].colors[i+1] = g1
      data[type.RECTANGLE].colors[i+2] = b1
      data[type.RECTANGLE].colors[i+3] = 1
    }
    
    draw(gl);
  }

  function unselectRectangle(){
    if (selectedObject.objectType == type.RECTANGLE){
      // set the selected line to original color
      for (let i = selectedObject.offset * 24; i < selectedObject.offset*24+24;i+=4){
        data[type.RECTANGLE].colors[i]= selectedObject.original_color[0]
        data[type.RECTANGLE].colors[i+1]= selectedObject.original_color[1]
        data[type.RECTANGLE].colors[i+2] = selectedObject.original_color[2]
        data[type.RECTANGLE].colors[i+3]= selectedObject.original_color[3]
      }

      selectedObject = {objectType: type.NULL};
      moveCoordinates = false;
      draw(gl); 
    }
  }

  function selectPolygon(selectedPolygonOffsetId,selectedPolygonVertexId, n_vertexPolygonId){
    console.log("Select Polygon");
    console.log(selectedPolygonOffsetId);
    console.log(n_vertexPolygonId);
    moveCoordinates = true;
    // set red the selected line
    selectedObject.objectType = type.POLYGON;
    selectedObject.offset  = selectedPolygonOffsetId;
    selectedObject.vertexSelectedId = selectedPolygonVertexId;
    selectedObject.vertexAmount = n_vertexPolygonId;
    // save original color and coordinates
    selectedObject.original_color = data[type.POLYGON].colors.slice(selectedPolygonOffsetId * 2, selectedPolygonOffsetId * 2 + n_vertexPolygonId * 4);
    selectedObject.original_coordinates = data[type.POLYGON].coordinates.slice(selectedPolygonOffsetId, selectedPolygonOffsetId + n_vertexPolygonId * 2);
    
    // console.log("POLY", selectedObject.offset); 
    // console.log("POLY", selectedObject.vertexAmount);       
    // console.log("POLY-COLOR", data[type.POLYGON].colors);
    // console.log("POLY-COORD", data[type.POLYGON].coordinates);

    for (let i = selectedPolygonOffsetId * 2; i < selectedPolygonOffsetId * 2 + n_vertexPolygonId * 4; i += 4){
      // set selected line red
      data[type.POLYGON].colors[i] = r1
      data[type.POLYGON].colors[i+1] = g1
      data[type.POLYGON].colors[i+2] = b1
      data[type.POLYGON].colors[i+3] = 1
    }
    console.log("POLY-COLOR'''", data[type.POLYGON].colors);

    draw(gl);
  }

  function unselectPolygon(){
    // unselect currently selected POLYGON
    if (selectedObject.objectType == type.POLYGON){
      // set the selected line to original color
      for (let i = selectedObject.offset * 2; i < selectedObject.offset *2 + selectedObject.vertexAmount * 4; i += 4){
        data[type.POLYGON].colors[i] = document.getElementById("R").value / 255;
        data[type.POLYGON].colors[i+1] = document.getElementById("G").value / 255;
        data[type.POLYGON].colors[i+2] = document.getElementById("B").value / 255;
        data[type.POLYGON].colors[i+3] = 1;
      }        
      selectedObject = {objectType: type.NULL};
      moveCoordinates = false;
      draw(gl); 
    }
  }

  function pointToPointDistance(x1,y1,x2,y2){
    // mengembalikan jarak antara titik (x1,y1) ke titik (x2,y2)
    return Math.sqrt((x1 - x2)*(x1 - x2) + (y1-y2)*(y1-y2))
  }

  function pointToLineDistance(x, y, x1, y1, x2, y2) {
    // mengembalikan jarak antara titik (x,y) ke garis (x1, y1, x2, y2)
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
  
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    var xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function drawRect(gl) {
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer for positions.
    var positionBuffer_Rect = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_Rect);
    setRectangle(gl, data[type.RECTANGLE].coordinates);
    // setRectangle(gl, rectangle_Coor);

    // Create a buffer for the colors.
    var colorBuffer_Rect = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_Rect);
    setColor(gl, data[type.RECTANGLE].colors);
    // setColor(gl, rectangle_Color);

    drawScene(data[type.RECTANGLE]);

    function setRectangle(gl, rectangle_Coor) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangle_Coor), gl.STATIC_DRAW);
    }

    function setColor(gl, rectangle_Color) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangle_Color), gl.STATIC_DRAW);
    }  

    function drawScene(data) {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas.
      // gl.clear(gl.COLOR_BUFFER_BIT);

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the attribute
      gl.enableVertexAttribArray(positionLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_Rect);

      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionLocation, size, type, normalize, stride, offset);

      // Turn on the color attribute
      gl.enableVertexAttribArray(colorLocation);
  
      // Bind the color buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_Rect);
  
      // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      var size = 4;          // 4 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          colorLocation, size, type, normalize, stride, offset);

      var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      // Draw the rectangle.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = (data.coordinates.length) / 2;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  function pointer(event) {
    var rect = canvas.getBoundingClientRect();
    return { x : event.clientX - rect.left, y : event.clientY - rect.top };
  };

  function searchPointInRect(x1, y1){
    for (var i = 0; i < (data[type.RECTANGLE].coordinates.length)-1; i+=2){
      if (pointToPointDistance(x1,y1,data[type.RECTANGLE].coordinates[i],data[type.RECTANGLE].coordinates[i+1]) < 10) {
          var N = i;

          for (var I = 0; I < 12; I++) {
              var count = N + (N + I) % 12 - (N % 12);
              rectCoordinates.push(data[type.RECTANGLE].coordinates[count]);
              rectIndex.push(count);
          }
          
          selectRectangle(Math.floor(i / 12), i);

          return true
      }
    }
    return false
  }

  function searchPointInPolygon(x,y){
    for (var i = 0; i < (data[type.POLYGON].coordinates.length-1); i++) {
      if (pointToPointDistance(x, y, data[type.POLYGON].coordinates[i], data[type.POLYGON].coordinates[i+1]) < 5) { 
          selectPolygon(findPolygonId(data[type.POLYGON].coordinates[i], data[type.POLYGON].coordinates[i+1]), findPolygonVertexId(data[type.POLYGON].coordinates[i], data[type.POLYGON].coordinates[i+1]), countPolygonVertex(data[type.POLYGON].coordinates[i], data[type.POLYGON].coordinates[i+1]));
          return;
      }
    }
    return;
  }

  function findPolygonVertexId(x, y) {
    for (var i = 0; i < (data[type.POLYGON].coordinates.length-1); i++){
      if ((data[type.POLYGON].coordinates[i] == x) && (data[type.POLYGON].coordinates[i+1] == y)) {
        return i;
      }
    }
  }
  
  function findPolygonId(x, y) {
    for (var i = 0; i < (data[type.POLYGON].coordinates.length-1); i++){
      if ((data[type.POLYGON].coordinates[i] == x) && (data[type.POLYGON].coordinates[i+1] == y)) {
        for (var j = i; j > 0; j--) {
          if (data[type.POLYGON].coordinates[j] == ".") {
            return (j + 1);
          }
        }
      } 
    }
    
    return 0;
  }


  function countPolygonVertex(x, y) {
    for (var i = findPolygonId(x, y); i < (data[type.POLYGON].coordinates.length); i += 2) {
      if (data[type.POLYGON].coordinates[i] == '.') {
        return ((i - (findPolygonId(x, y))) / 2 );
      } 
    }
    return ((i - (findPolygonId(x, y)) + 1) / 2 );
  }

  // function changePolygonColor() {
  //   if (selectedObject.objectType == type.POLYGON){
  //     for (let i = selectedObject.offset * 2; i < selectedObject.offset *2 + selectedObject.vertexAmount * 4; i += 4){
  //       data[type.POLYGON].colors[i]= selectedObject.original_color[0]
  //       data[type.POLYGON].colors[i+1]= selectedObject.original_color[1]
  //       data[type.POLYGON].colors[i+2] = selectedObject.original_color[2]
  //       data[type.POLYGON].colors[i+3]= selectedObject.original_color[3]
  //     } 
  //   for (let i = selectedPolygonOffsetId * 2; i < selectedPolygonOffsetId * 2 + n_vertexPolygonId * 4; i += 4){
  //     data[type.POLYGON].colors[i] = document.getElementById("R").value / 255;
  //     data[type.POLYGON].colors[i+1] = document.getElementById("G").value / 255;
  //     data[type.POLYGON].colors[i+2] = document.getElementById("B").value / 255;
  //     data[type.POLYGON].colors[i+3] = 1;
  //   }
  // }
})

var type = {
  NULL : -1,
  LINE : 0,
  RECTANGLE : 1,
  POLYGON : 2
}

function import_data(file_name){
  let file_path = "http://localhost:3000/data/" + file_name
  var rawFile = new XMLHttpRequest();
  var data = {}
  rawFile.open("GET", file_path, false);
  rawFile.onreadystatechange = function ()
  {
      if(rawFile.readyState === 4)
      {
          if(rawFile.status === 200 || rawFile.status == 0)
          {
              var allText = rawFile.responseText;
              var lines = allText.split("\n"); 

              var reading = {is_reading: false, type: type.NULL, coordinates:[], colors:[]}
              for(let i = 0; i < lines.length; i++){
                  if (lines[i] == "line"){
                      reading.is_reading = true
                      reading.type = type.LINE
                  } else if (lines[i] == "rectangle"){
                      reading.is_reading = true
                      reading.type = type.RECTANGLE
                  } else if (lines[i] == "polygon"){
                      reading.is_reading = true
                      reading.type = type.POLYGON
                  } else if (reading.is_reading && reading.type != type.NULL){
                      let line = lines[i].trim().split(":")

                      if (line[0] == "coordinates"){
                          reading.coordinates = line[1].trim().split(',').map(function(item) {return (item=='.'? '.':parseFloat(item))})
                      } else if (line[0] == "colors"){
                          reading.colors = line[1].trim().split(',').map(function(item) {return (item=='.'? '.':parseFloat(item))})
                      } else{
                          continue;
                      }

                      if (reading.coordinates.length != 0 && reading.colors.length != 0){
                          data[reading.type] = {coordinates : reading.coordinates, colors : reading.colors}
                          reading = {is_reading: false, type:type.NULL, coordinates:[], colors:[]}
                      }
                  }
              }

              for (let i = type.LINE; i <= type.POLYGON; i++){
                if (!(data.hasOwnProperty(i)) ){
                  data[i] =  {coordinates : [], colors : []}
                }
              }
          }
      }
  }
  rawFile.send(null);

  return data;
}

function export_data(file_name, data){
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:3000/export", true)
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");


  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
       console.log(xhr.responseText);
    }};

  let output = '';
  if (data[type.LINE].coordinates.length != 0){
    output += "line\n"
    output += "coordinates: " + data[type.LINE].coordinates.join() + "\n";
    output += "colors: " + data[type.LINE].colors.join() + "\n";  
  }
  if (data[type.RECTANGLE].coordinates.length != 0){
    output += "rectangle\n"
    output += "coordinates: " + data[type.RECTANGLE].coordinates.join() + "\n";
    output += "colors: " + data[type.RECTANGLE].colors.join() + "\n";  
  }
  if (data[type.POLYGON].coordinates.length != 0){
    output += "polygon\n"
    output += "coordinates: " + data[type.POLYGON].coordinates.join() + "\n";
    output += "colors: " + data[type.POLYGON].colors.join() + "\n";  
  }

  let body = {
    file_name: file_name,
    data: output
  }

  console.log(JSON.stringify(body));
  
  xhr.send(JSON.stringify(body))
}

var m3 = {
  projection: function(width, height) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },

  translate: function(m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty));
  },

  rotate: function(m, angleInRadians) {
    return m3.multiply(m, m3.rotation(angleInRadians));
  },

  scale: function(m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },
};
