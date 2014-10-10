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
function convertHand (hand) {
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

function getHands (hands) {
  var handsArray = [];
  for (var i = 0; i < hands.length; i++) {
    var current = $(hands[i]);
    handsArray.push(convertHand(current));
  }
  return handsArray;
}

function getPlayerCard (elem) {
  if (elem.length) {
    return convertCard($(elem[0]).attr('class').split(' ')[1]);
  } else {
    return false;
  }
}

function mainLoop () {
  var selectors = {
    pRow: '.player-card-row .column',
    oRow: '.opponent-card-row .column',
    pCard: '.cell.ui-draggable',
    deck: '.counter-table tbody tr td.active',
  };
  //If our turn get our card, else end 
  var playerCard = getPlayerCard($(selectors.pCard));
  if (!playerCard) { return;}
  //get the rest of the game model
  var deck = buildDeck($(selectors.deck));
  var playerHands = getHands($(selectors.pRow));
  var opponentHands = getHands($(selectors.oRow));
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
mainLoop();
