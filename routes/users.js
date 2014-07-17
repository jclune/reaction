var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');
var _s = require('underscore.string');

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource');
});

/**
 * 写真取得
 */
router.get('/:id([0-9a-f]{24}|my)/picture', function (req, res) {
  var uid = req.params.id;
  if('my' == uid) {
    uid = req.user.id;
  }

  User.findById(new ObjectId(uid), 'facebook.id', function (err, u) {
    if (err) throw err;
    if (!u || !u.facebook || !u.facebook.id) return res.send(404);
    return res.redirect('http://graph.facebook.com/' + u.facebook.id + '/picture');
  });
});

/**
 * 自己紹介
 */
router.route('/:id([0-9a-f]{24}|my)/bio')

  .get(function (req, res) {
    // 自己紹介の取得
    var uid = req.params.id;
    if('my' == uid) {
      uid = req.user.id;
    }
    return User.findById(new ObjectId(uid), 'bio', function (err, u) {
      if(err) throw err;
      u = u || {};
      return res.json({
        bio: u.bio || ''
      });
    });
  })
  .put(function (req, res) {
    // 自己紹介の更新
    var uid = req.params.id;
    if('my' == uid) {
      uid = req.user.id;
    }
    // ユーザー権限チェック
    var user = req.user;
    if(uid != user.id) {
      return res.send('no_auth');
    }

    // 内容があるかどうか
    console.log(req.params);
    console.log("HELLO", req.param('bio'));
    if(!_s.trim(req.body.bio)) {
      return res.send('bio_is_empty');
    }

    User.findByIdAndUpdate(new ObjectId(uid), {
      bio: req.body.bio
    }, function(err, u) {
      return res.send('true');
    });
  });

module.exports = router;