var express = require('express');
var async = require('async');
var facebook = require('../lib/facebook');

var router = express.Router();

/* GET login page. */
router.get('/', function (req, res) {

  res.render('login/login', {
    title: 'リアクション',
    loginUrl: facebook.loginUrlSync()
  });
});

router.get('/callback', function (req, res, next) {
  if (!req.query.code) {
    return req.redirect('/');
  }

  facebook.accessToken(req.query.code, function (err, result) {
    if (err || result.error) {
      // TODO エラー画面の表示
      console.log('ERROR');
      console.log(err);
      throw err;
    }

    var access_token = result.access_token;
    var expires = res.expires ? res.expires : 0;

    // データベースから検索して、ユーザー情報が存在する場合、ログイン状態にする
    // ユーザー情報が存在しない場合、新規登録

    req.session.access_token = access_token;

    facebook.me(req.session.access_token, ['id'], function (err, result) {
      console.log("USER ID");
      console.log(result);
      var facebookUserId = result.id;

      // TODO var user = mongodb.getUserByFacebookId(facebookUserId);
      req.session.user = facebookUserId;
      var user = null;
      if (user) {
        // TODO ログイン
      } else {
        // 新規登録
        async.parallel([
          function (next) {
            // ユーザー情報の保存
            facebook.me(req.session.access_token, [], function (err, userInfo) {
              if (err) {
                return next(err, null);
              } else {
                //TODO SAVE
                console.log(userInfo);
                return next(null, userInfo);
              }
            });
          },
          function (next) {
            // 友達リストの保存
            facebook.friends(req.session.access_token, [], function (err, friends) {
              // TODO save friends List
              if (err) {
                return next(err, null);
              } else {
                //TODO SAVE
                console.log(friends);
                return next(null, friends);
              }
            });
          }
        ], function (err, callback) {
          console.log('REDIRECT, req.session.user:' + req.session.user);
          res.redirect('/');
        });
      }
    });
  });
});

module.exports = router;
