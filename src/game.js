import { Ship } from './ship.js';
import { Gameboard } from './gameboard.js';
import { Player } from './player.js';

export class Game {
  constructor(player1Name, player2Name, isComputerOpponent = false) {
    this.player1 = new Player(player1Name, false);
    this.player2 = new Player(player2Name, isComputerOpponent);
    this.currentTurn = 1; // 1 for player1, 2 for player2
    this.gameActive = true;
  }

  checkGameEnd() {
    if (this.player1.hasLost()) {
      this.gameActive = false;
      return `${this.player2.name} wins!`;
    } else if (this.player2.hasLost()) {
      this.gameActive = false;
      return `${this.player1.name} wins!`;
    }
    return null;
  }

  getCurrentPlayer() {
    return this.currentTurn === 1 ? this.player1 : this.player2;
  }

  getOpponent() {
    return this.currentTurn === 1 ? this.player2 : this.player1;
  }

  switchTurn() {
    this.currentTurn = this.currentTurn === 1 ? 2 : 1;
  }

  makeMove(x, y) {
    // Check if game is already over
    if (!this.gameActive) {
      return 'Game is over';
    }

    const opponent = this.getOpponent();

    // Check if coordinates are valid
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      return 'Invalid coordinates';
    }

    try {
      const result = opponent.gameboard.receiveAttack([x, y]);

      // If invalid move, return early
      if (result.result === 'already-attacked') {
        return 'Already attacked';
      }

      // Check if this move ended the game
      const gameResult = this.checkGameEnd();
      if (gameResult) {
        return gameResult;
      }

      // Switch turns (unless it's a sunk ship, then player gets another turn)
      if (result.result !== 'sunk') {
        this.switchTurn();
      }

      return result.result;
    } catch (error) {
      return 'Invalid coordinates';
    }
  }

  makeComputerMove() {
    if (!this.gameActive || !this.player2.isComputer) {
      return 'Invalid move';
    }

    const coordinates = this.player2.getComputerMove(this.player1.gameboard);
    if (!coordinates) {
      return 'Invalid move';
    }

    const [x, y] = coordinates;
    return this.makeMove(x, y);
  }
}
