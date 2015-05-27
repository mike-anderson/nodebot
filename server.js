var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//app.use(express.static(__dirname + '/server/static'));
app.get('/', function(req, res){
  res.sendFile( __dirname + '/server/webClient.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function () {
	console.log('connected');
});