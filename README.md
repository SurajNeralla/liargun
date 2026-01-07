# 🎲 Liar's Gun - Multiplayer Bluffing Card Game

A real-time multiplayer card game where deception is key and getting caught could cost you your life! Built with HTML, CSS, JavaScript, and Firebase.

## 🎮 Game Overview

**Liar's Gun** is a thrilling bluffing game for 2-4 players set in a gritty bar atmosphere. Each round, players must claim to have specific cards (Kings, Queens, or Aces). But here's the catch - you can lie! If someone calls your bluff and you were lying, you face the Russian roulette with a 1 in 6 chance of elimination. Last player standing wins!

## ✨ Features

- 🎨 **Stunning Bar-Themed UI** with glassmorphism effects and smooth animations
- 🃏 **Dynamic Card System** with realistic dealing animations
- 🎯 **Bluffing Mechanics** - Claim cards you don't have and hope you don't get caught
- 🔫 **Russian Roulette** - 1/6 chance of elimination when caught bluffing
- 🔥 **Real-time Multiplayer** via Firebase Realtime Database
- 🎵 **Sound Effects** for immersive gameplay (add your own audio files)
- 📱 **Responsive Design** works on desktop and mobile
- ⚡ **Smooth Animations** throughout the entire game experience

## 🚀 Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Realtime Database**:
   - Go to Build > Realtime Database
   - Click "Create Database"
   - Start in **test mode** (for development)
4. Get your configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (`</>`)
   - Copy the `firebaseConfig` object
5. Open `firebase-config.js` and replace the placeholder values with your actual Firebase config

### 2. Database Rules (Development)

Set these rules in Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **Important**: For production, implement proper security rules!

### 3. Add Sound Files (Optional)

Place the following MP3 files in the `sounds/` directory:
- `bar-ambience.mp3` - Background atmosphere
- `card-shuffle.mp3` - Card dealing sound
- `card-flip.mp3` - Card reveal
- `bluff-call.mp3` - Dramatic bluff call
- `gun-shot.mp3` - Gun firing
- `gun-click.mp3` - Empty chamber
- `button-click.mp3` - UI interactions
- `player-join.mp3` - Player joined
- `game-start.mp3` - Game beginning

See `sounds/README.md` for where to find free sound effects.

### 4. Run the Game

Simply open `index.html` in a web browser! For the best experience:
- Use a modern browser (Chrome, Firefox, Edge, Safari)
- Open multiple browser windows/tabs to test multiplayer
- Allow audio permissions for sound effects

## 🎯 How to Play

### Lobby Phase
1. **Enter your name**
2. **Create a room** (become host) or **Join a room** (enter room code)
3. Wait for 2-4 players to join
4. Host clicks **Start Game**

### Gameplay Phase
1. Each round has a **table type** (King's, Queen's, or Ace's)
2. Players receive 5 random cards
3. On your turn:
   - **Claim you have the required card** (you can bluff!)
   - OR **Call the previous player's bluff**
4. If a bluff is called:
   - The accused player faces **Russian Roulette**
   - 1/6 chance of being eliminated
   - 5/6 chance of survival
5. **Last player standing wins!**

## 🎨 Game Screens

### Lobby Screen
- Beautiful bar-themed background
- Player name input
- Create/Join room functionality
- Live player list
- Room code display with copy button

### Game Screen
- Round poker table with felt surface
- Players positioned around the table
- Your cards displayed at the bottom
- Turn indicator showing current player
- Action buttons (Claim Card / Call Bluff)

### Roulette Modal
- Dramatic gun animation
- Suspenseful reveal
- Elimination or survival result

### Game Over Screen
- Winner celebration
- Trophy animation
- Return to lobby option

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Realtime Database
- **Fonts**: Google Fonts (Cinzel, Inter)
- **Architecture**: Event-driven with real-time synchronization

## 📁 Project Structure

```
liars-gun/
├── index.html              # Main HTML structure
├── styles.css              # Complete styling with animations
├── game.js                 # Game logic and Firebase integration
├── firebase-config.js      # Firebase configuration
├── sounds/                 # Audio files directory
│   └── README.md          # Sound files guide
└── README.md              # This file
```

## 🎮 Game Logic

### Card System
- Standard 52-card deck
- 5 cards dealt to each player
- Cards include rank (2-A) and suit (♠♥♦♣)

### Bluffing Mechanics
- Players can claim to have cards they don't possess
- Risk vs. reward: bluff to stay in, but risk elimination if caught

### Russian Roulette
- Implemented with `Math.random()` for true 1/6 probability
- Dramatic animation sequence
- Eliminated players remain visible but grayed out

### Turn System
- Round-robin turn order
- Skips eliminated players
- Synchronized across all clients via Firebase

## 🔧 Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --color-amber: #d4a574;
    --color-gold: #ffd700;
    --color-neon-red: #ff2e63;
    /* ... more colors */
}
```

### Adjust Game Rules
Modify constants in `game.js`:
```javascript
const cardsPerPlayer = 5;  // Cards dealt to each player
const maxPlayers = 4;      // Maximum players per room
const rouletteChance = 1/6; // Elimination probability
```

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config in `firebase-config.js`
- Check that Realtime Database is enabled
- Ensure database rules allow read/write access

### Sound Not Playing
- Check browser console for audio errors
- Ensure sound files exist in `sounds/` directory
- Some browsers require user interaction before playing audio

### Players Not Syncing
- Check internet connection
- Verify Firebase database rules
- Check browser console for errors

## 📝 Future Enhancements

- [ ] Add chat system
- [ ] Implement betting/points system
- [ ] Add more card game variants
- [ ] Create AI opponents for single-player
- [ ] Add player statistics and leaderboards
- [ ] Implement proper authentication
- [ ] Add spectator mode

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Credits

Created with ❤️ for card game enthusiasts and bluffing masters!

---

**Ready to play?** Open `index.html` and start bluffing! 🎲🔫
