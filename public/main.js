"use strict";


window.addEventListener("load", () => {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#c");

  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  var drawingLine = false
  let selectedLineId = -1;
  let adjustingLineLength = false;
  let n_line = 0;
  var lineCoordinates = [];
  var startAt;
  var selectedLineColor = []

  var r1 = 1,g1 = 0,b1 = 0;

   
  var lineColorArray = [] 

  function startDrawingLine(e){
    var point = pointer(e);
    if (selectedLineId != -1){
      adjustingLineLength = true;
      startAt = [point.x,point.y]
    } else{
      drawingLine = true;
      lineCoordinates.push(point.x,point.y);  
    }
  }

  function stopDrawingLine(e){
    var point = pointer(e);
    // Penanganan jika hanya mengklik sekali / membuat sebuah point saja
    if (point.x == lineCoordinates[lineCoordinates.length-2] && point.y == lineCoordinates[lineCoordinates.length-1]){
      lineCoordinates.pop();
      lineCoordinates.pop();

      selectedLineId = lineCoordinates.findIndex(function (element, index, array){
        if (index % 4 == 0){
          // check x0 value
          if (pointToLineDistance(point.x,point.y,element,array[index+1],array[index+2],array[index+3]) < 10){
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

    if (adjustingLineLength){
      let distanceFromVertex1 = pointToPointDistance(startAt[0],startAt[1],lineCoordinates[selectedLineId],lineCoordinates[selectedLineId+1])
      let distanceFromVertex2 = pointToPointDistance(startAt[0],startAt[1],lineCoordinates[selectedLineId+2],lineCoordinates[selectedLineId+3])

      if (pointToLineDistance(startAt[0],startAt[1],lineCoordinates[selectedLineId],lineCoordinates[selectedLineId+1],lineCoordinates[selectedLineId+2],lineCoordinates[selectedLineId+3]) > 10){
        unselectLine();
        return;
      }

      if (distanceFromVertex1 < distanceFromVertex2){
        // geser titik awal garis
        lineCoordinates[selectedLineId] = point.x;
        lineCoordinates[selectedLineId+1] = point.y;  
      } else{
        // geser titik akhir garis
        lineCoordinates[selectedLineId+2] = point.x;
        lineCoordinates[selectedLineId+3] = point.y;  
      }

      // gambar ulang garis pada koordinat baru
      drawLine(gl, lineCoordinates, lineColorArray); 

    } else{
      n_line +=1
      lineCoordinates.push(point.x,point.y);
      lineColorArray.push(0,0,0,1,0,0,0,1);
      drawLine(gl, lineCoordinates, lineColorArray); 
      drawingLine = false; 
    }
  }

  // Event listener
  var pos0;
  var pos1;
  var color = [document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1];

  var click = false;

  canvas.addEventListener('mousedown', function(e) {
      if (document.getElementById("rectangle").checked == true) {  
          pos0 = pointer(e);
          click = true;
      } 
      else if (document.getElementById("line").checked == true) { 
        startDrawingLine(e); 
      }
      else {
          startDrawingLine(e);
      }
  });

  canvas.addEventListener('mousemove', function(e) {
    if (document.getElementById("rectangle").checked == true) {
      if (click) {
          pos1 = pointer(e);

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
              drawRect(gl);
          } else {
              drawRect(gl);
          }
      }
    }
  });

  canvas.addEventListener('mouseup', function(e) {
    if (document.getElementById("rectangle").checked == true) {
        click = false;
    } else if (document.getElementById("line").checked == true) 
      stopDrawingLine(e);
    else {
      stopDrawingLine(e);
    }
  });

  function updateColor() {
    color = [document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1];
  }

  function drawLine(gl,coordinates, colorArray) {
    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
    
    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getUniformLocation(program, "u_color");

    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");


    // Create a buffer for positions.
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
    // Set Geometry.
    setGeometry(gl, coordinates);

    // Create a buffer for the colors.
    // var colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // setColors(gl, color);
  
    var translation = [0, 0];
    var angleInRadians = 0;
    var scale = [1,1];
  
    drawScene();

    // Draw the scene.
    function updateColor() {
      color = [document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1];
    }

    function drawScene() {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
      // Clear the canvas.
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);
  
      // Turn on the attribute
      gl.enableVertexAttribArray(positionAttributeLocation);
  
      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      console.log(lineCoordinates)
      console.log(colorArray)  

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
      // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  
      // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      // var size = 4;          // 4 components per iteration
      // var type = gl.FLOAT;   // the data is 32bit floats
      // var normalize = false; // don't normalize the data
      // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      // var offset = 0;        // start at the beginning of the buffer
      // gl.vertexAttribPointer(
      //     colorLocation, size, type, normalize, stride, offset);

      // set the color
      updateColor();
      gl.uniform4fv(colorLocation, color);
      
  
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
      var count = n_line * 2;
      gl.drawArrays(primitiveType, offset, count);
    }
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
    // set red the selected line
    selectedLineColor = []
    for (let i = selectedLineId*2;i < selectedLineId*2+8;i+=4){
      selectedLineColor.push(lineColorArray[i]);selectedLineColor.push(lineColorArray[i+1]);
      selectedLineColor.push(lineColorArray[i+2]);
      lineColorArray[i]=r1
      lineColorArray[i+1]=g1
      lineColorArray[i+2] = b1
      lineColorArray[i+3]=1
    }
    drawLine(gl, lineCoordinates, lineColorArray); 
  }

  function unselectLine(){
    // unselect currently selected line
    
    if (selectedLineId != -1){
      // set black the selected line
      for (let i = selectedLineId*2;i < selectedLineId*2+8;i+=4){
        lineColorArray[i]=selectedLineColor[0]
        lineColorArray[i+1]=selectedLineColor[1]
        lineColorArray[i+2] = selectedLineColor[2]
        lineColorArray[i+3]=1
      }  
      selectedLineId = -1;
      selectedLineColor = []
      adjustingLineLength = false;
      drawLine(gl, lineCoordinates, lineColorArray); 
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
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");

    // lookup uniforms
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // setRectangle(gl, pos0.x, pos0.y, pos1.x, pos1.y);

    drawScene();

    function setRectangle(gl, x1, y1, x2, y2) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          x1, y1,
          x2, y1,
          x1, y2,
          x1, y2,
          x2, y1,
          x2, y2,
        ]), gl.STATIC_DRAW);
    }

    function updateColor() {
      color = [document.getElementById("R").value / 255, document.getElementById("G").value / 255, document.getElementById("B").value / 255, 1];
    }

    function drawScene() {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas.
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the attribute
      gl.enableVertexAttribArray(positionLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      setRectangle(gl, pos0.x, pos0.y, pos1.x, pos1.y);

      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionLocation, size, type, normalize, stride, offset);

      // set the color
      updateColor();
      gl.uniform4fv(colorLocation, color);
  
      var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      // Draw the rectangle.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  function pointer(event) {
    var rect = canvas.getBoundingClientRect();
    return { x : event.clientX - rect.left, y : event.clientY - rect.top};
  };

})