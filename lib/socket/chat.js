var mongoose = require('mongoose');
var Message = mongoose.model('Message');

module.exports = function (io) {

  // chat

  var chatRoom = io.of('/chatRoom');
  var chatRoomList = io.of('/chatRoomList');

  chatRoom.on('connection', function(socket) {
    console.log('connect to chatRoom');

    socket.on('join room', function(roomId) {
      socket.join(roomId, function() {
        console.log(socket.rooms);

        Message.find({'roomId': roomId}, function(err, messages) {
          if (err) throw err;
          messages.forEach(function(message) {
            chatRoom.to(roomId).emit('message', {userId: message.userId, message: message.message});
          });
        });
      });
    });

    socket.on('message', function(msg) {
      console.log(socket.id + ': ' + msg);

      var userId = socket.client.session.passport.user;

      var message = new Message({
        roomId: socket.rooms[1],
        userId: userId,
        message: msg
      });
      message.save(function(err) {
        if (err) throw err;
      });

      chatRoom.to(socket.rooms[1]).emit('message', {userId: userId, message: msg});
    });
  });

  chatRoomList.on('connection', function(socket) {
    console.log('connect to chatRoomList');
  });
};
