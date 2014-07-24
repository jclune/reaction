var mongoose = require('mongoose');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
var async = require('async');
var _ = require('underscore');

/**
 * 新しいチームを作成しました, チームメンバーへ通知プッシュ
 * @param teamId
 */
function teamCreated(teamId) {
  return Team.findById(teamId)
    .populate('members')
    .populate('created_by')
    .exec(function (err, team) {
      if (err) throw err;

      return team.members.forEach(function (member) {
        return require('../socketStore').get(member.id).forEach(function (socket) {
          return socket.emit('team:created', team);
        });
      });
    });
}

/**
 * チームを削除しました チームメンバーへ通知プッシュ
 * @param removedTeam
 */
function teamRemoved(removedTeam) {
  var memberIds = removedTeam.members;
  return memberIds.forEach(function (uid) {
    return require('../socketStore').get(uid).forEach(function (socket) {
      return socket.emit('team:removed', removedTeam.id);
    });
  });
}

module.exports = function (io) {
  io.on('connection', function (socket) {
    /**
     * チーム作成
     */
    socket.on('team:create', function (data, callback) {
      if (!data) {
        return callback('データは存在しない。');
      }
      if (!data.friends || data.friends.length !== 2) {
        return callback('友達を二人選択してください。');
      }

      var friends = _.uniq(data.friends); // 重複を削除
      var uid = socket.client.session.passport.user;

      return Team.createTeam(uid, friends, function (err, team) {
        if (err) return callback(err);
        callback(null, team);
        teamCreated(team);
      });
    });

    /**
     * ユーザーのチームリストを取得
     */
    socket.on('team:all', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      callback = callback || function () {
      };
      var uid = socket.client.session.passport.user;
      return Team.findListByUserId(uid, function (err, teams) {
        return callback(err, teams);
      });
    });

    socket.on('team:info', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      callback = callback || function () {
      };

      if (!data.id) return callback('チームID[id]を指定してください。');
      return Team.findById(data.id, function (err, team) {
        return callback(err, team);
      });
    });

    /**
     * チーム削除
     */
    socket.on('team:remove', function (data, callback) {
      if (!data || !data.id) {
        return callback('チームを指定してください');
      }
      var teamId = data.id;
      var userId = socket.client.session.passport.user;

      return async.waterfall([
        function (next) {
          // 権限チェック
          return Team.findById(teamId, function (err, team) {
            if (err) return next(err);
            if (!team) return next('チームは存在していません。');
            if (-1 === team.members.indexOf(userId)) return next('権限なし');
            return next(null, team);
          });
        },
        function (team, next) {
          var id = team._id;
          return Team.remove({_id: id}).exec(function (err, result) {
            return next(null, id);
          });
        }
      ], function (err, removedTeamId) {
        if (err) {
          return callback(err);
        } else {
          callback(null, 'true');
          return teamRemoved(removedTeamId);
        }
      });
    });
  });
};
