var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var cw = canvas.width;
var ch = canvas.height;

function pointer(event) {
    var rect = canvas.getBoundingClientRect();
    return { x : event.clientX - rect.left, y : event.clientY - rect.top};
}

var coordinates = []
var isStart = false
var isDone = true

const start = document.getElementById("Start");
start.addEventListener("click", startDraw);

function startDraw() {
    if (isDone) {
        isStart = true;
        isDone = false;
    }
    console.log(isStart);
}

const done = document.getElementById("Done");
done.addEventListener("click", doneDraw);

function doneDraw() {
    isDone = true;
    isStart = false;
    coordinates.push('.');
    console.log(isDone);
}

canvas.addEventListener('mousedown', function(e) {
    if (isStart) {
        coordinates.push(pointer(e));
        drawPolygon();
    }
    document.getElementById("text").innerHTML = coordinates;
})

function drawPolygon() {
    context.clearRect(0,0,cw,ch);
    var newPolygon = true;
    for (i = 0; i < coordinates.length; i++) {
        console.log(newPolygon);
        if (coordinates[i].length == 1) {
            console.log("titik");
            context.closePath();
            context.stroke();
            newPolygon = true;
        }
        else {
            if (newPolygon) {
                console.log("poligon baru");
                context.beginPath();
                context.moveTo(coordinates[i].x, coordinates[i].y);
                newPolygon = false;
            }
            else {
                console.log("ngegaris")
                context.lineTo(coordinates[i].x, coordinates[i].y);
            }
        }
        console.log(coordinates[i]);
    }
    context.closePath();
    context.stroke();
}