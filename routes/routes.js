module.exports = exports = function (app, passport) {

  var urls = [
    '/',
    '/auth/facebook',
    '/auth/facebook/callback',
    '/chatRoom',
    '/chatRoomList',
    '/chooseFriends',
    '/editProfile',
    '/friendList',
    '/groupProfile',
    '/login',
    '/login/callback',
    '/matching',
    '/settings'];
  var authFilter = require('../filter/auth')({
    allows: urls
  });
  app.use(authFilter);

  app.use('/', require('./index'));


  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me', 'user_friends']
    })
  );

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

  app.use('/users', require('./users'));

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers
  app.use(function (err, req, res, next) {
    if (err instanceof Error) {
      if (err.message == '401') {
        req.flash('error', 'ログインしてください。');
        return res.redirect('/login');
      }
    }
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
};