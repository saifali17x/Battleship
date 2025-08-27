# Battleship Game

A modern, interactive Battleship game built with vanilla JavaScript, featuring drag-and-drop ship placement, beautiful UI, and intelligent computer opponent.

## 🎮 Features

- **Interactive Ship Placement**: Drag and drop ships onto your board with visual feedback
- **Ship Rotation**: Click ships to rotate them before placement
- **Auto Placement**: Let the computer place your ships randomly
- **Real-time Fleet Status**: Track the health of both your fleet and the enemy fleet
- **Smart Computer AI**: Computer opponent with intelligent attack patterns
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Game State Management**: Proper turn-based gameplay with win/lose conditions

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for running tests)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Battleship
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎯 How to Play

### Ship Placement Phase
1. **Manual Placement**: Drag ships from the dock to your board
   - Click ships to rotate them (horizontal/vertical)
   - Green outline shows valid placement
   - Red outline shows invalid placement
2. **Auto Placement**: Click "Auto Place All" to let the computer place your ships

### Gameplay
1. **Your Turn**: Click on the enemy board to attack
2. **Computer Turn**: The computer will automatically make its move
3. **Track Progress**: Monitor both fleet status panels
4. **Win Condition**: Sink all enemy ships before they sink yours

### Game Controls
- **New Game**: Start a fresh game
- **Random Ships**: Auto-place ships and start immediately
- **Clear All**: Remove all placed ships and start over
- **Escape Key**: Close modals

## 🏗️ Project Structure

```
src/
├── index.js          # Main game logic and initialization
├── dom.js            # DOM manipulation and UI management
├── gameboard.js      # Gameboard logic and ship placement
├── ship.js           # Ship class and ship-related logic
├── player.js         # Player class and attack logic
├── game.js           # Game state management
├── styles.css        # All styling and animations
└── template.html     # HTML template
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- Ship creation and health management
- Gameboard ship placement and validation
- Player attack mechanics
- Game state management

## 🎨 Technical Features

### Drag and Drop Implementation
- Custom drag and drop system for ship placement
- Visual feedback with preview outlines
- Collision detection and boundary checking
- Smooth animations and transitions

### Game Logic
- Turn-based gameplay system
- Intelligent computer AI with targeting algorithms
- Proper game state management
- Win/lose condition detection

### UI/UX Design
- Responsive design that works on different screen sizes
- Modern glassmorphism design with backdrop filters
- Smooth animations and hover effects
- Intuitive user interface with clear visual feedback

## 🔧 Development

### Adding New Features
1. Follow the existing code structure
2. Add appropriate tests for new functionality
3. Update the README if needed
4. Ensure the UI remains responsive and accessible

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions focused and modular

## 🐛 Known Issues

- None currently reported

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the classic Battleship board game
- Built with modern web technologies
- Designed for optimal user experience

---

**Enjoy playing Battleship!** 🚢⚓
