module.exports = function (io) {
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
      chatRoom.to(socket.rooms[1]).emit('message', message);
    });
  });

  chatRoomList.on('connection', function(socket) {
    console.log('connect to chatRoomList');
  });
};
