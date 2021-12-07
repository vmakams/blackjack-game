var suits = ['H', 'D', 'S', 'C'];
var cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var deck = [];
var players = [];
var dealer = {
  id: 0,
  name: 'Dealer',
  hand: [],
  total: 0,
  bust: false,
  stand: false,
  result: '',
};
var playersCount = 2;
var currentPlayer = 1;
var isGameOver = false;
var isResultShown = false;
var hiddenCardImages = [
  'blue_back.png',
  'gray_back.png',
  'green_back.png',
  'purple_back.png',
  'red_back.png',
  'yellow_back.png',
];

function createDeck() {
  for (var i = 0; i < suits.length; i++) {
    for (var j = 0; j < cards.length; j++) {
      deck.push({
        suit: suits[i],
        value: cards[j],
      });
    }
  }
}

function shuffleDeck() {
  for (var i = 0; i < deck.length; i++) {
    var randomIndex = Math.floor(Math.random() * deck.length);
    var temp = deck[i];
    deck[i] = deck[randomIndex];
    deck[randomIndex] = temp;
  }
}

function createPlayers() {
  for (var i = 0; i < playersCount; i++) {
    players.push({
      id: i + 1,
      name: `Player ${i + 1}`,
      hand: [],
      total: 0,
      bust: false,
      stand: false,
      result: '',
    });
  }
}

function dealCardsToPlayers() {
  for (var i = 0; i < players.length; i++) {
    var player = players[i];

    // push cards to player's hand
    for (var j = 0; j < 2; j++) {
      var card = deck.pop();
      player.hand.push(card);
      player.total += getCardWeight(card.value);
    }

    players[i] = player;
  }

  updatePlayersUI();
}

function addCardToCurrentPlayer() {
  var player = players[currentPlayer - 1];
  var card = deck.pop();
  player.hand.push(card);
  player.total = getHandTotal(player.hand);
  players[currentPlayer - 1] = player;

  updateCurrentPlayerUI();
}

function addCardToDealer() {
  var card = deck.pop();
  dealer.hand.push(card);
  dealer.total += getCardWeight(card.value);

  updateDealerCards(true);
}

function dealCardsToDealer() {
  for (var i = 0; i < 2; i++) {
    var card = deck.pop();
    dealer.hand.push(card);

    // Show dealer's total only for visible card
    if (i === 0) {
      dealer.total += getCardWeight(card.value);
    }
  }

  updateDealerCards();
}

function getHandTotal(hand) {
  var total = 0;

  for (var i = 0; i < hand.length; i++) {
    total += getCardWeight(hand[i].value);
  }

  return total;
}

function getCardWeight(value) {
  if (value === 'K' || value === 'Q' || value === 'J') {
    return 10;
  } else if (value === 'A') {
    var a = 11;
    var total = 0;
    var playerCards = players[currentPlayer - 1].hand;

    for (var i = 0; i < playerCards.length; i++) {
      var card = playerCards[i];

      if (card.value !== 'A') {
        total += getCardWeight(card.value);
      }
    }

    return total + a > 21 ? 1 : 11;
  } else {
    return parseInt(value);
  }
}

function updatePlayersUI() {
  var playersContainer = $('#players');
  playersContainer.html('');

  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    var cardsHtml = '';

    for (var j = 0; j < player.hand.length; j++) {
      cardsHtml += getCardImage(player.hand, j);
    }

    var playerHtml = `
      <div class="player" id="player-${player.id}">
        <div class="cards" style="height: 100px;" id="player-${player.id}-cards">
          ${cardsHtml}
        </div>
        <div class="section-header">
          <h2 class="player-title" id="player-${player.id}-name">
            ${player.name}
            (<span class="player-score" id="player-${player.id}-total">${player.total}</span> Points)
          </h2>
        </div>
      </div>`

    playersContainer.append(playerHtml);
  }
}

function updateCurrentPlayerUI() {
  var player = players[currentPlayer - 1];
  var cardsHtml = '';

  for (var i = 0; i < player.hand.length; i++) {
    cardsHtml += getCardImage(player.hand, i);
  }

  $(`#player-${player.id}-cards`).html(cardsHtml);
  $(`#player-${player.id}-total`).html(player.total);
}

function updateDealerCards() {
  var cards = '';

  for (var i = 0; i < dealer.hand.length; i++) {
    if (isGameOver) {
      cards += getCardImage(dealer.hand, i);
    } else {
      cards += getCardImage(dealer.hand, i, i !== 0);
    }
  }

  $('#dealer-cards').html(cards);
  $('#dealer-total').html(dealer.total);
}

function getCardImage(hand, cardIndex, isHidden = false) {
  var card = hand[cardIndex];
  var randomIndex = Math.floor(Math.random() * hiddenCardImages.length);
  var cardName = isHidden ? hiddenCardImages[randomIndex] : `${card.value}${card.suit}.png`;

  console.log(cardIndex)
  var cardPosition = (cardIndex + 1) * 20;

  return `<img class="card" style="left: ${cardPosition}px; z-index: ${cardIndex}" src="assets/images/cards/${cardName}">`;
}

function checkPlayerBust(playerId) {
  if (players[playerId - 1].total > 21) {
    players[playerId - 1].bust = true;

    updateCurrentPlayerId(playerId);
  }
}

function updateCurrentPlayerId(playerId) {
  currentPlayer = playerId < players.length ? playerId + 1 : playerId;
}

function checkDealerBust() {
  if (dealer.total > 21) {
    dealer.bust = true;
  }
}

function checkGameOver() {
  updateCurrentPlayer();

  for (var i = 0; i < players.length; i++) {
    if (!players[i].bust && !players[i].stand) {
      return false;
    }
  }

  isGameOver = true;
  revealDealerCards();

  // Disable hit and stand buttons
  $('#hit').prop('disabled', true);
  $('#stand').prop('disabled', true);

  return true;
}

function revealDealerCards() {
  var cardsHtml = '';

  for (var i = 0; i < dealer.hand.length; i++) {
    cardsHtml += getCardImage(dealer.hand, i);
    dealer.total = getHandTotal(dealer.hand);
  }

  $('#dealer-cards').html(cardsHtml);
  $('#dealer-total').html(dealer.total);

  showGameResult();
}

function getResultLabel(score, highScore, highestScoreHoldersCount) {
  if (score > 21 || score < highScore) {
    return 'Lost!'
  }

  if (score === highScore) {
    if (highestScoreHoldersCount === 1) {
      return 'Won!'
    }

    return 'Push (Draw)'
  }

  return 'Won!'
}

function checkAllPlayersBust() {
  for (var i = 0; i < players.length; i++) {
    if (getHandTotal(players[i].hand) <= 21) {
      return false;
    }
  }

  return true;
}

function showGameResult() {
  if (isResultShown) {
    return;
  }

  isResultShown = true;

  var dealerTotal = getHandTotal(dealer.hand);

  if (dealerTotal < 17 && !checkAllPlayersBust()) {
    while (getHandTotal(dealer.hand) < 17) {
      addCardToDealer();
      checkDealerBust();
    }
  }

  // Disable hit and stand buttons
  $('#hit').prop('disabled', true);
  $('#stand').prop('disabled', true);

  var highScore = 0;

  for (var i = 0; i < players.length; i++) {
    var player = players[i];

    if (player.total <= 21 && player.total > highScore) {
      highScore = player.total;
    }
  }

  if (dealer.total > highScore && dealer.total <= 21) {
    highScore = dealer.total;
  }

  var highestScoreHoldersCount = 0;

  for (var i = 0; i < players.length; i++) {
    var player = players[i]

    if (player.total === highScore) {
      highestScoreHoldersCount++
    }
  }

  if (dealer.total === highScore) {
    highestScoreHoldersCount++
  }

  dealer.result = getResultLabel(
    dealer.total,
    highScore,
    highestScoreHoldersCount
  )

  for (var i = 0; i < players.length; i++) {
    players[i].result = getResultLabel(
      players[i].total,
      highScore,
      highestScoreHoldersCount
    )
  }

  showResultModal();
}

function updateCurrentPlayer() {
  if (currentPlayer <= players.length) {
    $(`#player-${players[currentPlayer - 1].id}-name`).toggleClass('current-player');
  }
}

function resetGame() {
  players = [];
  deck = [];
  currentPlayer = 1;
  isGameOver = false;
  isResultShown = false;
  dealer = {
    id: 0,
    name: 'Dealer',
    hand: [],
    total: 0,
    bust: false,
    stand: false,
    result: ''
  };

  $('#current-player').html('');
  $('#players').html('');
}

function startGame() {
  $('#hit').prop('disabled', false);
  $('#stand').prop('disabled', false);

  resetGame();
  createDeck();
  shuffleDeck();
  createPlayers();
  dealCardsToDealer();
  dealCardsToPlayers();
  updateCurrentPlayer();
}

function hit() {
  updateCurrentPlayer();
  var player = players[currentPlayer - 1];

  if (!player || player.bust || player.stand || isGameOver) {
    return;
  }

  addCardToCurrentPlayer();
  checkPlayerBust(player.id);
  checkGameOver();
}

function stand() {
  updateCurrentPlayer();

  var player = players[currentPlayer - 1];

  if (!player || player.bust || player.stand || isGameOver) {
    return;
  }

  players[currentPlayer - 1].stand = true;

  updateCurrentPlayerId(player.id);

  if (!checkGameOver()) {
    return;
  }

  showGameResult();
}

function showResultModal() {
  var resultHtml = '<ul>';

  resultHtml += `<li>Dealer: ${dealer.result}</li>`

  for (var i = 0; i < players.length; i++) {
    var player = players[i];

    resultHtml += `<li>${player.name}: ${player.result}</li>`
  }

  resultHtml += `</ul>`

  $('#result').html(resultHtml);
  $('#result-modal').show();
}

function hideResultModal() {
  result = '';
  $('#result').html('');
  $('#result-modal').hide();
}

$('#deal').on('click', function () {
  startGame();
});

$('#hit').on('click', function () {
  hit();
});

$('#stand').on('click', function () {
  stand();
});
