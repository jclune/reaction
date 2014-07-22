var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var Room = mongoose.model('Room');
var Team = mongoose.model('Team');
var async = require('async');
var _ = require('underscore');

module.exports = function (io) {

  // chatRoom
  var chatRoom = io.of('/chatRoom');
  var chatRoomList = io.of('/chatRoomList');

  chatRoom.on('connection', function(socket) {
    console.log('connect to chatRoom');

    socket.on('join room', function(roomId) {
      socket.join(roomId, function() {
        console.log(socket.rooms);

        Message.find({'room': roomId}, function(err, messages) {
          if (err) throw err;
          messages.forEach(function(message) {
            socket.emit('message', {userId: message.user, message: message.message});
          });
        });
      });
    });

    socket.on('message', function(msg) {
      console.log(socket.id + ': ' + msg);

      var user = socket.client.session.passport.user;

      var message = new Message({
        room: socket.rooms[1],
        user: user,
        message: msg
      });
      message.save(function(err) {
        if (err) throw err;
      });

      chatRoom.to(socket.rooms[1]).emit('message', {userId: user, message: msg});
    });
  });

  // chatRoomList
  chatRoomList.on('connection', function(socket) {
    console.log('connect to chatRoomList');
  
    // send chatRoomList  
    var user = socket.client.session.passport.user;
  
    async.waterfall([
      function(next) {
        Team.find({members:user}, next);
      },
      function(teams, next) {
        async.map(teams, function(team, nextMap) {
          Room.find({teams: team._id}, nextMap);
        }, function(err, roomsList){
          if(err) return next(err);
          return next(null, _.uniq(_.flatten(roomsList)));
        })
      }
      ], function(err, rooms){
        if (err) throw err;
        socket.emit('chatRoomList', rooms);
    });
  });
};
