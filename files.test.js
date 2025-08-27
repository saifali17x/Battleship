import { Ship } from './src/ship.js';
import { Gameboard } from './src/gameboard.js';
import { Player } from './src/player.js';

// Mock DOM environment for testing
global.document = {
  createElement: () => ({
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    innerHTML: '',
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {},
    },
    dataset: {},
    style: {},
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: () => {},
};

global.window = {
  addEventListener: () => {},
};

describe('Ship Class', () => {
  test('should create a ship with correct properties', () => {
    const ship = new Ship('Carrier');
    expect(ship.name).toBe('Carrier');
    expect(ship.length).toBe(5);
    expect(ship.hits).toBe(0);
    expect(ship.isSunk()).toBe(false);
  });

  test('should track hits correctly', () => {
    const ship = new Ship('Battleship');
    expect(ship.hits).toBe(0);

    ship.hit();
    expect(ship.hits).toBe(1);
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(4);
    expect(ship.isSunk()).toBe(true);
  });

  test('should return correct health', () => {
    const ship = new Ship('Cruiser');
    expect(ship.health()).toBe(3);

    ship.hit();
    expect(ship.health()).toBe(2);

    ship.hit();
    ship.hit();
    expect(ship.health()).toBe(0);
  });
});

describe('Gameboard Class', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  test('should create an empty gameboard', () => {
    expect(gameboard.board.length).toBe(10);
    expect(gameboard.board[0].length).toBe(10);
    expect(gameboard.ships.length).toBe(0);
  });

  test('should place a ship correctly', () => {
    const ship = new Ship('Carrier');
    const result = gameboard.placeShip(ship, [0, 0], 'horizontal');

    expect(result.success).toBe(true);
    expect(gameboard.ships.length).toBe(1);
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
    expect(gameboard.board[0][3]).toBe(ship);
    expect(gameboard.board[0][4]).toBe(ship);
  });

  test('should reject invalid ship placement', () => {
    const ship = new Ship('Carrier');

    // Try to place ship that goes off the board
    expect(() => {
      gameboard.placeShip(ship, [0, 8], 'horizontal');
    }).toThrow('Invalid ship placement');

    expect(gameboard.ships.length).toBe(0);
  });

  test('should reject overlapping ship placement', () => {
    const ship1 = new Ship('Carrier');
    const ship2 = new Ship('Battleship');

    // Place first ship
    gameboard.placeShip(ship1, [0, 0], 'horizontal');

    // Try to place second ship in overlapping position
    expect(() => {
      gameboard.placeShip(ship2, [0, 2], 'horizontal');
    }).toThrow('Invalid ship placement');

    expect(gameboard.ships.length).toBe(1);
  });

  test('should handle attacks correctly', () => {
    const ship = new Ship('Destroyer');
    gameboard.placeShip(ship, [0, 0], 'horizontal');

    // Attack a ship
    const hitResult = gameboard.receiveAttack([0, 0]);
    expect(hitResult.result).toBe('hit');
    expect(ship.hits).toBe(1);

    // Attack empty space
    const missResult = gameboard.receiveAttack([5, 5]);
    expect(missResult.result).toBe('miss');

    // Attack same position again
    const repeatResult = gameboard.receiveAttack([0, 0]);
    expect(repeatResult.result).toBe('already-attacked');
  });

  test('should detect sunk ships', () => {
    const ship = new Ship('Submarine');
    gameboard.placeShip(ship, [0, 0], 'horizontal');

    const result = gameboard.receiveAttack([0, 0]);
    expect(result.result).toBe('sunk');
    expect(ship.isSunk()).toBe(true);
  });
});

describe('Player Class', () => {
  let player;
  let enemyBoard;

  beforeEach(() => {
    player = new Player('TestPlayer', false);
    enemyBoard = new Gameboard();

    // Place some ships on enemy board for testing
    const ship1 = new Ship('Carrier');
    const ship2 = new Ship('Battleship');
    enemyBoard.placeShip(ship1, [0, 0], 'horizontal');
    enemyBoard.placeShip(ship2, [2, 2], 'horizontal');
  });

  test('should create a player with correct properties', () => {
    expect(player.name).toBe('TestPlayer');
    expect(player.isComputer).toBe(false);
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test('should attack enemy board', () => {
    const result = player.attack(enemyBoard, [0, 0]);
    expect(result.result).toBe('hit');
    expect(result.coordinates).toEqual([0, 0]);
  });

  test('should handle missed attacks', () => {
    const result = player.attack(enemyBoard, [5, 5]);
    expect(result.result).toBe('miss');
    expect(result.coordinates).toEqual([5, 5]);
  });

  test('should not attack same position twice', () => {
    player.attack(enemyBoard, [0, 0]);
    const result = player.attack(enemyBoard, [0, 0]);
    expect(result.result).toBe('already-attacked');
  });

  test('should detect when player has lost', () => {
    // Place a ship on player's board
    const ship = new Ship('Submarine');
    player.gameboard.placeShip(ship, [0, 0], 'horizontal');

    // Sink the ship
    player.gameboard.receiveAttack([0, 0]);

    expect(player.hasLost()).toBe(true);
  });

  test('should detect when player has not lost', () => {
    // Place a ship on player's board
    const ship = new Ship('Carrier');
    player.gameboard.placeShip(ship, [0, 0], 'horizontal');

    // Hit but don't sink the ship
    player.gameboard.receiveAttack([0, 0]);

    expect(player.hasLost()).toBe(false);
  });
});

describe('Computer Player', () => {
  let computerPlayer;
  let enemyBoard;

  beforeEach(() => {
    computerPlayer = new Player('Computer', true);
    enemyBoard = new Gameboard();

    // Place some ships on enemy board for testing
    const ship1 = new Ship('Carrier');
    const ship2 = new Ship('Battleship');
    enemyBoard.placeShip(ship1, [0, 0], 'horizontal');
    enemyBoard.placeShip(ship2, [2, 2], 'horizontal');
  });

  test('should create a computer player', () => {
    expect(computerPlayer.name).toBe('Computer');
    expect(computerPlayer.isComputer).toBe(true);
  });

  test('should make computer attacks', () => {
    const result = computerPlayer.attack(enemyBoard);
    expect(result).toBeDefined();
    expect(result.coordinates).toBeDefined();
    expect(Array.isArray(result.coordinates)).toBe(true);
    expect(result.coordinates.length).toBe(2);
  });

  test('should place ships randomly', () => {
    computerPlayer.placeShipsRandomly(Ship);
    expect(computerPlayer.gameboard.ships.length).toBe(5);
  });
});

describe('Game Logic Integration', () => {
  test('should handle complete game flow', () => {
    const player = new Player('Player', false);
    const computer = new Player('Computer', true);

    // Place ships on both boards
    player.placeShipsRandomly(Ship);
    computer.placeShipsRandomly(Ship);

    expect(player.gameboard.ships.length).toBe(5);
    expect(computer.gameboard.ships.length).toBe(5);

    // Player attacks computer
    const attackResult = player.attack(computer.gameboard, [0, 0]);
    expect(attackResult).toBeDefined();

    // Computer attacks player
    const computerAttack = computer.attack(player.gameboard);
    expect(computerAttack).toBeDefined();
  });

  test('should validate ship placement boundaries', () => {
    const gameboard = new Gameboard();
    const ship = new Ship('Carrier');

    // Test horizontal placement at edge
    expect(() => {
      gameboard.placeShip(ship, [0, 6], 'horizontal');
    }).toThrow('Invalid ship placement');

    // Test vertical placement at edge
    expect(() => {
      gameboard.placeShip(ship, [6, 0], 'vertical');
    }).toThrow('Invalid ship placement');
  });
});
