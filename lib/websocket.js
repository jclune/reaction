var Session = require('express-session').Session;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');


var getSession = function (app, socket, callback) {
  var sessionStore = app.get('store');
  var s_cookie = require('express/node_modules/cookie').parse(socket.request.headers.cookie);
  var cookie = require('cookie-parser/lib/parse').signedCookies(s_cookie, app.get('secret key'));
  var sid = cookie['connect.sid'];

  sessionStore.get(sid, function (err, sessionData) {
    if (err || !sessionData) {
      return callback(err ? err : 'Handshake failed');
    }

    var session = new Session({
      sessionID: sid,
      sessionStore: sessionStore
    }, sessionData);

    callback(null, session);
  });
};

module.exports = function (app, io) {

  io.use(function (socket, next) {
    getSession(app, socket, function (err, session) {
      if (err) next(err);
      socket.client.session = session;
      next();
    });
  });

  io.on('connection', function (socket) {
    var userId = socket.client.session.passport.user;
    require('./sockets')[userId] = socket;

    socket.on('disconnect', function() {
      var userId = socket.client.session.passport.user;
      delete require('./sockets')[userId];
    });
  });

  require('./socket/chat')(io);
};
