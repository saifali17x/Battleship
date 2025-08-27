import './styles.css';
import { Ship } from './ship.js';
import { Gameboard } from './gameboard.js';
import { Player } from './player.js';
import { DOMController } from './dom.js';

class BattleshipGame {
  constructor() {
    this.dom = new DOMController();
    this.player = null;
    this.computer = null;
    this.currentTurn = 'player';
    this.gameStarted = false;
  }

  init() {
    const gameContainer = document.getElementById('game-container');
    this.dom.initialize(gameContainer);

    this.setupCallbacks();
    this.showWelcomeMessage();
  }

  setupCallbacks() {
    this.dom.setCallbacks({
      onCellClick: (row, col) => this.handlePlayerAttack(row, col),
      onNewGame: () => this.startNewGame(),
      onRandomPlacement: () => this.placeShipsRandomly(),
      onShipPlacement: (row, col, direction, shipType) =>
        this.handleShipPlacement(row, col, direction, shipType),
    });
  }

  showWelcomeMessage() {
    this.dom.showMessage(
      'Welcome to Battleship! Click "New Game" to begin.',
      'info'
    );
  }

  startNewGame() {
    this.player = new Player('Human', false);
    this.computer = new Player('Computer', true);
    this.currentTurn = 'player';
    this.gameStarted = false;

    this.dom.setPlayers(this.player, this.computer);
    this.dom.reset();

    // Place computer ships randomly
    this.computer.placeShipsRandomly(Ship);

    // Start ship placement for player
    this.dom.startShipPlacement();
    this.dom.showMessage(
      'Place your ships on the board. Click to place, press R to rotate.',
      'info'
    );
  }

  placeShipsRandomly() {
    try {
      console.log('Starting random ship placement...');

      // Clear existing ships
      this.player = new Player('Human', false);
      this.player.placeShipsRandomly(Ship);

      console.log('Ships placed randomly:', this.player.gameboard.ships.length);

      this.dom.setPlayers(this.player, this.computer);

      // Update the placement board to show the randomly placed ships
      this.dom.renderBoard(
        this.player.gameboard,
        this.dom.placementBoardContainer,
        true
      );

      // Mark all ships as placed in the UI
      const shipItems = document.querySelectorAll('.ship-item');
      shipItems.forEach((item) => {
        item.classList.add('placed');
      });

      console.log('Finishing ship placement...');
      // Finish placement and start game
      this.dom.finishShipPlacement();

      console.log('Starting game...');
      this.startGame();

      console.log('Game started successfully');
    } catch (error) {
      console.error('Error in placeShipsRandomly:', error);
      this.dom.showMessage('Error placing ships randomly. Try again.', 'error');
    }
  }

  handleShipPlacement(row, col, direction, shipType = null) {
    // For drag and drop, we receive the ship type directly
    // For click placement, we need to determine which ship is being placed
    const shipTypes = [
      'Carrier',
      'Battleship',
      'Cruiser',
      'Destroyer',
      'Submarine',
    ];

    // If shipType is not provided (click placement), find the next unplaced ship
    if (!shipType) {
      for (const type of shipTypes) {
        const isPlaced = this.player.gameboard.ships.some(
          ({ ship }) => ship.name === type
        );
        if (!isPlaced) {
          shipType = type;
          break;
        }
      }
    }

    if (!shipType) {
      return { success: false, error: 'All ships already placed' };
    }

    // Check if this specific ship type is already placed
    const isAlreadyPlaced = this.player.gameboard.ships.some(
      ({ ship }) => ship.name === shipType
    );

    if (isAlreadyPlaced) {
      return { success: false, error: `${shipType} is already placed` };
    }

    try {
      const ship = new Ship(shipType);
      console.log(
        `Attempting to place ${shipType} at [${row}, ${col}] in ${direction} direction`
      );

      const result = this.player.gameboard.placeShip(
        ship,
        [row, col],
        direction
      );

      console.log(`Ship placement result:`, result);

      // Update the display to show the placed ship
      this.updateDisplay();

      // Check if all ships are placed
      const placedShips = this.player.gameboard.ships.length;
      if (placedShips === 5) {
        this.startGame();
      }

      return { success: true };
    } catch (error) {
      console.error(`Ship placement error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  startGame() {
    console.log('startGame called, setting gameStarted to true');
    this.gameStarted = true;
    this.currentTurn = 'player'; // Ensure it's player's turn

    this.dom.createBoard(this.dom.playerBoardContainer, true, false);
    this.dom.createBoard(this.dom.enemyBoardContainer, false, true);

    this.updateDisplay();
    this.dom.showMessage(
      'Game started! Click on the enemy board to attack!',
      'success'
    );

    console.log('Game state:', {
      gameStarted: this.gameStarted,
      currentTurn: this.currentTurn,
    });
  }

  handlePlayerAttack(row, col) {
    console.log('handlePlayerAttack called:', {
      row,
      col,
      gameStarted: this.gameStarted,
      currentTurn: this.currentTurn,
    });
    if (!this.gameStarted || this.currentTurn !== 'player') {
      console.log('Attack blocked:', {
        gameStarted: this.gameStarted,
        currentTurn: this.currentTurn,
      });
      return;
    }

    try {
      const result = this.player.attack(this.computer.gameboard, [row, col]);

      if (result.result === 'already-attacked') {
        this.dom.showMessage('You already attacked that position!', 'error');
        return;
      }

      this.processAttackResult(result, 'player');

      if (this.checkGameOver()) {
        return;
      }

      // Switch to computer turn
      this.currentTurn = 'computer';

      // Make computer move instantly
      this.handleComputerAttack();
    } catch (error) {
      this.dom.showMessage(error.message, 'error');
    }
  }

  handleComputerAttack() {
    if (!this.gameStarted || this.currentTurn !== 'computer') {
      return;
    }

    try {
      const result = this.computer.attack(this.player.gameboard);

      if (!result) {
        this.dom.showMessage('Computer has no valid moves!', 'error');
        return;
      }

      this.processAttackResult(result, 'computer');

      if (this.checkGameOver()) {
        return;
      }

      // Switch back to player turn
      this.currentTurn = 'player';
      this.dom.showMessage(
        'Your turn! Click on the enemy board to attack.',
        'info'
      );
    } catch (error) {
      this.dom.showMessage('Computer attack error: ' + error.message, 'error');
      this.currentTurn = 'player';
    }
  }

  processAttackResult(result, attacker) {
    const { coordinates, result: attackResult, ship } = result;
    const [row, col] = coordinates;

    let message = '';

    switch (attackResult) {
      case 'hit':
        message = `${attacker === 'player' ? 'Hit' : 'Computer hit your ship'}!`;
        break;
      case 'miss':
        message = `${attacker === 'player' ? 'Miss' : 'Computer missed'}!`;
        break;
      case 'sunk':
        message = `${attacker === 'player' ? 'You sunk' : 'Computer sunk your'} ${ship.name}!`;
        break;
    }

    this.dom.showMessage(message, attackResult === 'miss' ? 'info' : 'success');
    this.updateDisplay();
  }

  checkGameOver() {
    if (this.player.hasLost()) {
      this.endGame('Computer', 'All your ships have been sunk!');
      return true;
    } else if (this.computer.hasLost()) {
      this.endGame('Player', 'You sunk all enemy ships!');
      return true;
    }
    return false;
  }

  endGame(winner, message) {
    this.gameStarted = false;
    this.dom.showGameOver(winner, message);
  }

  updateDisplay() {
    // Update both boards
    this.dom.renderBoard(
      this.player.gameboard,
      this.dom.playerBoardContainer,
      true
    );
    this.dom.renderBoard(
      this.computer.gameboard,
      this.dom.enemyBoardContainer,
      false
    );

    // Update ship status for both fleets
    this.dom.updateShipStatus(this.player, false); // Player fleet
    this.dom.updateShipStatus(this.computer, true); // Enemy fleet
  }

  startShipPlacement() {
    this.currentTurn = 'placing';
    this.dom.showShipPlacementSection();

    // Set up the ship placement callback for drag and drop
    this.dom.onShipPlacement = (row, col, direction, shipType) => {
      return this.handleShipPlacement(row, col, direction, shipType);
    };

    this.dom.renderBoard(
      this.player.gameboard,
      this.dom.playerBoardContainer,
      true
    );
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new BattleshipGame();
  game.init();
});
