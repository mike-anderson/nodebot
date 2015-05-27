var socket = io();
var canvas, ctx;
var points = [[50,65]];

 /*
 * Calculates the angle ABC (in radians) 
 *
 * A first point
 * C second point
 * B center point
 */
function find_angle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

/**
 * return a normalized cooridnate system regardless of view size
 * @param  {Number[]} position
 * @return {Object} coordinates
 */
function getCoordinate(position) {
  return [
    position[0]/canvas.width()*100,
    position[1]/canvas.height()*130
  ]
}

function getPosition(coordinate) {
  return [
    coordinate[0]/100*canvas.width(),
    coordinate[1]/130*canvas.height()
  ] 
}

function drawLine(start, finish) {
  var startPos = getPosition(start);
  var finishPos = getPosition(finish);
  console.log(startPos,finishPos);
  ctx.beginPath();
  ctx.moveTo(startPos[0],startPos[1]);
  ctx.lineTo(finishPos[0],finishPos[1]);
  ctx.stroke();
  ctx.closePath();  
}

function onMouseDown(event) {
  console.log(event);
  var coordinate = getCoordinate([event.clientX, event.clientY-40]);
  points.push(coordinate);
  var line = points.slice(-2);
  drawLine(line[0],line[1]);
  socket.emit('point',coordinate);
}

function onPoint(point) {
  points.push(point);
  var line = points.slice(-2);
  drawLine(line[0],line[1]);
}

//init
$(function() {
  canvas = $('#drawingCanvas');

  if (canvas) {
    canvas.height(canvas.width()*1.3);
    if (canvas.get(0).getContext) {
      ctx = canvas.get(0).getContext("2d");
      if (ctx) {
        ctx.canvas.width = canvas.width();
        ctx.canvas.height = canvas.height();
        ctx.lineWidth = 2;
        ctx.lineCap="round";
        ctx.lineJoin="round";
        ctx.strokeStyle = "#2980b9";
        canvas.on("mousedown", onMouseDown);
        socket.on("point", onPoint);
      }
    } 
  }
});