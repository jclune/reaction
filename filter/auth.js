module.exports = exports = function(options) {
  return function(req, res, next) {

    if (req.isAuthenticated()) return next();

    if (options.allows.some(function(u) {return req.path == u;})) {
      return next();
    }

//    if (req.method == 'GET') {
//      req.session.returnTo = req.originalUrl;
//    }
    return next(new Error(401));
  }
};