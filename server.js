var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

points = [];

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

  for (var i = 0; i < points.length; i++) {
    socket.emit('point', points[i]);
  }

  socket.on('command', function(cmd){
    console.log('command: ', cmd);
    socket.broadcast.emit('command', cmd);
  });

  socket.on('point', function(point) {
    console.log('point: ', point);
    points.push(point);
    socket.broadcast.emit('point', point);
  })
});