var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');
var _s = require('underscore.string');
var NodeCache = require("node-cache");
var myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
var async = require('async');
var request = require('request');

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource');
});

/**
 * 写真取得
 */
router.get('/:id([0-9a-f]{24}|my)/picture', function (req, res) {
  var uid = req.params.id;
  if ('my' === uid) {
    uid = req.user.id;
  }

  var options = ['redirect=false'];
  if (req.query.w || req.query.h) {
    options.push('width=' + (req.query.w || req.query.h));
    options.push('height=' + (req.query.h || req.query.w));
  }

  var query = '';
  if (options.length > 0) {
    query = "?" + options.join('&');
  }

  var key = uid + ":" + query;

  async.waterfall([
    function (next) {
      myCache.get(key, next);
    },
    function (value, next) {
      if (value[key] && value[key].url) return next(null, value[key].url);
      User.findById(new ObjectId(uid), 'facebook.id', function (err, u) {
        if (err) next(err);
        if (!u || !u.facebook || !u.facebook.id) return next('404');
        request.get({
          url:'http://graph.facebook.com/' + u.facebook.id + '/picture' + query,
          json:true
        }, function (error, response, body) {
          if (error) return next(error);
          if (response.statusCode == 200) {
            if (body.data && body.data.url) {
              var url = body.data.url;
              myCache.set(key, {url: url});
              return next(null, url);
            } else {
              return next('Not found');
            }
          } else {
            return next(response.statusCode);
          }
        });
      });
    }
  ], function (err, url) {
    if (err) return res.send(err);
    return res.redirect(url);
  });


});

/**
 * 自己紹介
 */
router.route('/:id([0-9a-f]{24}|my)/bio')

  .get(function (req, res) {
    // 自己紹介の取得
    var uid = req.params.id;
    if ('my' === uid) {
      uid = req.user.id;
    }

    return User.findById(new ObjectId(uid), 'bio', function (err, u) {
      if (err) throw err;
      u = u || {};
      return res.json({
        bio: u.bio || ''
      });
    });
  })
  .put(function (req, res) {
    // 自己紹介の更新
    var uid = req.params.id;
    if ('my' === uid) {
      uid = req.user.id;
    }
    // ユーザー権限チェック
    var user = req.user;
    if (uid != user.id) {
      return res.send('no_auth');
    }

    // 内容があるかどうか
    if (!_s.trim(req.body.bio)) {
      return res.send('bio_is_empty');
    }

    User.findByIdAndUpdate(new ObjectId(uid), {
      bio: req.body.bio
    }, function (err, u) {
      return res.send('true');
    });
  });

module.exports = router;