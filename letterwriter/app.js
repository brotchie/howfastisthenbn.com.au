var OpenAustralia = require('openaustralia'),
    Memcached = require('memcached'),
    apiKeys = require('./keys.json'),
    async = require('async'),
    http = require('http'),
    beeline = require('beeline'),
    port = process.env.PORT || 9090;

var api = new OpenAustralia(apiKeys.OA_API_KEY);
var db = new Memcached(['localhost:11211']);

var router = beeline.route({
  '/postcode/`postcode`': function(req, res, tokens) {
    var key = 'postcode|' + tokens.postcode;
    async.waterfall([
      function(next) {
        db.get(key, next);
      },
      function(data, next) {
        if (data) {
          next(null, JSON.parse(data));
        } else {
          api.getRepresentatives({ postcode: tokens.postcode },
            function(err, result) {
              if (err) {
                next(err);
              } else {
                db.set(key, JSON.stringify(result), 0, function(err){});
                next(null, result);
              }
            }
          );
        }
      },
    ], function(err, data) {
      if (err) {
        res.status(500).end();
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      }
    });
  }
});

var server = http.createServer(router);
server.listen(port);
