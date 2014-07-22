var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var async = require('async');
var _ = require('underscore');

var SubTeamSchema = new Schema({
  team: {type: ObjectId, ref: 'Team'},
  created_by: {type: ObjectId, ref: 'User'},
  created_at: {type: Date, default: Date.now()}
});

var TeamSchema = new Schema({
  members: [
    {type: ObjectId, ref: 'User'}
  ],
  created_by: {type: ObjectId, ref: 'User'},
  created_at: {type: Date, default: Date.now()},
  favorites: [SubTeamSchema],
  dislikes: [SubTeamSchema]
});

/* Static Method */

/**
 * ユーザーのTeamsを取得
 * @param userId
 * @param callback (err, team)
 */
TeamSchema.statics.findListByUserId = function (userId, callback) {
  return this.find({members: userId})
    .exec(callback);
};

/**
 * 新規チーム作成
 * @param uid 作成者
 * @param friends 友達(size = 2)
 * @param callback
 */
TeamSchema.statics.createTeam = function (uid, friends, callback) {
  var _this = this;
  async.parallel([
    function (next) {
      // 友達チェック
      return mongoose.model('User')
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
      return _this.find({
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
    var team = new _this({
      members: friends.concat(uid),
      created_by: uid
    });
    return team.save(function (err) {
      if (err) {
        return callback(err);
      } else {
        // チーム作成しました
        return callback(null, team);
      }
    });
  });
};

/* Validation */

TeamSchema.path('members').validate(function (members) {
  return members.length === 3;
}, 'Size of members must be 3');

mongoose.model('Team', TeamSchema);