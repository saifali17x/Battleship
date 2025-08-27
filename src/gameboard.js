export class Gameboard {
  constructor(size = 10) {
    this.size = size;
    this.board = this.createBoard();
    this.ships = [];
    this.missedAttacks = [];
    this.hitAttacks = [];
  }

  createBoard() {
    const board = [];
    for (let i = 0; i < this.size; i++) {
      board[i] = new Array(this.size).fill(null);
    }
    return board;
  }

  placeShip(ship, startCoord, direction = 'horizontal') {
    const [row, col] = startCoord;

    // Validate placement
    if (!this.isValidPlacement(ship, startCoord, direction)) {
      throw new Error('Invalid ship placement');
    }

    // Place the ship
    const coordinates = [];
    for (let i = 0; i < ship.length; i++) {
      const currentRow = direction === 'horizontal' ? row : row + i;
      const currentCol = direction === 'horizontal' ? col + i : col;

      this.board[currentRow][currentCol] = ship;
      coordinates.push([currentRow, currentCol]);
    }

    // Store ship with its coordinates
    this.ships.push({
      ship,
      coordinates,
      direction,
    });

    return { success: true };
  }

  isValidPlacement(ship, startCoord, direction) {
    const [row, col] = startCoord;

    console.log(
      `Validating placement: ${ship.name} at [${row}, ${col}] in ${direction} direction`
    );

    // Check if ship fits on board
    if (direction === 'horizontal') {
      if (col + ship.length > this.size) {
        console.log(
          `Ship too long for horizontal placement: ${col + ship.length} > ${this.size}`
        );
        return false;
      }
    } else {
      if (row + ship.length > this.size) {
        console.log(
          `Ship too long for vertical placement: ${row + ship.length} > ${this.size}`
        );
        return false;
      }
    }

    // Check if positions are empty
    for (let i = 0; i < ship.length; i++) {
      const currentRow = direction === 'horizontal' ? row : row + i;
      const currentCol = direction === 'horizontal' ? col + i : col;

      if (
        currentRow < 0 ||
        currentRow >= this.size ||
        currentCol < 0 ||
        currentCol >= this.size ||
        this.board[currentRow][currentCol] !== null
      ) {
        console.log(
          `Invalid position: [${currentRow}, ${currentCol}] - out of bounds or occupied`
        );
        return false;
      }
    }

    console.log(`Placement is valid`);
    return true;
  }

  receiveAttack(coordinates) {
    const [row, col] = coordinates;

    // Check if coordinates are valid
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      throw new Error('Invalid coordinates');
    }

    // Check if already attacked
    const alreadyAttacked =
      this.missedAttacks.some(([r, c]) => r === row && c === col) ||
      this.hitAttacks.some(([r, c]) => r === row && c === col);

    if (alreadyAttacked) {
      return { result: 'already-attacked', coordinates };
    }

    const target = this.board[row][col];

    if (target === null) {
      // Miss
      this.missedAttacks.push([row, col]);
      return { result: 'miss', coordinates };
    } else {
      // Hit
      target.hit();
      this.hitAttacks.push([row, col]);

      const result = target.isSunk() ? 'sunk' : 'hit';
      return {
        result,
        coordinates,
        ship: target.isSunk() ? target : null,
      };
    }
  }

  // Backward-compatible method for tests
  receiveAttackLegacy(x, y) {
    try {
      const result = this.receiveAttack([x, y]);
      return result.result;
    } catch (error) {
      return error.message;
    }
  }

  allShipsSunk() {
    return this.ships.every(({ ship }) => ship.isSunk());
  }

  getMissedAttacks() {
    return [...this.missedAttacks];
  }

  getHitAttacks() {
    return [...this.hitAttacks];
  }

  getShipAt(row, col) {
    return this.board[row][col];
  }

  isCoordinateAttacked(row, col) {
    return (
      this.missedAttacks.some(([r, c]) => r === row && c === col) ||
      this.hitAttacks.some(([r, c]) => r === row && c === col)
    );
  }

  getRandomEmptyCoordinate() {
    const availableCoords = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (!this.isCoordinateAttacked(row, col)) {
          availableCoords.push([row, col]);
        }
      }
    }

    if (availableCoords.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCoords.length);
    return availableCoords[randomIndex];
  }
}
