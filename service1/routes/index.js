var express = require('express');
var router = express.Router();

var requests = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  if(requests.length < 10) {
    requests.push({req, res});
  } else {
    res.status(429).send('Too many requests');
  }
});

setInterval(function() {
  if(requests.length > 0) {
    console.log(requests.length);
    const {req, res} = requests[0];
    res.status(200).send({result: 'ok', load: requests.length - 1});
    requests = requests.slice(1);
  }
}, 1000);

module.exports = router;
