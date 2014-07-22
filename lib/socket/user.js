var mongoose = require('mongoose');
var User = mongoose.model('User');
var async = require('async');

module.exports = function (io) {

  io.on('connection', function (socket) {
    /**
     * ユーザー情報を取得
     */
    socket.on('user:info', function (data, callback) {
      if (!data || !data.id) {
        return callback({err: 'IDは存在しない。'});
      }
      var id = data.id;
      if ('my' === data.id) {
        id = socket.client.session.passport.user;
      }

      return async.parallel([
        function (next) {
          User.findById(id, function (err, u) {
            if (err) return next(err);
            if (!u.authToken) return next("データは存在しない");
            next(null, u);
          })
        }
      ], function (err, result) {
        if (err) return callback({err: err});
        return callback(result);
      });
    });
  });
};