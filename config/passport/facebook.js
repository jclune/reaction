var mongoose = require('mongoose');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = mongoose.model('User');
var facebook = require('../../lib/facebook');
var async = require('async');
var moment = require('moment');

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
          user.provider = 'facebook';
        }

        // なかったら更新する
        user.created_at = user.created_at || Date.now();
        if (profile.emails) {
          user.email = user.email || profile.emails[0].value || '';
        }
        user.name = user.name || profile.displayName || '';
        user.username = user.username || profile.username || ''; // ユーザー名
        user.bio = user.bio || profile._json.bio || ''; // 自己紹介
        user.gender = user.gender || profile.gender || ''; // 性別
        if (profile._json.birthday) { // 誕生日
          user.birthday = user.birthday || moment(profile._json.birthday, 'MM/DD/YYYY').toDate();
        }

        // 毎回更新する
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
