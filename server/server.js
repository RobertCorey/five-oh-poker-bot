/*
* Server Logic
*/
var fs = require('fs'),
express    = require('express'),
app        = express(),
bodyParser = require('body-parser'),
ShotCaller = require('./logic'),

https = require('https'),
hskey = fs.readFileSync('https/hacksparrow-key.pem'),
hscert = fs.readFileSync('https/hacksparrow-cert.pem'),
options = {
  key: hskey,
  cert: hscert
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9999;    // set our port

var router = express.Router();        
router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
router.post('/', function (req, res) {
  var model = req.body;
  var ai = new ShotCaller(
    model.playerHands,
    model.opponentHands,
    model.deck,
    model.playerCard
  );
  var move = ai.callShot(false);
  res.json({
    'move': move
  });
});
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
console.log('Server started on port ' + port);
https.createServer(options, app).listen(port);
