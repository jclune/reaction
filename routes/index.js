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

router.post('/editProfile', function(req, res) {
  var name = req.body.name;
  var bio = req.body.bio;
  var user = req.session.passport.user;
  
  User.findByIdAndUpdate(user, {$set: {name: name, bio: bio}}, function(err, user) {
    console.log(user.name, user.bio);
    res.redirect('/editProfile');
  });
});

router.get('/friendList', function(req, res) {
  res.render('main/friendList', { title: 'Friend List' });
});

router.get('/groupProfile', function(req, res) {
  res.render('main/groupProfile', { title: 'Group Profile' });
});

router.get('/matching/:id([0-9a-f]{24})', function(req, res, next) {
  res.render('main/matching', { title: 'Matching', teamId: req.params.id });
});

router.get('/matching', function(req, res) {
  res.render('main/matching', { title: 'Matching', teamId: ''});
});

router.get('/settings', function(req, res) {
  res.render('main/settings', { title: 'Settings'});
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
