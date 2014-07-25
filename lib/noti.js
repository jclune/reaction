var mongoose = require('mongoose');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
var Room = mongoose.model('Room');
var Message = mongoose.model('Message');
var Notification = mongoose.model('Notification');
var async = require('async');
var _ = require('underscore');
var ObjectId = mongoose.Schema.Types.ObjectId;


var NotificationType = {
  NEW_TEAM: 'new_team',
  NEW_ROOM: 'new_room',
  NEW_MESSAGE: 'new_message',
  NEW_FRIEND: 'new_friend'
};


module.exports = exports = {
  newRoom: function (roomId) {
    async.waterfall([
      function (next) {
        Room.findById(roomId).populate("teams")
          .exec(next);
      }
    ], function (err, room) {
      if (err) throw err;
      var noti = {
        type: NotificationType.NEW_ROOM,
        payload: {
          room: room._id,
          teams: room.teams.map(function (t) {
            return t._id;
          }),
          msg: {
            ja: "マティング!!"
          }
        }
      };
      var members = _.flatten(room.teams.map(function (t) {
        return t.members.map(function (m) {
          return m.toString();
        });
      }));
      async.eachSeries(members, function (member, nextEach) {
        noti.user = member;
        var notification = new Notification(noti);
        notification.save(function (err, n) {
          if (err) return nextEach(err);
          require('./socketStore').get(n.user).forEach(function (socket) {
            socket.emit('noti:new_room', n);
          });
          nextEach(null);
        });
      }, function (err) {
        if (err) throw err;
      });
    });
  },
  newTeam: function (teamId) {
    async.waterfall([
      function (next) {
        Team.findById(teamId).populate("members").populate("created_by").exec(next);
      }
    ], function (err, team) {
      var noti = {
        type: NotificationType.NEW_TEAM,
        payload: {
          team: team._id,
          members: team.members.map(function (m) {
            return m.name;
          }),
          msg: {
            ja: team.created_by.name + "さんが新しいチームを作りました。"
          }
        }
      };
      var ids = team.members.map(function (m) {
        return m._id.toString();
      });
      async.eachSeries(ids, function (id, nextEach) {
        noti.user = id;
        if (team.created_by._id.toString() === id) return nextEach();

        var notification = new Notification(noti);
        notification.save(function (err, n) {
          if (err) return nextEach(err);
          require('./socketStore').get(n.user).forEach(function (socket) {
            socket.emit('noti:new_team', n);
          });
          nextEach(null);
        });
      }, function (err) {
        if (err) throw err;
      });
    });
  },
  newMessage: function (messageId) {
    async.waterfall([
      function (next) {
        Message.findById(messageId).populate("user").exec(next);
      },
      function (message, next) {
        Room.findById(message.room).populate("teams").exec(function (err, room) {
          if (!room) return next("ROOMは存在していません");
          return next(err, message, room);
        });
      }
    ], function (err, message, room) {
      var noti = {
        type: NotificationType.NEW_MESSAGE,
        payload: {
          room: room._id,
          sender: message.user,
          message: message.message,
          msg: {
            ja: message.user.name + ":" + message.message
          }
        }
      };
      var ids = _.flatten(room.teams.map(function (t) {
        return t.members.map(function (m) {
          return m.toString();
        });
      }));
      async.eachSeries(ids, function (id, nextEach) {
        noti.user = id;
        if (id === message.user._id.toString()) {
          return nextEach(null);
        }
        var notification = new Notification(noti);
        notification.save(function (err, n) {
          if (err) return nextEach(err);
          require('./socketStore').get(n.user).forEach(function (socket) {
            socket.emit('noti:new_message', n);
          });
          nextEach(null);
        });
      }, function (err) {
        if (err) throw err;
      });
    });
  },
  newFriends: function () {

  },
  dismissed: function () {

  }
};