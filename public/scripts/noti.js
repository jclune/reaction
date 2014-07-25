(function ($) {

  if (typeof('io') === 'undefined') {
    return;
  }

  function reloadMessageAllCount(socket) {
    var cssName = '.message-all-count';
    if ($(cssName).length < 1) return;
    socket.emit('noti:count', {
      type: 'new_message'
    }, function (err, data) {
      console.log('MESSAGEs', err, data);
      if (err) return console.log("ERROR", err);
      if (data === 0 || data === '0') {
        $(cssName).text(data).hide();
      } else {
        $(cssName).text(data).show();
      }
    });
  }

  function reloadAllRoomsMessageCount(socket) {
  }

  function reloadRoomMessageCount(socket, roomId) {
    var cssName = '.message-' + roomId + '-count';
    if ($(cssName).length < 0) {
      return;
    }

  }

  $(function () {
    var self = this;
    $.noti = function (opts) {
      // inRoom: auto dismiss message

    };

    var socket = io.connect();

    reloadMessageAllCount(socket);

    socket.on('noti:new_message', function (notification) {
      reloadMessageAllCount(socket);
    });

    socket.on('noti:new_room', function (notification) {
      console.log(notification);
    });

    socket.on('noti:new_team', function (notification) {
      console.log(notification);
    });

    socket.on('noti:dismissedMessage', function(notification) {
      reloadMessageAllCount(socket);
    });
  });


}).call(this, $);