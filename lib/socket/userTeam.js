var mongoose = require('mongoose');
var UserTeam = mongoose.model('UserTeam');

module.exports = function(io) {
  io.on('connection', function(socket) {
    socket.on('userTeam:get', function(callback) {
      var user = socket.client.session.passport.user;
      UserTeam.findOne({user: user}, function(err, userTeam) {
        callback(err, userTeam);
      });
    });

    socket.on('userTeam:save', function(team, callback) {
      var user = socket.client.session.passport.user;
      var userTeam = new UserTeam();
      userTeam.user = user;
      userTeam.team = team._id;

      UserTeam.findOne({user: user}, function(err, u) {
        if (u === null) {
          userTeam.save(function(err) {
            callback(err);
          });
        } else {
          console.log('test');
          UserTeam.update({_id: u._id}, {
            $set: {user: user, team: team._id}
          }, function(err) {
            callback(err);
          });
        }
      });
    });
  });
}
