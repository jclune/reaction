module.exports = function (io) {

  // chat

  var chatRoom = io.of('/chatRoom');
  var chatRoomList = io.of('/chatRoomList');

  chatRoom.on('connection', function(socket) {
    console.log('connect to chatRoom');

    socket.on('join room', function(roomId) {
      socket.join(roomId, function() {
        console.log(socket.rooms);
      });
    });

    socket.on('message', function(message) {
      console.log(socket.id + ': ' + message);

      var userId = socket.client.session.passport.user;
      chatRoom.to(socket.rooms[1]).emit('message', {userId: userId, message: message});
    });
  });

  chatRoomList.on('connection', function(socket) {
    console.log('connect to chatRoomList');
  });
};