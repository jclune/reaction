var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (app, config) {

  app.use(passport.initialize());
  app.use(passport.session());

  // serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  });

  // use these strategies
  passport.use(require('./passport/facebook')(config));

  return passport;
};