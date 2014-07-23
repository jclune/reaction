var mongoose = require('mongoose');
var User = mongoose.model('User');
var async = require('async');
var _ = require('underscore');

module.exports = function (io) {

  io.on('connection', function (socket) {
    /**
     * ユーザー情報を取得
     */
    socket.on('user:info', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      var id = data.id || socket.client.session.passport.user;

      return async.waterfall([
        function (next) {
          User.findById(id, function (err, user) {
            if (err) return next(err);
            if (!user || !user.authToken) return next("データは存在しない");
            next(null, user);
          })
        }
      ], function (err, result) {
        return callback(err, result);
      });
    });

    /**
     * 友達リストの取得
     */
    socket.on('user:friends', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }

      data = data || {};
      var id = data.id || socket.client.session.passport.user;

      return async.waterfall([
        function (next) {
          return User.findById(id, 'friends')
            .populate('friends')
            .exec(next);
        },
        function (user, next) {
          if (!user || !user.authToken) {
            return next('ユーザーは存在しない');
          }
          return next(null, _.filter(user.friends || [], function (f) {
            return f.authToken; // システムに存在する友達のみ
          }));
        }
      ], function (err, result) {
        return callback(err, result);
      });
    });
  });
};