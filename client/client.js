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
    var foo = [];
    for (var i = 0; i < hands.length; i++) {
      var current = $(hands[i]);
      var index = parseInt(current.attr('data-move'), 10);
      var currentConverted = convertPlayerHand(current);
      foo[index] = currentConverted;
    }
    return foo;
  }

  function prunePlayerHands (hands) {
    var copy = hands.slice(0);
    var max = 0;
    var count = 0;
    copy.forEach(function (hand) {
      if ( hand.length >= max) {
        max = hand.length;
        count += 1;
      }
    });
    if (count !== 5) {
      for (var i = 0; i < copy.length; i++) {
        if (copy[i].length === max) {
          copy[i] =  null;
        }
      }
    }
    return copy;
  }

  
  function mainLoop () {
    var playerCard = $('.cell.ui-draggable');

    if (playerCard.length) {
      playerCard = convertCard($(playerCard[0]).attr('class').split(' ')[1]);
    } else {
      return;
    }

    var deck = buildDeck($('.counter-table tbody tr td.active'));
    var playerHands = getHands($('.player-card-row .valid-move'), true);
    console.log(playerHands);
    // var prunedHands = prunePlayerHands(playerHands);
    var opponentHands = getHands($('.opponent-card-row .column'));
    var gameModel = {
      'deck': deck,
      'playerHands': playerHands,
      'opponentHands': opponentHands,
      'playerCard': playerCard
    };
    $.post('https://127.0.0.1:9999/api', gameModel, function (data) {
      console.log(data);
    });
  }

  // setInterval(function() {
    mainLoop();
  // }, 10000);

  var selectors = {
    pRow: '.player-card-row .valid-move',
    oRow: '.opponent-card-row .column',
    pCard: '.cell.ui-draggable',
    deck: '.counter-table tbody tr td.active',
  };