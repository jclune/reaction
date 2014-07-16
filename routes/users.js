var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource');
});

router.get('/:id([0-9a-f]{24})/picture', function (req, res) {
  var uid = req.params.id;

  User.findById(new ObjectId(uid), 'facebook.id', function (err, u) {
    if (err) throw err;
    if (!u || !u.facebook || !u.facebook.id) return res.send(404);
    return res.redirect('http://graph.facebook.com/' + u.facebook.id + '/picture');
  });
});

module.exports = router;