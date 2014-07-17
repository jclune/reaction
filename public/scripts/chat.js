var Session = require('express-session').Session;

module.exports = function (app, io) {

  // to socket from session
  io.use(function(socket, next) {
    getSession(app, socket, function(err, session) {
      if (err) next(err);
      socket.client.session = session;
      next();
    });
  });

  var getSession = function(app, socket, callback) {
    var sessionStore = app.get('store');
    var s_cookie = require('express/node_modules/cookie').parse(socket.request.headers.cookie);
    var cookie = require('cookie-parser/lib/parse').signedCookies(s_cookie, app.get('secret key'));
    var sid = cookie['connect.sid'];

    sessionStore.get(sid, function(err, sessionData) {
      if(err || !sessionData) {
        return callback(err ? err: 'Handshake failed');
      }

      var session = new Session({
        sessionID: sid,
        sessionStore: sessionStore
      }, sessionData);

      callback(null, session);
    });
  };

  // chat

  var chatRoom = io.of('/chatRoom');
  var chatRoomList = io.of('/chatRoomList');

  chatRoom.on('connection', function(socket) {
    console.log('connect to chatRoom');
    
    socket.on('join room', function(roomId) {
      socket.join(roomId, function() {
        console.log(socket.rooms);
      });
    });
    
    socket.on('message', function(message) {
      console.log(socket.id + ': ' + message);

      var userId = socket.client.session.passport.user;
      chatRoom.to(socket.rooms[1]).emit('message', {userId: userId, message: message});
    });
  });

  chatRoomList.on('connection', function(socket) {
    console.log('connect to chatRoomList');
  });
};
