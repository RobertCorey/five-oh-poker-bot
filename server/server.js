var pokerEvaluator = require('poker-evaluator');
var _ = require('lodash');
var colors = require('colors');

var ShotCaller = function (pHand, oHand, deck, pCard) {
  this.pHands = pHand;
  this.oHands = oHand;
  this.deck = deck;
  this.pCard = pCard;
  this.turn = _.max(this.pHands, function (item) {return item.length;}).length - 1;
};

ShotCaller.prototype.printCard = function(card) {
  var str = card + ' ';
  switch (card[1]) {
    case 'h':
      return str.red;
    case 'd':
      return str.blue;
    case 'c':
      return str.green;
    case 's':
      return str.black;
  }
};

ShotCaller.prototype.printHands = function (hands, title) {
  console.log('\n' + title);
  console.log('-------------------------------------------------------------');
  for (var i = 0; i < 5; i++) {
    var row = '';
    for (var j = 0; j < hands.length; j++) {
      if (hands[j][i]) {
        row += this.printCard(hands[j][i]);
      } else {
        row += 'xx '.yellow;
      }
    }
    console.log(row);
  }
};
//Todo print missed ones, sorting fucks up on paint cards
ShotCaller.prototype.printDeck = function () {
  console.log('Remaining Cards: ');
  console.log('-------------------------------------------------------------');
  var sortedDeck = this.deck.sort(function (a, b) {
    if (a[1] > b[1]) {
      return 1;
    } else if (a[1] < b[1]) {
      return -1;
    } else if (a === 'a') {
      return 1;
    } else if (b === 'a') {
      return -1;
    } else if (a === 'k') {
      return 1;
    } else if (b === 'k') {
      return -1;
    } else if (a === 'q') {
      return 1;
    } else if (b === 'q') {
      return -1;
    } else if (a === 'j') {
      return 1;
    } else if (b === 'j') {
      return -1;
    } else if (a === 'T') {
      return 1;
    } else if (b === 'T') {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return -1;
    }
  });
  var currentSuit = 'c',
  row = '',
  that = this;
  _.forEach(this.deck, function (card) {
    if (currentSuit !== card[1]) {
      console.log(row);
      row = '';
      currentSuit = card[1];
    }
    row += that.printCard(card);
  });
  console.log(row);
};

ShotCaller.prototype.printModel = function() {
  this.printHands(this.oHands, 'Villian Hands');
  this.printHands(this.pHands, 'Player Hands');
  console.log('Player Card: ', this.printCard(this.pCard));
  this.printDeck(); 
};

ShotCaller.prototype._isFirstWinner = function (aHand, bHand) {
  var aHandEval = pokerEvaluator.evalHand(aHand);
  var bHandEval = pokerEvaluator.evalHand(bHand);
  if (aHandEval.handtype > bHandEval.handtype) {
    return true;
  } else if (aHandEval.handtype < bHandEval.handtype) {
    return false;
  } else if (aHandEval.handRank > bHandEval.handRank) {
    return true;
  } else {
    return false;
  }
};

ShotCaller.prototype._simulateRounds = function (pHandOriginal, oHandOriginal, useCard) {
  var NUM_ROUNDS = 10000;
  var playerWin = 0;
  //todo push / pop seems shitty 
  if (useCard) {
    pHandOriginal.push(this.pCard);
  }

  for (var i = 0; i < NUM_ROUNDS; i++) {
    var pHand = pHandOriginal.slice(0);
    var oHand = oHandOriginal.slice(0);
    var deck = _.shuffle(this.deck.slice(0));
    while (pHand.length < 5) {
      pHand.push(deck.pop());
    }
    while(oHand.length < 5) {
      oHand.push(deck.pop());
    }

    if (this._isFirstWinner(pHand, oHand)) {
      playerWin += 1;
    }
  }
  if (useCard) {
    pHandOriginal.pop();
  }
  return Math.round( (playerWin / NUM_ROUNDS) * 100);
};

ShotCaller.prototype.callShot = function (verbose) {
  verbose = true;
  if (verbose) { this.printModel(); }

  var matchups =  [];
  var matchupsWithCard = [];
  var max, maxPos;
  for (var i = 0; i < this.pHands.length; i++) {
    // if the hand has already been given a card this turn continue
    if (this.pHands[i].length > this.turn) { continue; }
    var withCard = this._simulateRounds(this.pHands[i], this.oHands[i], true);
    var noCard = this._simulateRounds(this.pHands[i], this.oHands[i]);
    var diff = withCard - noCard;
    if (verbose) {
      console.log(i , 'Player Hand: ', this.pHands[i], 'Opp Hand: ', this.oHands[i]);
      console.log('Player Card: ', this.pCard);
      console.log('With Card: ', withCard, '%');
      console.log('Without Card: ', noCard, '%');
      console.log('Difference: ', diff);
      console.log('--------------------------------------------------------------------\n');
    }
    if (diff > max || !max) {
      max = diff;
      maxPos = i;
    }
  }
  console.log('max difference is at', maxPos);
  return maxPos;
};


/*
* Server Logic
*/
var https = require('https');
var fs = require('fs');
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

var hskey = fs.readFileSync('https/hacksparrow-key.pem');
var hscert = fs.readFileSync('https/hacksparrow-cert.pem');

var options = {
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
console.log('Magic happens on port ' + port);
https.createServer(options, app).listen(port);
