var mongoose = require('mongoose');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = mongoose.model('User');
var facebook = require('../../lib/facebook');
var async = require('async');

module.exports = function (config) {
  return new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({'facebook.id': profile.id}, function (err, user) {
        if (err) return done(err);
        if (!user) {
          user = new User();
        }
        user.name = profile.displayName;
        user.email = profile.emails[0].value;
        user.username = profile.username;
        user.provider = 'facebook';
        user.facebook = profile._json;
        user.authToken = accessToken;

        async.waterfall([
          function (waterNext) {
            facebook.friends(accessToken, function (err, friends) {
              if (err) {
                return waterNext(err, friends);
              } else {
                return waterNext(null, friends.data);
              }
            });
          }
        ], function (err, friends) {
          if (err) throw err;
          async.map(friends, function (data, mapNext) {
            if (!data.id) {
              return mapNext('Facebook ID not exist', data);
            }

            User.findOne({'facebook.id': data.id}, function (err, u) {
              if (u) {
                return mapNext(null, u);
              } else {
                var friend = new User({
                  name: data.name,
                  facebook: {
                    id: data.id
                  }
                });
                return friend.save(function (err) {
                  if (err) return mapNext(err);
                  return mapNext(null, friend);
                });
              }
            });
          }, function (err, result) {
            if (err) return done(err);
            user.friends = result;
            return user.save(function (err) {
              if (err) return done(err);
              return done(err, user);
            });
          });
        });
      });
    }
  );
};