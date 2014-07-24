var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('teams/list', {title: 'マイチーム'});
});

router.get('/add', function (req, res) {
  res.render('teams/add', { title: 'チーム作成' });
});

router.get('/:id([0-9a-f]{24})', function (req, res) {
  res.render('teams/match', {
    title: '合コン',
    id: req.params.id
  });
});

module.exports = router;