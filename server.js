var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//app.use(express.static(__dirname + '/server/static'));
app.get('/', function(req, res){
  res.sendFile( __dirname + '/server/webClient.html');
});

app.set('port', process.env.PORT || 3000);
http.listen(function(){
  console.log('listening on *:',app.get('port'));
});

io.on('connection', function () {
	console.log('connected');
});