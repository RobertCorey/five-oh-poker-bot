var pokerEvaluator = require('poker-evaluator');
var _ = require('lodash');
var colors = require('colors');

var ShotCaller = function (pHand, oHand, deck, pCard) {
  this.pHands = pHand;
  this.oHands = oHand;
  this.deck = deck;
  this.pCard = pCard;
  this.turn = _.min(this.pHands, function (item) {return item.length;}).length;
  this.round = this.countCards();
};

ShotCaller.prototype.countCards = function () {
  var count = 0;
  _.forEach(this.pHands, function (hand) {
    _.forEach(hand, function (card) {
      count += 1;
    });
  });
  return count;
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
//Todo print missed ones, sorting messes up on paint cards
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
    pHand = null;
    oHand = null;
    deck = null;
  }

  if (useCard) {
    pHandOriginal.pop();
  }
  return Math.round( (playerWin / NUM_ROUNDS) * 100);
};

ShotCaller.prototype.cleanOHands = function () {
  _.forEach(this.oHands, function (item) {
    if (item.length === 5) {
      item.splice(4, 1);
    }
  });
};


ShotCaller.prototype.callShot = function () {
  if (this.turn === 4) {
    this.cleanOHands();
  }
  console.log('turn', this.turn);
  console.log('round', this.round);
  var matchups =  [];
  var matchupsWithCard = [];
  var diff = [];
  for (var i = 0; i < this.pHands.length; i++) {
    var weighted;
    // if the hand has already been given a card this turn continue
    if (this.pHands[i].length > this.turn) {continue;}

    matchupsWithCard[i] = this._simulateRounds(this.pHands[i], this.oHands[i], true);
    matchups[i] = this._simulateRounds(this.pHands[i], this.oHands[i]);
    diff[i] = matchupsWithCard[i] - matchups[i];
  }
  //if its a shit card give it to an already strong hand
  if (_.max(diff) < 15) {
    return matchups.indexOf(_.max(matchups));
  }
  var maxItem = _.max(diff);
  var maxPos = diff.indexOf(maxItem);
  return maxPos;
};

module.exports = ShotCaller;