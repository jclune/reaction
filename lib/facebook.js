var FB = require('fb');
var async = require('async');
var config = require('../config/config');

var Facebook = {};

/**
 * Access Tokenを取得
 * @param code Facebook Login Callbackのパラメータ
 * @param callback(err, result) result={accesstoken: (Token), expire: (Expire)}
 */
Facebook.loginUrlSync = function() {
  FB.options(config.facebook);
  return FB.getLoginUrl({scope:['user_about_me','user_friends']});
};

Facebook.accessToken = function (code, callback) {
  async.waterfall([
    function(next) {
      return FB.napi('oauth/access_token', {
        client_id: FB.options('appId'),
        client_secret: FB.options('appSecret'),
        redirect_uri: FB.options('redirectUri'),
        code: code
      }, function(err, response) {
        var error = err || response.error;
        if(error) {
          return next(error, null);
        } else {
          return next(null, response);
        }
      });
    },
    function(response, next) {
      if(response.error) {
        return next(response.error);
      }
      return FB.napi('oauth/access_token', {
        client_id: FB.options('appId'),
        client_secret: FB.options('appSecret'),
        grant_type: 'fb_exchange_token',
        fb_exchange_token: response.access_token
      }, function(err, response) {
        var error = err || response.error;
        if(error) {
          return next(error, null);
        } else {
          return next(null, response);
        }
      });
    }
  ], function(err,response) {
    return callback(err, response);
  });
};

/**
 * ユーザー情報を取得
 * @param access_token
 * @param fields [Array]
 * @param callback
 */
Facebook.me = function (access_token, fields, callback) {
  var params = {
    access_token: access_token
  };
  if(typeof fields === 'object') {
    params.fields = fields;
  } else if(typeof fields === 'function') {
    callback = fields;
  } else {
  }

  FB.api('me', {
    access_token: access_token,
    fields: fields
  }, function(result) {
    if(!result || result.error) {
      if(!result) {
        return callback(new Error("Result is null"));
      } else {
        return callback(new Error(result.error));
      }
    } else {
      return callback(null, result);
    }
  });
};

Facebook.friends = function(access_token, fields, callback){
  var params = {
    access_token: access_token
  };
  if(typeof fields === 'object') {
    params.fields = fields;
  } else if(typeof fields === 'function') {
    callback = fields;
  } else {
  }

  FB.api('me/friends', params, function (result) {
    if(!result || result.error) {
      if (!result) {
        return callback(new Error("Result is null"));
      } else {
        return callback(new Error(result.error));
      }
    }
    return callback(null, result);
  });
};

module.exports = exports = Facebook;