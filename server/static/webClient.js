var socket = io();
var clientName = 'DoodleBotCommander';
var commandCardTemplate = null;

//init
$(function() {

  //set up templates
  commandCardTemplate = Handlebars.compile($('#command_card').html());

  //set up UI Listeners
  $('#command_name').change(onCommandChanged);
  $('#command_submit').click(onCommandSubmit);

  //set up socket listeners
  socket.on('command',onCommandMessageRecieved);
  socket.on('complete',onCommandMessageCompletionRecieved);
  socket.on('IAMAROBOT',onNodebotOnline);
  socket.on('ROBOTOFFLINE',onNodebotOffline);

  //get going
  createAskNameModal();
});

function onNodebotOnline () {
  $('#nodebot_status').text('DOODLEBOT is ONLINE');
};

function onNodebotOffline () {
  $('#nodebot_status').text('DOODLEBOT is OFFLINE');
}

function createAskNameModal () {
     $('#screen-name-form').keyup(function (e) {
    var text = $(this).val();
    if (text && text !== '') {
      $('#screen-name-form-submit').removeClass('disabled');
    } else {
      $('#screen-name-form-submit').addClass('disabled');
    }
   });
   $('#modal1').openModal({
      dismissible: false, // Modal can be dismissed by clicking outside of the modal
      complete: function() {
        var name = $('#screen-name-form').val();
        if (name && name !== '') { 
          clientName = name;
        } else {
          console.log('oh no!');
        }
      }
    });  
}

function onCommandMessageRecieved (message) {
  var commandText;
  var id = message.id;
  if (message.command === 'marker') {
    commandText = 'PEN ' + message.args[0].toUpperCase();
  }
  else if (message.command === 'go') {
    commandText = 'GO ' + message.args[0].toUpperCase() + ' ' + message.args[1].toString();
  }
  else if (message.command === 'turn') {
    var arg = message.args[0] > 0 ? 'CW' : 'CCW';
    var degrees = message.args[0] > 0 ? message.args[0].toString() : (0-message.args[0]).toString();
    commandText = 'TURN ' + arg + ' ' + degrees;
  }
  $('#command_window').append(commandCardTemplate({command:commandText,id:id}));
}

function onCommandMessageCompletionRecieved (id) {
  var commandCard = $('#'+id);
  if (commandCard.length > 0) {
    commandCard.remove();
  }
}

function onCommandSubmit () {
  var commandName = $('#command_name').val();
  var message = {
    id: guid()
  };

  switch (commandName) {
    case 'GO':
      if ($('#command_value').val() === '') {
        alert('you need to specify a time for doodlebot to go for');
        return;
      }
      message.command = 'go';
      message.args = [
        $('#command_arg').val().toLowerCase(),
        parseInt($('#command_value').val())
      ];
      break;
    case 'TURN':
      if ($('#command_value').val() === '') {
        alert('you need to specify a number of degrees for doodlebot to turn');
        return;
      }  
      message.command = 'turn';
      message.args = [
        parseInt($('#command_value').val())  
      ]
      if ($('#command_arg').val() === 'CCW') {
        message.args[0] = 0 - message.args[0];
      }
      break;
    case 'PEN':
      message.command = 'marker';
      message.args = [
        $('#command_arg').val().toLowerCase()
      ];
      break;
  }
  $('#command_value').val('');
  $('#command_name').val('GO').change();
  socket.emit('command',message);
}

function onCommandChanged () {
  var command = $('#command_name').val();
  if (command === 'GO') {
    $('#command_arg_opt_1').val('FWD').text('FWD');
    $('#command_arg_opt_2').val('REV').text('REV');
    $('#command_value').attr('placeholder','for how long (in ms)?');
    $('#command_value').removeClass('hidden');
  } else if (command === 'TURN') {
    $('#command_arg_opt_1').val('CW').text('CW');
    $('#command_arg_opt_2').val('CCW').text('CCW');
     $('#command_value').attr('placeholder','for how many degrees?');
    $('#command_value').removeClass('hidden');
  } else if (command === 'PEN') {
    $('#command_arg_opt_1').val('UP').text('UP');
    $('#command_arg_opt_2').val('DOWN').text('DOWN');
    $('#command_value').addClass('hidden');
  }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}