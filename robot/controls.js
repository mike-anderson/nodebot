var five = require("johnny-five");
var Emitter = require("events").EventEmitter;
var controller = new Emitter();
var board;

controller.ready = false;
controller.acting = false;
controller.commandQueue = [];
controller.commands = {};

controller.queueUpCommand = function (id, command, args) {
  var commandFunction = controller.commands[command];
  if (!commandFunction) {
    console.log('received bad command', {
      id: id,
      command: command,
      args: args
    });
    return false;
  }
  controller.commandQueue.push({
    id: id,
    name: command,
    args: args
  });
  if (!controller.acting) {
    controller.processNextCommand();
  }
};

controller.processNextCommand = function () {
  //console.log('processNextCommand',controller.commandQueue);
  var command = controller.commandQueue.shift();
  if (command) {
    console.log('processing command:', command);
    controller.acting = true;
    var doAction = controller.commands[command.name].apply(this, command.args);
    doAction.then(function () {
      controller.acting = false;
      controller.emit('finishedCommand', command.id);
    });
  }
};
controller.on('finishedCommand', controller.processNextCommand);

controller.init = function () {
  var board = new five.Board();
  controller.board = board;

  board.on("ready", function() {
    console.log("Ready event. Repl instance auto-initialized!");

    var magicNumbers = {
      motorRightJog: 55, //ms that the right wheel should wait every 1/5 rotation
      angleTimeMultiplier: 3.65,
      markerServoAngleUp: 40,
      markerServoAngleDown: 90
    }

    var led = new five.Led(13);
    var markerServo = new five.Servo({
      pin: 12,
      startAt: 40
    });
    var motorLeft = new five.Motor([9,7]);
    var motorRight = new five.Motor([10,8]);
    var encoderLeft = new five.Button(3); //currently broken
    var encoderRight = new five.Button(2);

    var isDrawing = false;
    var currentDirection = null;

    /*
     * this robot is a bit left tilting, so we are gonna jog it every
     * now and then to keep it going straight
     */
    encoderRight.on("press", function() {
      if (currentDirection === 'fwd' || currentDirection === 'rev') {
        motorRight.stop();
        setTimeout(function () {
          if (currentDirection === 'fwd') {
            motorRight.fwd(255);
          } else if (currentDirection === 'rev') {
            motorRight.rev(255);
          }
        },magicNumbers.motorRightJog);  
      }
    });

    /**
     * Go straight forward or back
     * Turns out this kit can't really do speed
     * 
     * @param  {String} dir - either 'fwd', or 'rev'
     * @param  {Number} time - the amount of time in ms to head in that direction
     * @return {Promise} when complete
     */
    var go = function (dir, time) {
      return new Promise( function (resolve) {
        motorLeft[dir](255);
        motorRight[dir](255);
        currentDirection = dir;
        setTimeout( function () {
          motorRight.stop();
          motorLeft.stop();
          currentDirection = null;
          resolve();
        },time); 
      }); 
    };
    controller.commands.go = go;

    /**
     * Clockwise rotation
     * @param  {Number} a number from -360 to 360 to rotate
     * @return {Promise} when complete
     */
    var turn = function (angle) {
      return new Promise( function (resolve) {
        if (angle > 0) {
          motorLeft.fwd(255);
          motorRight.rev(255);
          currentDirection = 'turnRight';
        } else {
          motorLeft.rev(255);
          motorRight.fwd(255);
          currentDirection = 'turnLeft';
        }
        var turnTime = Math.abs(angle) * magicNumbers.angleTimeMultiplier;
        console.log(turnTime);
        setTimeout( function () {
          motorRight.stop();
          motorLeft.stop();
          currentDirection = null;
          resolve();
        },turnTime);
      });
    };
    controller.commands.turn = turn;

    /**
     * put the marker 'up' or 'down'
     * @param  {String} state - of marker ('up', or 'down')
     * @return {Promise} when complete
     */
    var marker = function(state) {
      return new Promise( function (resolve) {
        if (state === 'down') {
          markerServo.to(magicNumbers.markerServoAngleDown);
        } else {
          markerServo.to(magicNumbers.markerServoAngleUp);
        }
        setTimeout( function () {
          markerState = state;
          resolve();
        },500);
      });
    };
    controller.commands.marker = marker;

    this.repl.inject({
      go: go,
      turn: turn,
      marker: marker,
      markerServo: markerServo,
      motorLeft: motorLeft,
      motorRight: motorRight,
      encoderLeft: encoderLeft,
      encoderRight: encoderRight
    });

    controller.ready = true;
    controller.emit('ready');

  });
};

module.exports = controller;