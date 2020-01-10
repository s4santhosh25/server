var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.status(200).json({ data: "testing" });
});

router.get('/users', function (req, res, next) {
  res.status(200).json({ data: 'respond with a resource' });
});

module.exports = router;
