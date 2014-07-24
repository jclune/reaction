var mongoose = require('mongoose');
var Team = mongoose.model('Team');
var Room = mongoose.model('Room');
var async = require('async');
var _ = require('underscore');
var Schema = mongoose.Schema;

function findRandomList(query, callback) {
  query.limit = query.limit || 10; // 取得数, デフォルト10

  // data.filters;TODO フィルター

  async.waterfall([
    function (next) {
      // チームIDを取得
      Team.findById(query.teamId, function (err, team) {
        if (err) return next(err);
        if (!team) return next('チームは存在しない');
        return next(null, team);
      });
    },
    function (team, next) {
      async.map(team.members, function (member, nextMap) {
        Team.findListByUserId(member, nextMap);
      }, function (err, memberTeams) {
        if (err) return next(err);
        return next(null, team, _.uniq(_.flatten(memberTeams), function (m) {
          return m.id
        }));
      });
    },
    function (team, memberTeams, next) {
      // 除外リストを作成する (チーム自身、お気に入り、ブラックリスト、チームユーザーが含まれるチーム)
      var excludeList = []
        .concat([team._id]) // 自分を除外
        .concat(team.favorites.map(function (f) {
          return f.team
        })) // お気に入りリストを除外
        .concat(team.dislikes.map(function (f) {
          return f.team
        })) // お気に入らないリストを除外
        .concat(_.map(memberTeams, function (mt) {
          return mt._id
        }));
      return next(null, team, _.uniq(excludeList, function (e) {
        return e.toString();
      }));
    },
    function (team, excludeList, next) {
      var conditions = {_id: {$nin: excludeList}};
      Team.find(conditions, 'id', function (err, teamList) {
        if (err) return next(err);
        var idList = teamList.map(function (t) {
          return t._id
        });
        if (idList.length <= query.limit) return next(null, idList);
        next(null, _.shuffle(idList).slice(0, query.limit));
      });
    },
    function (selectedIds, next) {
      async.map(selectedIds, function (id, nextMap) {
        Team.findById(id, nextMap);
      }, next);
    }
  ], callback);
}

var MatchEvent = {
  /**
   * Event: 'room:created'
   * @param roomId
   */
  roomCreated: function (roomId) {
    async.waterfall([
      function (next) {
        Room.findById(roomId).populate("teams")
          .exec(next);
      }
    ], function (err, room) {
      if (err) throw err;
      var members = _.flatten(room.teams.map(function (t) {
        return t.members.map(function (m) {
          return m.toString();
        });
      }));
      async.each(members, function (member, nextEach) {
        require('../socketStore').get(member).forEach(function (socket) {
          socket.emit('room:created', room.id);
        });
        return nextEach();
      }, function (err) {
      });
    });
  },
  /**
   * Event: 'matching:favoritesAdded'
   * @param myTeam
   * @param matchTeam
   */
  favoritesAdded: function (myTeam, matchTeam) {
    var data = {
      myTeam: myTeam.id,
      matchTeam: matchTeam.id
    };
    var idList = myTeam.members;
    async.each(idList, function (uid, next) {
      require('../socketStore').get(uid).forEach(function (socket) {
        socket.emit('matching:favoritesAdded', data);
      });
      next();
    }, function(err) {
      if(err) throw err;
    });
  },
  /**
   * Event: 'matching:favoritesRemoved'
   * @param myTeam
   * @param matchTeam
   */
  favoritesRemoved: function (myTeam, matchTeam) {
    var data = {
      myTeam: myTeam.id,
      matchTeam: matchTeam.id
    };
    var idList = myTeam.members;
    async.each(idList, function (uid, next) {
      require('../socketStore').get(uid).forEach(function (socket) {
        socket.emit('matching:favoritesRemoved', data);
        return next();
      });
    });
  },
  /**
   * Event: 'matching:dislikesAdded'
   * @param myTeam
   * @param matchTeam
   */
  dislikesAdded: function (myTeam, matchTeam) {
    var data = {
      myTeam: myTeam.id,
      matchTeam: matchTeam.id
    };
    var idList = myTeam.members;
    async.each(idList, function (uid, next) {
      require('../socketStore').get(uid).forEach(function (socket) {
        socket.emit('matching:dislikesAdded', data);
        return next();
      });
    });
  },
  /**
   * Event: 'matching:dislikesRemoved'
   * @param myTeam
   * @param matchTeam
   */
  dislikesRemoved: function (myTeam, matchTeam) {
    var data = {
      myTeam: myTeam.id,
      matchTeam: matchTeam.id
    };
    var idList = myTeam.members;
    async.each(idList, function (uid, next) {
      require('../socketStore').get(uid).forEach(function (socket) {
        socket.emit('matching:dislikesRemoved', data);
        return next();
      });
    });
  }
};

module.exports = function (io) {
  io.on('connection', function (socket) {
    /**
     * 次のランダムチームリストを取得
     */
    socket.on('matching:randomTeams', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      if (!data.id) {
        // idを指定しない場合
        return callback('チームID[id]を指定してください');
      }

      return findRandomList({
        teamId: data.id,
        limit: data.limit || 10
      }, function (err, result) {
        return callback(err, result);
      });
    });

    /**
     * お気に入りリストを取得
     */
    socket.on('matching:favorites', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      if (!data['id']) {
        return callback('チームID[id]を指定してください。');
      }
      var teamId = data.id;
      Team.findById(teamId)
        .populate("favorites.team")
        .exec(function (err, team) {
          if (err) return callback(err);
          if (!team) return callback("チームは存在しない。");
          return callback(null, team.favorites.map(function (f) {
            return f.team;
          }));
        });
    });

    /**
     * お気に入らないリストを取得
     */
    socket.on('matching:dislikes', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      if (!data['id']) {
        return callback('チームIDを指定してください。');
      }
      var teamId = data.id;
      Team.findById(teamId)
        .populate("dislikes.team")
        .exec(function (err, team) {
          if (err) return callback(err);
          if (!team) return callback("チームは存在しない。");
          return callback(null, team.dislikes.map(function (d) {
            return d.team;
          }));
        });
    });

    /**
     * お気に入りリストに追加
     */
    socket.on('matching:addToFavorites', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};

      if (!data['my_team']) {
        return callback('自分のチームIDを指定してください。');
      }
      if (!data['match_team']) {
        return callback('相手のチームIDを指定してください。');
      }
      var myTeamId = data['my_team'],
        matchTeamId = data['match_team'],
        uid = socket.client.session.passport.user;

      async.waterfall([
        function (next) {
          // myTeamIdとmatchTeamIdのチェック
          async.parallel([
              function (next1) {
                Team.findById(myTeamId, function (err, team) {
                  if (err) {
                    return next1(err);
                  } else if (!team) {
                    return next1('自分のチームは存在しない。');
                  } else if (-1 === team.members.indexOf(uid)) {
                    return next1('権限なし');
                  } else {
                    return next1(null, team);
                  }
                })
              }, function (next2) {
                Team.findById(matchTeamId, function (err, team) {
                  if (err) {
                    return next2(err);
                  } else if (!team) {
                    return next2('相手のチームは存在しない。');
                  } else {
                    return next2(null, team);
                  }
                })
              }],
            function (err, result) {
              if (err) return next(err);
              else return next(null, result[0], result[1]);
            });
        },
        function (myTeam, matchTeam, next) {
          // 既にお気に入りリストに追加されたかどうかチェック
          var f_exists = _.find(myTeam.favorites, function (f) {
            return f.team.toString() === matchTeam._id.toString();
          });
          var d_exists = _.find(myTeam.dislikes, function (f) {
            return f.team.toString() === matchTeam._id.toString();
          });
          if (f_exists || d_exists) {
            return next('既に追加しました。');
          } else {
            return next(null, myTeam, matchTeam);
          }
        },
        function (myTeam, matchTeam, next) {
          // お気に入りリストに追加する
          myTeam.favorites.push({
            team: matchTeam,
            created_by: uid,
            created_at: Date.now()
          });
          myTeam.save(function (err, data) {
            if (err) return next(err);
            return next(null, myTeam, matchTeam);
          });
        }
      ], function (err, myTeam, matchTeam) {
        if (err) return callback(err);
        callback(null, 'true');

        MatchEvent.favoritesAdded(myTeam, matchTeam);

        // マチィング判断
        var matched = _.find(matchTeam.favorites, function (f) {
          return f.team.toString() === myTeam._id.toString();
        });
        if (!matched) return;

        // ルーム作成
        var room = new Room({
          teams: [myTeam, matchTeam],
          created_at: Date.now()
        });
        room.save(function (err) {
          if (err) throw err;
          // チーム両方通知
          MatchEvent.roomCreated(room._id);
        });
      });
    });

    /**
     * お気に入らないリストに追加
     */
    socket.on('matching:addToDislikes', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};

      if (!data['my_team']) {
        return callback('自分のチームIDを指定してください。');
      }
      if (!data['match_team']) {
        return callback('相手のチームIDを指定してください。');
      }
      var myTeamId = data['my_team'],
        matchTeamId = data['match_team'],
        uid = socket.client.session.passport.user;

      async.waterfall([
        function (next) {
          // myTeamIdとmatchTeamIdのチェック
          async.parallel([
              function (next1) {
                Team.findById(myTeamId, function (err, team) {
                  if (err) {
                    return next1(err);
                  } else if (!team) {
                    return next1('自分のチームは存在しない。');
                  } else if (-1 === team.members.indexOf(uid)) {
                    return next1('権限なし');
                  } else {
                    return next1(null, team);
                  }
                })
              }, function (next2) {
                Team.findById(matchTeamId, function (err, team) {
                  if (err) {
                    return next2(err);
                  } else if (!team) {
                    return next2('相手のチームは存在しない。');
                  } else {
                    return next2(null, team);
                  }
                })
              }],
            function (err, result) {
              if (err) return next(err);
              else return next(null, result[0], result[1]);
            });
        },
        function (myTeam, matchTeam, next) {
          // 既にお気に入りリストに追加されたかどうかチェック
          var f_exists = _.find(myTeam.favorites, function (f) {
            return f.team.toString() === matchTeam._id.toString();
          });
          var d_exists = _.find(myTeam.dislikes, function (f) {
            return f.team.toString() === matchTeam._id.toString();
          });
          if (f_exists || d_exists) {
            return next('既に追加しました。');
          } else {
            return next(null, myTeam, matchTeam);
          }
        },
        function (myTeam, matchTeam, next) {
          // お気に入りリストに追加する
          myTeam.dislikes.push({
            team: matchTeam,
            created_by: uid,
            created_at: Date.now()
          });
          myTeam.save(function (err, data) {
            if (err) return next(err);
            return next(null, myTeam, matchTeam);
          });
        }
      ], function (err, myTeam, matchTeam) {
        if (err) return callback(err);
        callback(null, 'true');
        MatchEvent.dislikesAdded(myTeam, matchTeam);
      });
    });

    /**
     * お気に入りリストから削除
     */
    socket.on('matching:removeFromFavorites', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      if (!data['my_team']) {
        return callback('チームID[my_team]を指定してください。');
      }
      if (!data['match_team']) {
        return callback('チームID[match_team]を指定してください。');
      }
      var teamId = data['my_team'],
        removedTeamId = data['match_team'],
        uid = socket.client.session.passport.user;

      async.waterfall([
        function (next) {
          async.parallel([
            function (next1) {
              Team.findById(teamId, function (err, result) {
                if (err) return next1(err);
                if (!result) {
                  return next1("チームは存在しない。");
                } else if (-1 === result.members.indexOf(uid)) {
                  return next1('権限なし');
                } else {
                  return next1(null, result);
                }
              });
            },
            function (next2) {
              Team.findById(removedTeamId, function (err, result) {
                if (err) return next2(err);
                if (!result) return next2("チームは存在しない。");
                return next2(null, result);
              });
            }
          ], function (err, teams) {
            if (err) return next(err);
            return next(null, teams[0], teams[1]);
          });
        },
        function (team, removedTeam, next) {
          if (!team) return next('チームは存在しない。');
          var find = _.find(team.favorites, function (d) {
            return d.team.toString() === removedTeam.id;
          });
          if (!find) return next('Favoritesに存在しない。');
          team.favorites = _.reject(team.favorites, function (d) {
            return d.team.toString() === removedTeam.id;
          });
          team.save(function (err) {
            if (err) return next(err);
            return next(null, team, removedTeam);
          });
        }
      ], function (err, team, removedTeam) {
        if (err) return callback(err);
        callback(null, "true");

        MatchEvent.favoritesRemoved(team, removedTeam);
      });
    });

    /**
     * お気に入らないリストから削除
     */
    socket.on('matching:removeFromDislikes', function (data, callback) {
      if (typeof(data) === 'function') {
        callback = data;
        data = null;
      }
      data = data || {};
      if (!data['my_team']) {
        return callback('チームID[my_team]を指定してください。');
      }
      if (!data['match_team']) {
        return callback('チームID[match_team]を指定してください。');
      }
      var teamId = data['my_team'],
        removedTeamId = data['match_team'],
        uid = socket.client.session.passport.user;

      async.waterfall([
        function (next) {
          async.parallel([
            function (next1) {
              Team.findById(teamId, function (err, result) {
                if (err) return next1(err);
                if (!result) {
                  return next1("チームは存在しない。");
                } else if (-1 === result.members.indexOf(uid)) {
                  return next1('権限なし');
                } else {
                  return next1(null, result);
                }
              });
            },
            function (next2) {
              Team.findById(removedTeamId, function (err, result) {
                if (err) return next2(err);
                if (!result) return next2("チームは存在しない。");
                return next2(null, result);
              });
            }
          ], function (err, teams) {
            if (err) return next(err);
            return next(null, teams[0], teams[1]);
          });
        },
        function (team, removedTeam, next) {
          if (!team) return next('チームは存在しない。');
          var find = _.find(team.dislikes, function (d) {
            return d.team.toString() === removedTeam.id;
          });
          if (!find) return next('Dislikesに存在しない。');
          team.dislikes = _.reject(team.dislikes, function (d) {
            return d.team.toString() === removedTeam.id;
          });
          team.save(function (err) {
            if (err) return next(err);
            return next(null, team, removedTeam);
          });
        }
      ], function (err, team, removedTeam) {
        if (err) return callback(err);
        callback(null, "true");

        MatchEvent.dislikesRemoved(team, removedTeam);
      });
    });
  });
};