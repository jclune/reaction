var mongoose = require('mongoose');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
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

module.exports = function (io) {

  io.on('connection', function (socket) {
    socket.on('noti:list', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      callback = callback || function () {
      };

      var uid = socket.client.session.passport.user;
      var query = {
        user: uid,
        dismissed: false
      };
      var type = data['type'];
      if (type || _.contains(_.values(NotificationType), data)) {
        query.type = type;
      }

      Notification.find(query, function (err, docs) {
        callback(err, docs);
      });
    });
    socket.on('noti:count', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      callback = callback || function () {
      };

      var uid = socket.client.session.passport.user;
      var query = {
        user: uid,
        dismissed: false
      };
      var type = data['type'];
      if (type || _.contains(_.values(NotificationType), data)) {
        query.type = type;
      }
      console.log(query);
      Notification.count(query, function (err, docs) {
        callback(err, docs);
      });
    });
    socket.on('noti:detail', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      callback = callback || function () {
      };

      if (!data.id) {
        return callback("ID[id]を指定してください。");
      }
      Notification.findById(data.id, function (err, docs) {
        callback(err, docs);
      });
    });
    socket.on('noti:dismiss', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      callback = callback || function () {
      };

      var id = data.id;
      var type = data.type;
      var query = {
        user: uid,
        dismissed: false
      };
      if (id) {
        query.id = new ObjectId(id);
      }
      if (type) {
        query.type = type;
      }
      async.waterfall([
        function (next) {
          Notification.find(query, 'id', next);
        },
        function (ids, next) {
          async.each(ids, function (id, nextEach) {
            Notification.findByIdAndUpdate(id, { $set: { dismissed: true }}, nextEach);
          }, function (err) {
            next(err, ids);
          });
        }
      ], function (err, result) {
        callback(err, result);
      });

    });
  });
};