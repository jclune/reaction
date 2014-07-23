var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/chatRoom/:roomId', function(req, res) {
  res.render('main/chatRoom', { userId: req.session.passport.user, roomId: req.params.roomId });
});

router.get('/chatRoomList', function(req, res) {
  res.render('main/chatRoomList', { title: 'Chat Room List'});
});

router.get('/chooseFriends', function(req, res) {
  res.render('main/chooseFriends', { title: 'Choose Friends' });
});

router.get('/editProfile', function(req, res) {
  res.render('main/editProfile', { title: 'Edit Profile' });
});

router.get('/friendList', function(req, res) {
  res.render('main/friendList', { title: 'Friend List' });
});

router.get('/groupProfile', function(req, res) {
  res.render('main/groupProfile', { title: 'Group Profile' });
});

router.get('/matching', function(req, res) {
  res.render('main/matching', { title: 'Matching' });
});

router.get('/settings', function(req, res) {
  res.render('main/settings', { title: 'Settings' });
});


router.get('/login', function (req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  return res.render('login', {
    title: 'リアクション',
    message: req.flash('error')
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
