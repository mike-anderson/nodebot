exports.init = function (control) {
  var appServerAddress = process.env.SERVERADDR ? process.env.SERVERADDR : "http://192.241.224.21"
	var socket = require('socket.io-client')(appServerAddress);

  console.log('connecting to ' + appServerAddress);

	socket.on('connect', function(){
		control.queueUpCommand(0,'marker',['down']);
		control.queueUpCommand(1,'marker',['up']);
    socket.emit('IAMAROBOT');
	});
	socket.on('command', function(cmd){
		control.queueUpCommand(cmd.id, cmd.command, cmd.args);	
	});
	socket.on('disconnect', function(){
		control.queueUpCommand(1,'marker',['up']);
	});
	control.on('finishedCommand', function (id) {
		socket.emit('finishedCommand', id);
	})
};