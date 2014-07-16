var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
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
