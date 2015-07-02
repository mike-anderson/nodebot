var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var points = [];
var commands = [];
var doodlebot;

 /*
 * Calculates the angle ABC (in radians) 
 *
 * A first point
 * C second point
 * B center point
 */
function findAngle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B[0]-A[0],2)+ Math.pow(B[1]-A[1],2));    
    var BC = Math.sqrt(Math.pow(B[0]-C[0],2)+ Math.pow(B[1]-C[1],2)); 
    var AC = Math.sqrt(Math.pow(C[0]-A[0],2)+ Math.pow(C[1]-A[1],2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

/**
 * Calculates Euclidian distance
 */
function findDistance(A,B) {
  return Math.sqrt( Math.pow((A[0]-B[0]), 2) + Math.pow((A[1]-B[1]), 2) );
}

function generatePathCommands(id, points) {
  if (points.length === 3) {
    var angle = findAngle(points[0],points[1],points[2]);
    angle = angle / 3.1415 * 360; //degrees!
    angle = angle - 180; //bearing!
    if (angle > 2) {
      doodlebot.emit('command',{
        id: id,
        command: 'turn',
        args: [angle]
      });
    }
    var distance = findDistance(points[1],points[2]);
    if (distance > 0.05) {
      doodlebot.emit('command',{
        id: id,
        command: 'go',
        args:['fwd',distance*50]
      });
    }
  }
}

app.use('/static', express.static(__dirname + '/server/static'));
app.get('/', function(req, res){
  res.sendFile( __dirname + '/server/webClient.html');
});

app.set('port', process.env.PORT || 3000);
http.listen(app.get('port'), function(){
  console.log('listening on *:',app.get('port'));
});

io.on('connection', function (socket) {
  console.log('connected');

  for (var i = 0; i < commands.length; i++) {
    socket.emit('command', commands[i]);
  }

  socket.on('IAMAROBOT', function () {
    doodlebot = socket;
    socket.emit('command',{
      id: 'server',
      command: 'marker',
      args: ['down']
    });
    socket.emit('command',{
      id: 'server',
      command: 'go',
      args: ['fwd',250]
    });

    socket.broadcast.emit('IAMAROBOT',{});
    socket.on('disconnect', function () {
      socket.broadcast.emit('ROBOTOFFLINE',{});
    });

    socket.on('finishedCommand', function (id) {
        for (var i = 0; i < commands.length; i++) {
          if (commands[i].id === id) {
            commands = commands.splice(i, 1);
            break;
          }
        }
        socket.broadcast.emit('complete',id);
    })

  });

  socket.on('command', function(cmd){
    console.log('command: ', cmd);
    commands.push(cmd);
    io.sockets.emit('command', cmd);
  });

  socket.on('point', function(point) {
    console.log('point: ', point);
    points.push(point);
    socket.broadcast.emit('point', point);
    if (doodlebot) {
      generatePathCommands(socket.id, points.slice(-3));
    }
  });
});