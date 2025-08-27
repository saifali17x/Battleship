import { Gameboard } from './gameboard.js';

export class Player {
  constructor(name, isComputer = false) {
    this.name = name;
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
    this.lastHit = null;
    this.targetQueue = []; // For smart AI
  }

  attack(enemyGameboard, coordinates) {
    if (this.isComputer && !coordinates) {
      coordinates = this.getComputerMove(enemyGameboard);
    }

    if (!coordinates) {
      throw new Error('No valid coordinates provided');
    }

    const result = enemyGameboard.receiveAttack(coordinates);

    // Update AI state based on result
    if (this.isComputer) {
      this.updateAIState(result);
    }

    return result;
  }

  getComputerMove(enemyGameboard) {
    // Smart AI: if we have targets in queue, attack them first
    if (this.targetQueue.length > 0) {
      return this.targetQueue.shift();
    }

    // If we just got a hit, add adjacent coordinates to target queue
    if (this.lastHit && this.lastHit.result === 'hit') {
      this.addAdjacentTargets(this.lastHit.coordinates, enemyGameboard);
      if (this.targetQueue.length > 0) {
        return this.targetQueue.shift();
      }
    }

    // Otherwise, make a random move
    return enemyGameboard.getRandomEmptyCoordinate();
  }

  updateAIState(attackResult) {
    this.lastHit = attackResult;

    if (attackResult.result === 'hit') {
      // Add adjacent coordinates to target queue
      this.addAdjacentTargets(attackResult.coordinates, null);
    } else if (attackResult.result === 'sunk') {
      // Clear target queue when ship is sunk
      this.targetQueue = [];
      this.lastHit = null;
    }
  }

  addAdjacentTargets(coordinates, enemyGameboard) {
    const [row, col] = coordinates;
    const adjacentCoords = [
      [row - 1, col], // up
      [row + 1, col], // down
      [row, col - 1], // left
      [row, col + 1], // right
    ];

    adjacentCoords.forEach(([r, c]) => {
      // Check if coordinates are valid and not already targeted
      if (r >= 0 && r < 10 && c >= 0 && c < 10) {
        const alreadyQueued = this.targetQueue.some(
          ([qr, qc]) => qr === r && qc === c
        );
        const alreadyAttacked = enemyGameboard
          ? enemyGameboard.isCoordinateAttacked(r, c)
          : false;

        if (!alreadyQueued && !alreadyAttacked) {
          this.targetQueue.push([r, c]);
        }
      }
    });
  }

  placeShipsRandomly(ShipClass) {
    const shipTypes = [
      'Carrier',
      'Battleship',
      'Cruiser',
      'Destroyer',
      'Submarine',
    ];
    const ships = [];

    shipTypes.forEach((shipType) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const ship = new ShipClass(shipType);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        try {
          this.gameboard.placeShip(ship, [row, col], direction);
          ships.push(ship);
          placed = true;
        } catch (error) {
          attempts++;
        }
      }

      if (!placed) {
        throw new Error(
          `Could not place ${shipType} after ${maxAttempts} attempts`
        );
      }
    });

    return ships;
  }

  hasLost() {
    return this.gameboard.allShipsSunk();
  }
}
