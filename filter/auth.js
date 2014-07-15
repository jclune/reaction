module.exports = exports = function(options) {
  return function(req, res, next) {
    var user = req.session.user;

    if (user || options.allows.some(function(u) {return req.path == u;})) {
      next();
    } else {
      next(new Error(401));
    }
  }
};
