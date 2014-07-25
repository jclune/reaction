(function () {
  var socket = io.connect();
  socket.on('noti:new_messages', function (data) {
    console.log
  });
}).call(this);