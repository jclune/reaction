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
        return callback({err: 'データは存在しない。'});
      }
      if (!data.friends || data.friends.length !== 2) {
        return callback({err: '友達を二人選択してください。'});
      }

      var friends = _.uniq(data.friends); // 重複を削除
      var uid = socket.client.session.passport.user;

      async.parallel([
        function (next) {
          // 友達チェック
          return User
            .findById(uid, 'friends')
            .populate('friends')
            .exec(function (err, u) {
              if (err) return next(err);
              var fds = _.filter(u.friends, function (f) {
                // システムに存在するユーザーのみ
                return f.authToken && friends.indexOf(f.id) !== -1;
              });

              if (fds.length !== friends.length) {
                return next('友達ではありません');
              } else {
                return next();
              }
            });
        },
        function (next) {
          // 重複チェック
          return Team.find({
            members: {$all: [uid, friends[0], friends[1]]}
          }, function (err, teams) {
            if (err) return next(err);
            if (teams && teams.length > 0) {
              return next('チームは既に登録されています。');
            } else {
              return next();
            }
          });
        }
      ], function (err) {
        if (err) return callback({err: err});
        var team = new Team({
          members: data.friends.concat(uid),
          created_by: uid
        });
        return team.save(function (err) {
          if (err) {
            return callback({err: err});
          } else {
            // チーム作成しました
            teamCreated(team);
            return callback({teamId: team.id});
          }
        });
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
      var uid = socket.client.session.passport.user;
      return Team.findListByUserId(uid, function (err, teams) {
        if (err) throw err;
        return callback(teams);
      });
    });

    /**
     * チーム削除
     */
    socket.on('team:remove', function (data, callback) {
      if (!data || !data.id) {
        return callback({err: 'チームを指定してください'});
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
          return Team.remove({_id: team.id}).exec(function (err, result) {
            return next(null, team);
          });
        }
      ], function (err, removedTeam) {
        if (err) {
          return callback({err: err});
        }
        callback({result: true});
        return teamRemoved(removedTeam);
      });
    });
  });
};
