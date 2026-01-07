// ===== GAME STATE =====
const gameState = {
    currentScreen: 'lobby',
    playerName: '',
    playerId: '',
    roomCode: '',
    isHost: false,
    players: {},
    gameData: null,
    currentRound: 1,
    currentTurn: 0,
    myCards: [],
    roundType: '', // 'kings', 'queens', 'aces'
    lastRouletteTimestamp: 0
};

// ===== DOM ELEMENTS =====
const elements = {
    // Screens
    lobbyScreen: document.getElementById('lobby-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),

    // Lobby
    playerNameInput: document.getElementById('player-name'),
    createRoomBtn: document.getElementById('create-room-btn'),
    joinRoomBtn: document.getElementById('join-room-btn'),
    roomCodeInput: document.getElementById('room-code-input'),
    roomInfo: document.getElementById('room-info'),
    displayRoomCode: document.getElementById('display-room-code'),
    copyCodeBtn: document.getElementById('copy-code-btn'),
    playersContainer: document.getElementById('players-container'),
    playerCount: document.getElementById('player-count'),
    startGameBtn: document.getElementById('start-game-btn'),
    leaveRoomBtn: document.getElementById('leave-room-btn'),

    // Game
    playerSeats: document.getElementById('player-seats'),
    roundInfo: document.getElementById('round-info'),
    cardsContainer: document.getElementById('cards-container'),
    gameActions: document.getElementById('game-actions'),
    claimCardBtn: document.getElementById('claim-card-btn'),
    callBluffBtn: document.getElementById('call-bluff-btn'),
    turnIndicator: document.getElementById('turn-indicator'),
    turnText: document.getElementById('turn-text'),
    tableSurface: document.querySelector('.poker-table'),

    // Modals
    rouletteModal: document.getElementById('roulette-modal'),
    gunContainer: document.getElementById('gun-container'),
    roulettePlayerName: document.getElementById('roulette-player-name'),
    rouletteResult: document.getElementById('roulette-result'),

    // Game Over
    winnerDisplay: document.getElementById('winner-display'),
    backToLobbyBtn: document.getElementById('back-to-lobby-btn'),

    // Notification
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notification-text'),

    // Audio
    audioBarAmbience: document.getElementById('audio-bar-ambience'),
    audioCardShuffle: document.getElementById('audio-card-shuffle'),
    audioCardFlip: document.getElementById('audio-card-flip'),
    audioBluffCall: document.getElementById('audio-bluff-call'),
    audioGunShot: document.getElementById('audio-gun-shot'),
    audioGunClick: document.getElementById('audio-gun-click'),
    audioButtonClick: document.getElementById('audio-button-click'),
    audioPlayerJoin: document.getElementById('audio-player-join'),
    audioGameStart: document.getElementById('audio-game-start')
};

// ===== CHARACTER AVATARS =====
const CHARACTER_AVATARS = [
    'assets/character-fox.png',
    'assets/character-wolf.png',
    'assets/character-rabbit.png',
    'assets/character-bear.png'
];

const playerCharacters = {}; // Maps playerId to character image

function assignCharacter(playerId) {
    if (!playerCharacters[playerId]) {
        // Assign a random character that hasn't been used yet in this room
        const usedCharacters = Object.values(playerCharacters);
        const availableCharacters = CHARACTER_AVATARS.filter(char => !usedCharacters.includes(char));

        if (availableCharacters.length > 0) {
            playerCharacters[playerId] = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
        } else {
            // If all characters are used, just pick a random one
            playerCharacters[playerId] = CHARACTER_AVATARS[Math.floor(Math.random() * CHARACTER_AVATARS.length)];
        }
    }
    return playerCharacters[playerId];
}

// ===== UTILITY FUNCTIONS =====
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substring(2, 15);
}

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => console.log('Audio play failed:', err));
    }
}

function showNotification(message, duration = 3000) {
    elements.notificationText.textContent = message;
    elements.notification.classList.remove('hidden');
    setTimeout(() => {
        elements.notification.classList.add('hidden');
    }, duration);
}

function switchScreen(screenName) {
    elements.lobbyScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.gameOverScreen.classList.remove('active');

    if (screenName === 'lobby') {
        elements.lobbyScreen.classList.add('active');
    } else if (screenName === 'game') {
        elements.gameScreen.classList.add('active');
    } else if (screenName === 'gameOver') {
        elements.gameOverScreen.classList.add('active');
    }

    gameState.currentScreen = screenName;
}

// ===== CARD FUNCTIONS =====
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['K', 'Q', 'A']; // Only Kings, Queens, and Aces
const JOKER = '🃏'; // Joker symbol

function createDeck() {
    const deck = [];
    // Add K, Q, A for each suit (12 cards total)
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            deck.push({ rank, suit, color: (suit === '♥' || suit === '♦') ? 'red' : 'black', isJoker: false });
        }
    }
    // Add 2 Jokers (wild cards that can be used as any card)
    deck.push({ rank: JOKER, suit: '', color: 'red', isJoker: true });
    deck.push({ rank: JOKER, suit: '', color: 'black', isJoker: true });
    return deck; // Total: 14 cards
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCards(numPlayers) {
    const deck = shuffleDeck(createDeck());
    const hands = {};
    const cardsPerPlayer = 5;

    let cardIndex = 0;
    const playerIds = Object.keys(gameState.players);

    for (let playerId of playerIds) {
        hands[playerId] = [];
        for (let i = 0; i < cardsPerPlayer; i++) {
            hands[playerId].push(deck[cardIndex++]);
        }
    }

    return hands;
}

function getRoundType() {
    const types = ['K', 'Q', 'A'];
    return types[Math.floor(Math.random() * types.length)];
}

function getRoundTypeName(type) {
    const names = { 'K': "King's Table", 'Q': "Queen's Table", 'A': "Ace's Table" };
    return names[type] || "King's Table";
}

// ===== LOBBY FUNCTIONS =====
function createRoom() {
    const playerName = elements.playerNameInput.value.trim();
    if (!playerName) {
        showNotification('Please enter your name!');
        return;
    }

    playSound(elements.audioButtonClick);
    gameState.playerName = playerName;
    gameState.playerId = generatePlayerId();
    gameState.roomCode = generateRoomCode();
    gameState.isHost = true;

    const roomData = {
        host: gameState.playerId,
        status: 'waiting',
        players: {
            [gameState.playerId]: {
                name: playerName,
                isHost: true,
                eliminated: false
            }
        },
        createdAt: Date.now()
    };

    db.ref('rooms/' + gameState.roomCode).set(roomData).then(() => {
        showNotification('Room created successfully!');
        elements.displayRoomCode.textContent = gameState.roomCode;
        elements.roomInfo.classList.remove('hidden');
        elements.createRoomBtn.style.display = 'none';
        elements.joinRoomBtn.style.display = 'none';
        elements.roomCodeInput.style.display = 'none';
        elements.playerNameInput.disabled = true;
        elements.startGameBtn.classList.remove('hidden');

        listenToRoom();
    }).catch(err => {
        showNotification('Error creating room: ' + err.message);
    });
}

function joinRoom() {
    const playerName = elements.playerNameInput.value.trim();
    const roomCode = elements.roomCodeInput.value.trim().toUpperCase();

    if (!playerName) {
        showNotification('Please enter your name!');
        return;
    }

    if (!roomCode) {
        showNotification('Please enter a room code!');
        return;
    }

    playSound(elements.audioButtonClick);

    db.ref('rooms/' + roomCode).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            showNotification('Room not found!');
            return;
        }

        const roomData = snapshot.val();
        if (roomData.status !== 'waiting') {
            showNotification('Game already in progress!');
            return;
        }

        const playerCount = Object.keys(roomData.players || {}).length;
        if (playerCount >= 4) {
            showNotification('Room is full!');
            return;
        }

        gameState.playerName = playerName;
        gameState.playerId = generatePlayerId();
        gameState.roomCode = roomCode;
        gameState.isHost = false;

        db.ref('rooms/' + roomCode + '/players/' + gameState.playerId).set({
            name: playerName,
            isHost: false,
            eliminated: false
        }).then(() => {
            showNotification('Joined room successfully!');
            playSound(elements.audioPlayerJoin);
            elements.displayRoomCode.textContent = roomCode;
            elements.roomInfo.classList.remove('hidden');
            elements.createRoomBtn.style.display = 'none';
            elements.joinRoomBtn.style.display = 'none';
            elements.roomCodeInput.style.display = 'none';
            elements.playerNameInput.disabled = true;

            listenToRoom();
        });
    }).catch(err => {
        showNotification('Error joining room: ' + err.message);
    });
}

function leaveRoom() {
    if (!gameState.roomCode) return;

    playSound(elements.audioButtonClick);

    db.ref('rooms/' + gameState.roomCode + '/players/' + gameState.playerId).remove().then(() => {
        if (gameState.isHost) {
            db.ref('rooms/' + gameState.roomCode).remove();
        }

        resetGameState();
        showNotification('Left room');
    });
}

function listenToRoom() {
    const roomRef = db.ref('rooms/' + gameState.roomCode);

    roomRef.on('value', snapshot => {
        if (!snapshot.exists()) {
            if (gameState.currentScreen === 'lobby') {
                showNotification('Room closed by host');
                resetGameState();
            }
            return;
        }

        const roomData = snapshot.val();
        gameState.players = roomData.players || {};

        updatePlayersList();

        if (roomData.status === 'playing' && gameState.currentScreen === 'lobby') {
            startGameplay(roomData);
        } else if (roomData.status === 'gameOver' && gameState.currentScreen === 'game') {
            showGameOver(roomData.winner);
        }

        if (roomData.gameState) {
            updateGameState(roomData.gameState);

            // Listen for roulette events
            if (roomData.gameState.lastRoulette && (!gameState.lastRouletteTimestamp || roomData.gameState.lastRoulette.timestamp > gameState.lastRouletteTimestamp)) {
                gameState.lastRouletteTimestamp = roomData.gameState.lastRoulette.timestamp;
                const { targetName, survived, targetId } = roomData.gameState.lastRoulette;
                showRouletteModal(targetName, survived, targetId);
            }
        }
    });
}

function updatePlayersList() {
    elements.playersContainer.innerHTML = '';
    const playerCount = Object.keys(gameState.players).length;
    elements.playerCount.textContent = `(${playerCount}/4)`;

    for (let playerId in gameState.players) {
        const player = gameState.players[playerId];
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item' + (player.isHost ? ' host' : '');

        const avatar = document.createElement('div');
        avatar.className = 'player-avatar';
        avatar.textContent = player.name.charAt(0).toUpperCase();

        const name = document.createElement('div');
        name.className = 'player-name';
        name.textContent = player.name;

        playerItem.appendChild(avatar);
        playerItem.appendChild(name);

        if (player.isHost) {
            const badge = document.createElement('div');
            badge.className = 'player-badge';
            badge.textContent = 'HOST';
            playerItem.appendChild(badge);
        }

        elements.playersContainer.appendChild(playerItem);
    }
}

function startGame() {
    const playerCount = Object.keys(gameState.players).length;
    if (playerCount < 2) {
        showNotification('Need at least 2 players to start!');
        return;
    }

    playSound(elements.audioGameStart);

    const hands = dealCards(playerCount);
    const roundType = getRoundType();
    const playerIds = Object.keys(gameState.players);

    const gameData = {
        status: 'playing',
        gameState: {
            round: 1,
            roundType: roundType,
            currentTurn: 0,
            playerOrder: playerIds,
            hands: hands,
            lastClaim: null,
            eliminated: {}
        }
    };

    db.ref('rooms/' + gameState.roomCode).update(gameData);
}

function resetGameState() {
    gameState.roomCode = '';
    gameState.isHost = false;
    gameState.players = {};

    elements.roomInfo.classList.add('hidden');
    elements.createRoomBtn.style.display = '';
    elements.joinRoomBtn.style.display = '';
    elements.roomCodeInput.style.display = '';
    elements.roomCodeInput.value = '';
    elements.playerNameInput.disabled = false;
    elements.playerNameInput.value = '';
    elements.startGameBtn.classList.add('hidden');

    switchScreen('lobby');
}

// ===== GAME FUNCTIONS =====
function startGameplay(roomData) {
    playSound(elements.audioCardShuffle);
    switchScreen('game');

    const gameData = roomData.gameState;
    gameState.myCards = gameData.hands[gameState.playerId] || [];
    gameState.roundType = gameData.roundType;
    gameState.currentRound = gameData.round;
    gameState.lastRouletteTimestamp = Date.now(); // Ignore any stale events from previous games

    renderPlayerSeats();
    renderMyCards();
    updateRoundInfo();
    updateTurnIndicator(gameData);
}

function renderPlayerSeats() {
    elements.playerSeats.innerHTML = '';
    const playerIds = Object.keys(gameState.players);
    const numPlayers = playerIds.length;

    playerIds.forEach((playerId, index) => {
        const player = gameState.players[playerId];
        const seat = document.createElement('div');
        seat.className = 'player-seat';
        seat.id = 'seat-' + playerId;

        const angle = (360 / numPlayers) * index - 90;
        const radius = 45;
        const x = 50 + radius * Math.cos(angle * Math.PI / 180);
        const y = 50 + radius * Math.sin(angle * Math.PI / 180);

        seat.style.left = x + '%';
        seat.style.top = y + '%';
        seat.style.transform = 'translate(-50%, -50%)';

        const avatar = document.createElement('div');
        avatar.className = 'seat-avatar';
        const characterImage = assignCharacter(playerId);
        avatar.style.backgroundImage = `url('${characterImage}')`;
        avatar.title = player.name;

        const name = document.createElement('div');
        name.className = 'seat-name';
        name.textContent = player.name;

        seat.appendChild(avatar);
        seat.appendChild(name);
        elements.playerSeats.appendChild(seat);
    });
}

function renderMyCards() {
    elements.cardsContainer.innerHTML = '';

    gameState.myCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card ' + card.color;
        cardEl.dataset.cardIndex = index;

        const rank = document.createElement('div');
        rank.className = 'card-rank';
        rank.textContent = card.rank;

        const suit = document.createElement('div');
        suit.className = 'card-suit';
        suit.textContent = card.suit;

        cardEl.appendChild(rank);
        cardEl.appendChild(suit);

        // Add click handler to card
        cardEl.addEventListener('click', () => handleCardClick(card, index));

        elements.cardsContainer.appendChild(cardEl);
    });

    playSound(elements.audioCardFlip);
}

function handleCardClick(card, cardIndex) {
    db.ref('rooms/' + gameState.roomCode + '/gameState').once('value').then(snapshot => {
        const gameData = snapshot.val();
        if (!gameData) return;

        const currentPlayerId = gameData.playerOrder[gameData.currentTurn];
        const isMyTurn = currentPlayerId === gameState.playerId;
        const isEliminated = gameData.eliminated && gameData.eliminated[gameState.playerId];

        if (isEliminated) return;

        // CARD CLICK ALWAYS CLAIMS (if it's your turn)
        if (isMyTurn) {
            claimCard(card, cardIndex);
            return;
        } else {
            showNotification('Wait for your turn to play!');
        }
    });
}

function updateRoundInfo() {
    const roundTypeEl = elements.roundInfo.querySelector('.round-type');
    const roundNumberEl = elements.roundInfo.querySelector('.round-number');

    roundTypeEl.textContent = getRoundTypeName(gameState.roundType);
    roundNumberEl.textContent = 'Round ' + gameState.currentRound;
}

function updateGameState(gameData) {
    const playerOrder = gameData.playerOrder;
    const currentPlayerId = playerOrder[gameData.currentTurn];

    document.querySelectorAll('.player-seat').forEach(seat => {
        seat.classList.remove('active');
    });

    const currentSeat = document.getElementById('seat-' + currentPlayerId);
    if (currentSeat) {
        currentSeat.classList.add('active');
    }

    Object.keys(gameData.eliminated || {}).forEach(playerId => {
        const seat = document.getElementById('seat-' + playerId);
        if (seat) {
            seat.classList.add('eliminated');
        }
    });

    updateTurnIndicator(gameData);

    const isMyTurn = currentPlayerId === gameState.playerId;
    const isEliminated = gameData.eliminated && gameData.eliminated[gameState.playerId];
    const hasClaim = !!gameData.lastClaim;
    const isMyClaim = hasClaim && gameData.lastClaim.playerId === gameState.playerId;

    // Show "Call Bluff" button to everyone except the person who made the claim
    if (hasClaim && !isMyClaim && !isEliminated) {
        elements.gameActions.classList.remove('hidden');
        elements.claimCardBtn.classList.add('hidden');
        elements.callBluffBtn.classList.remove('hidden');
    } else {
        elements.gameActions.classList.add('hidden');
    }
}

function updateTurnIndicator(gameData) {
    const playerOrder = gameData.playerOrder;
    const currentPlayerId = playerOrder[gameData.currentTurn];
    const currentPlayer = gameState.players[currentPlayerId];

    if (currentPlayer) {
        if (currentPlayerId === gameState.playerId) {
            elements.turnText.textContent = "Your Turn!";
        } else {
            elements.turnText.textContent = currentPlayer.name + "'s Turn";
        }
        elements.turnIndicator.classList.remove('hidden');
    }
}

function claimCard(card, cardIndex) {
    playSound(elements.audioButtonClick);

    // Check IF THE SPECIFIC CARD is the required one
    const isTruth = card.rank === gameState.roundType || card.isJoker;

    // Remove card from player's hand in Firebase
    const updatedCards = [...gameState.myCards];
    updatedCards.splice(cardIndex, 1);

    const updates = {};
    updates['rooms/' + gameState.roomCode + '/gameState/hands/' + gameState.playerId] = updatedCards;
    updates['rooms/' + gameState.roomCode + '/gameState/lastClaim'] = {
        playerId: gameState.playerId,
        playerName: gameState.playerName,
        hasCard: isTruth,
        timestamp: Date.now()
    };

    // Clean up any stale roulette event before making a new claim
    if (gameState.isHost) {
        db.ref('rooms/' + gameState.roomCode + '/gameState/lastRoulette').remove();
    }

    db.ref().update(updates).then(() => {
        // If hand empty, redeal
        if (updatedCards.length === 0) {
            redealHand(gameState.playerId);
        }
        nextTurn();
    });
}

function redealHand(playerId) {
    const deck = shuffleDeck(createDeck());
    const newHand = [];
    for (let i = 0; i < 5; i++) {
        newHand.push(deck[i]);
    }
    db.ref('rooms/' + gameState.roomCode + '/gameState/hands/' + playerId).set(newHand);
    showNotification('New hand dealt!');
}

function callBluff() {
    // Only proceed if there is a claim to challenge
    db.ref('rooms/' + gameState.roomCode + '/gameState/lastClaim').once('value').then(snapshot => {
        if (!snapshot.exists()) return;

        playSound(elements.audioBluffCall);
        const claim = snapshot.val();

        // Clear claim immediately to prevent others from calling it
        db.ref('rooms/' + gameState.roomCode + '/gameState/lastClaim').remove();

        const wasBluffing = !claim.hasCard;
        const clamerId = claim.playerId;
        const callerId = gameState.playerId;
        const callerName = gameState.playerName;

        // Determine target
        const targetId = wasBluffing ? clamerId : callerId;
        const targetName = wasBluffing ? claim.playerName : callerName;

        // Calculate and broadcast result
        const survived = Math.random() > (1 / 6);

        db.ref('rooms/' + gameState.roomCode + '/gameState/lastRoulette').set({
            targetId,
            targetName,
            survived,
            timestamp: Date.now()
        });
    });
}

function showRouletteModal(playerName, survived, targetId) {
    elements.roulettePlayerName.textContent = playerName;
    elements.rouletteResult.classList.add('hidden');
    elements.rouletteModal.classList.add('active');

    // Reset animations
    const gun = elements.gunContainer.querySelector('.gun');
    if (gun) gun.classList.remove('shoot');
    elements.gunContainer.classList.remove('flash');

    setTimeout(() => {
        if (survived) {
            playSound(elements.audioGunClick);
            elements.rouletteResult.textContent = '💨 Click! Survived!';
            elements.rouletteResult.className = 'roulette-result survived';
        } else {
            playSound(elements.audioGunShot);

            // Add gun shoot animation
            if (gun) gun.classList.add('shoot');

            // Add muzzle flash
            elements.gunContainer.classList.add('flash');

            // Add screen shake effect
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 500);

            elements.rouletteResult.textContent = '💀 BANG! Eliminated!';
            elements.rouletteResult.className = 'roulette-result eliminated';

            // Targeted player or host updates elimination
            if (gameState.isHost) {
                db.ref('rooms/' + gameState.roomCode + '/gameState/eliminated/' + targetId).set(true);
            }
        }

        elements.rouletteResult.classList.remove('hidden');

        setTimeout(() => {
            elements.rouletteModal.classList.remove('active');
            elements.gunContainer.classList.remove('flash');
            if (gun) gun.classList.remove('shoot');

            if (gameState.isHost) {
                // Clear the event FIRST before triggering next turn
                db.ref('rooms/' + gameState.roomCode + '/gameState/lastRoulette').remove().then(() => {
                    checkWinCondition();
                    nextTurn();
                });
            }
        }, 3000);
    }, 2000);
}

function nextTurn() {
    db.ref('rooms/' + gameState.roomCode + '/gameState').once('value').then(snapshot => {
        const gameData = snapshot.val();
        const playerOrder = gameData.playerOrder;
        const eliminated = gameData.eliminated || {};

        let nextTurn = (gameData.currentTurn + 1) % playerOrder.length;

        while (eliminated[playerOrder[nextTurn]] && nextTurn !== gameData.currentTurn) {
            nextTurn = (nextTurn + 1) % playerOrder.length;
        }

        db.ref('rooms/' + gameState.roomCode + '/gameState/currentTurn').set(nextTurn);
    });
}

function checkWinCondition() {
    db.ref('rooms/' + gameState.roomCode + '/gameState').once('value').then(snapshot => {
        const gameData = snapshot.val();
        const playerOrder = gameData.playerOrder;
        const eliminated = gameData.eliminated || {};

        const alivePlayers = playerOrder.filter(id => !eliminated[id]);

        if (alivePlayers.length === 1) {
            const winnerId = alivePlayers[0];
            const winner = gameState.players[winnerId];

            db.ref('rooms/' + gameState.roomCode).update({
                status: 'gameOver',
                winner: winner.name
            });
        }
    });
}

function showGameOver(winnerName) {
    switchScreen('gameOver');
    elements.winnerDisplay.querySelector('.winner-name').textContent = winnerName;
}

// ===== EVENT LISTENERS =====
elements.createRoomBtn.addEventListener('click', createRoom);
elements.joinRoomBtn.addEventListener('click', joinRoom);
elements.leaveRoomBtn.addEventListener('click', leaveRoom);
elements.startGameBtn.addEventListener('click', startGame);
elements.claimCardBtn.addEventListener('click', claimCard);
elements.callBluffBtn.addEventListener('click', callBluff);

// Add table surface click to call bluff
if (elements.tableSurface) {
    elements.tableSurface.addEventListener('click', () => {
        callBluff();
    });
}
elements.backToLobbyBtn.addEventListener('click', () => {
    playSound(elements.audioButtonClick);
    leaveRoom();
});

elements.copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(gameState.roomCode).then(() => {
        showNotification('Room code copied!');
        playSound(elements.audioButtonClick);
    });
});

elements.playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createRoom();
    }
});

elements.roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
});

// Start background ambience
window.addEventListener('load', () => {
    elements.audioBarAmbience.volume = 0.3;
    document.addEventListener('click', () => {
        playSound(elements.audioBarAmbience);
    }, { once: true });
});

console.log('🎲 Liar\'s Gun - Game loaded successfully!');
