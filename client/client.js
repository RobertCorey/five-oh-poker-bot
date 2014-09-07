  function convertCard (hand) {
    if (hand.length === 4) {
      return 'T' + hand[0];
    }
    return hand.split('-').reverse().join("");
  }

  function buildDeck (elements) {
    var converted = [];
    for (var i = 0; i < elements.length; i++) {
      var current = $(elements[i]);
      var isolated = current.attr('class').split(' ')[0];
      converted.push(convertCard(isolated));
    }
    return converted;
  }
  //input jquery object
  function convertPlayerHand (hand) {
    var cards = hand.find('.cell');
    var convertedHand = [];
    for (var i = 0; i < cards.length; i++) {
      var current = $(cards[i]);
      if (current.css('display') !== 'none') {
        convertedHand.push(convertCard(current.attr('class').split(' ')[1]));
      }
    }
    return convertedHand;
  }

  function getHands (hands, hero) {
    converted = [];
    for (var i = 0; i < hands.length; i++) {
      var current = $(hands[i]);
      converted.push(convertPlayerHand(current));
    }
    return converted;
  }

  function prunePlayerHands (hands) {
    var max = 0;
    var count = 0;
    hands.forEach(function (hand) {
      if ( hand.length >= max) {
        max = hand.length;
        count += 1;
      }
    });
    console.log(count);
    if (count !== 5) {
      for (var i = 0; i < hands.length; i++) {
        console.log(hands[i].length);
        if (hands[i].length === max) {
          hands[i] =  null;
        }
      }
    }
    return hands;
  }

  var locked = false;
  ScraperBot.prototype.init = function(arguments) {
    // body...
  }
  function mainLoop () {
    var playerCard = $('.cell.ui-draggable');
    if (playerCard.length) {
      playerCard = convertCard($(playerCard[0]).attr('class').split(' ')[1]);
    } else {
      return;
    }
    if (locked) {
      return;
    } else {
      locked = true;
    }
    var deck = buildDeck($('.counter-table tbody tr td.active'));
    var playerHands = getHands($('.player-card-row .valid-move'), true);
    playerHands = prunePlayerHands(playerHands);
    var opponentHands = getHands($('.opponent-card-row .column'));
    var gameModel = {
      'deck': deck,
      'playerHands': playerHands,
      'opponentHands': opponentHands,
      'playerCard': playerCard
    };
    console.log(gameModel);
    $.post('http://127.0.0.1:8080/api', gameModel, function (data) {

      locked = false;
    });
  }

  mainLoop();
  var selectors = {
    pRow: '.player-card-row .valid-move',
    oRow: '.opponent-card-row .column',
    pCard: '.cell.ui-draggable',
    deck: '.counter-table tbody tr td.active',
  };

  var ScraperBot = function (selectors, interval) {
    this.selectors = selectors;
    this.interval = interval;
  };
