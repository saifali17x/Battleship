import { Gameboard } from './gameboard.js';

export class DOMController {
  constructor() {
    this.gameContainer = null;
    this.playerBoardContainer = null;
    this.enemyBoardContainer = null;
    this.messageContainer = null;
    this.gameOverModal = null;
    this.shipPlacementModal = null;
    this.currentPlayer = null;
    this.enemy = null;
    this.gameOver = false;
    this.onCellClick = null;
    this.onNewGame = null;
    this.onRandomPlacement = null;
    this.isPlacingShips = false;
    this.currentShipIndex = 0;
    this.shipTypes = [
      'Carrier',
      'Battleship',
      'Cruiser',
      'Destroyer',
      'Submarine',
    ];
    this.currentDirection = 'horizontal';
  }

  initialize(container) {
    this.gameContainer = container;
    this.createGameLayout();
    this.setupEventListeners();
  }

  createGameLayout() {
    this.gameContainer.innerHTML = `
      <div class="game-header">
        <h1>Battleship Game</h1>
        <div class="controls">
          <button id="new-game-btn" class="btn btn-primary">New Game</button>
          <button id="random-placement-btn" class="btn btn-secondary">Random Ships</button>
        </div>
      </div>
      
      <!-- Ship Placement Section -->
      <div id="ship-placement-section" class="ship-placement-section hidden">
        <div class="placement-header">
          <h2>Place Your Ships</h2>
          <p>Drag ships from the dock to your board. Click ships to rotate them before placing.</p>
        </div>
        
        <div class="placement-layout">
          <!-- Ship Dock -->
          <div class="ship-dock">
            <h3>Ship Dock</h3>
            <div class="ship-items">
              <div class="ship-item" data-ship="Carrier" draggable="true">
                <div class="ship-preview horizontal">
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                </div>
                <span class="ship-name">Carrier (5)</span>
              </div>
              
              <div class="ship-item" data-ship="Battleship" draggable="true">
                <div class="ship-preview horizontal">
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                </div>
                <span class="ship-name">Battleship (4)</span>
              </div>
              
              <div class="ship-item" data-ship="Cruiser" draggable="true">
                <div class="ship-preview horizontal">
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                </div>
                <span class="ship-name">Cruiser (3)</span>
              </div>
              
              <div class="ship-item" data-ship="Destroyer" draggable="true">
                <div class="ship-preview horizontal">
                  <div class="ship-segment"></div>
                  <div class="ship-segment"></div>
                </div>
                <span class="ship-name">Destroyer (2)</span>
              </div>
              
              <div class="ship-item" data-ship="Submarine" draggable="true">
                <div class="ship-preview horizontal">
                  <div class="ship-segment"></div>
                </div>
                <span class="ship-name">Submarine (1)</span>
              </div>
            </div>
            
            <div class="placement-controls">
              <button id="auto-place-btn" class="btn btn-secondary">Auto Place All</button>
              <button id="clear-ships-btn" class="btn btn-secondary">Clear All</button>
            </div>
          </div>
          
          <!-- Player Board for Placement -->
          <div class="placement-board-section">
            <h3>Your Board</h3>
            <div id="placement-board" class="game-board"></div>
          </div>
        </div>
      </div>
      
      <!-- Game Boards (shown after placement) -->
      <div id="game-boards" class="game-boards hidden">
        <div class="board-section">
          <h2>Your Fleet</h2>
          <div id="player-board" class="game-board"></div>
          <div id="player-ship-status" class="ship-status"></div>
        </div>
        
        <div class="board-section">
          <h2>Enemy Waters</h2>
          <div id="enemy-board" class="game-board"></div>
          <div id="enemy-ship-status" class="ship-status"></div>
        </div>
      </div>
      
      <div id="message-container" class="message-container">
        <p>Click "New Game" to start playing!</p>
      </div>

      <!-- Game Over Modal -->
      <div id="game-over-modal" class="modal hidden">
        <div class="modal-content">
          <h3 id="game-over-title">Game Over!</h3>
          <p id="game-over-message">You won!</p>
          <button id="play-again-btn" class="btn btn-primary">Play Again</button>
        </div>
      </div>
    `;

    this.playerBoardContainer = document.getElementById('player-board');
    this.enemyBoardContainer = document.getElementById('enemy-board');
    this.placementBoardContainer = document.getElementById('placement-board');
    this.messageContainer = document.getElementById('message-container');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.shipPlacementSection = document.getElementById(
      'ship-placement-section'
    );
    this.gameBoardsSection = document.getElementById('game-boards');
  }

  setupEventListeners() {
    // New Game button
    document.getElementById('new-game-btn').addEventListener('click', () => {
      if (this.onNewGame) this.onNewGame();
    });

    // Random placement button
    document
      .getElementById('random-placement-btn')
      .addEventListener('click', () => {
        if (this.onRandomPlacement) this.onRandomPlacement();
      });

    // Play again button
    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.hideModal(this.gameOverModal);
      if (this.onNewGame) this.onNewGame();
    });

    // Auto place button
    document.getElementById('auto-place-btn').addEventListener('click', () => {
      if (this.onRandomPlacement) this.onRandomPlacement();
    });

    // Clear ships button
    document.getElementById('clear-ships-btn').addEventListener('click', () => {
      this.clearAllShips();
    });

    // Setup drag and drop for ship items
    this.setupDragAndDrop();

    // Escape key to close game over modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal:not(.hidden)');
        if (visibleModal) {
          this.hideModal(visibleModal);
        }
      }
    });
  }

  setupDragAndDrop() {
    // Ship item drag events
    document.addEventListener('dragstart', (e) => {
      // Find the ship-item container (could be the target or a parent)
      const shipItem = e.target.closest('.ship-item');
      if (shipItem && !shipItem.classList.contains('placed')) {
        console.log('Drag started for ship:', shipItem.dataset.ship);
        shipItem.classList.add('dragging');
        e.dataTransfer.setData('text/plain', shipItem.dataset.ship);
        e.dataTransfer.effectAllowed = 'move';
        // Don't stop propagation - let other events work
      }
    });

    document.addEventListener('dragend', (e) => {
      const shipItem = e.target.closest('.ship-item');
      if (shipItem) {
        shipItem.classList.remove('dragging');
        // Clear any drag preview
        this.clearDragPreview();
      }
    });

    // Global drag event to handle drag cancellation
    document.addEventListener('drag', (e) => {
      // If dragging outside the modal area, allow the modal to be closed
      const shipItem = e.target.closest('.ship-item');
      if (shipItem) {
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) {
          // Ensure the modal can still be interacted with during drag
          modal.style.pointerEvents = 'auto';
        }
      }
    });

    // Global event to handle drag cancellation when clicking outside
    document.addEventListener('mousedown', (e) => {
      const draggingElement = document.querySelector('.dragging');
      if (draggingElement) {
        // If clicking outside the modal while dragging, cancel the drag
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal && !modal.contains(e.target)) {
          draggingElement.classList.remove('dragging');
          this.clearDragPreview();
        }
      }
    });

    // Ship item click to rotate (but not when dragging)
    document.addEventListener('click', (e) => {
      if (
        e.target.closest('.ship-item') &&
        !e.target.closest('.ship-item').classList.contains('placed') &&
        !e.target.closest('.ship-item').classList.contains('dragging')
      ) {
        const shipItem = e.target.closest('.ship-item');
        const preview = shipItem.querySelector('.ship-preview');
        preview.classList.toggle('horizontal');
        preview.classList.toggle('vertical');
      }
    });

    // Board drop events
    document.addEventListener('dragover', (e) => {
      if (e.target.classList.contains('board-cell') && this.isPlacingShips) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    });

    document.addEventListener('dragenter', (e) => {
      if (e.target.classList.contains('board-cell') && this.isPlacingShips) {
        e.preventDefault();
        this.showDragPreview(e.target);
      }
    });

    document.addEventListener('dragleave', (e) => {
      if (e.target.classList.contains('board-cell')) {
        // Only clear if we're actually leaving the cell
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (
          x < rect.left ||
          x > rect.right ||
          y < rect.top ||
          y > rect.bottom
        ) {
          this.clearDragPreview();
        }
      }
    });

    document.addEventListener('drop', (e) => {
      if (e.target.classList.contains('board-cell') && this.isPlacingShips) {
        e.preventDefault();
        const shipType = e.dataTransfer.getData('text/plain');
        console.log(
          'Drop event for ship:',
          shipType,
          'at cell:',
          e.target.dataset.row,
          e.target.dataset.col
        );
        this.handleShipDrop(e.target, shipType);
      }
    });
  }

  showDragPreview(targetCell) {
    this.clearDragPreview();

    // Get the ship type being dragged
    const draggingElement = document.querySelector('.dragging');
    if (!draggingElement) return;

    const shipType = draggingElement.dataset.ship;
    const shipLengths = {
      Carrier: 5,
      Battleship: 4,
      Cruiser: 3,
      Destroyer: 2,
      Submarine: 1,
    };
    const length = shipLengths[shipType];

    // Get the direction from the dragged ship
    const preview = draggingElement.querySelector('.ship-preview');
    const direction = preview.classList.contains('horizontal')
      ? 'horizontal'
      : 'vertical';

    const row = parseInt(targetCell.dataset.row);
    const col = parseInt(targetCell.dataset.col);

    let valid = true;
    const previewCells = [];

    // Calculate all cells that would be occupied by the ship
    for (let i = 0; i < length; i++) {
      const previewRow = direction === 'horizontal' ? row : row + i;
      const previewCol = direction === 'horizontal' ? col + i : col;

      if (
        previewRow < 0 ||
        previewRow >= 10 ||
        previewCol < 0 ||
        previewCol >= 10
      ) {
        valid = false;
        break;
      }

      // Find the cell in the placement board
      const cell = this.placementBoardContainer.querySelector(
        `[data-row="${previewRow}"][data-col="${previewCol}"]`
      );
      if (cell) {
        previewCells.push(cell);
        // Check if there's already a ship at this position
        if (
          this.currentPlayer &&
          this.currentPlayer.gameboard.board[previewRow][previewCol] !== null
        ) {
          valid = false;
        }
      }
    }

    // Apply preview classes to all cells
    previewCells.forEach((cell) => {
      cell.classList.add(valid ? 'drag-over' : 'drag-over-invalid');
    });

    console.log(
      `Preview for ${shipType} (${direction}): ${previewCells.length} cells, valid: ${valid}`
    );

    if (!valid) {
      console.log(
        `Invalid placement reasons: Ship would go out of bounds or overlap with existing ship`
      );
    }
  }

  clearDragPreview() {
    const dragCells = document.querySelectorAll(
      '.drag-over, .drag-over-invalid'
    );
    dragCells.forEach((cell) => {
      cell.classList.remove('drag-over', 'drag-over-invalid');
    });
  }

  handleShipDrop(targetCell, shipType) {
    const row = parseInt(targetCell.dataset.row);
    const col = parseInt(targetCell.dataset.col);

    console.log(`Handling drop for ${shipType} at [${row}, ${col}]`);

    // Get the direction from the dragged ship item
    const shipItem = document.querySelector(`[data-ship="${shipType}"]`);
    const preview = shipItem.querySelector('.ship-preview');
    const direction = preview.classList.contains('horizontal')
      ? 'horizontal'
      : 'vertical';

    console.log(`Ship direction: ${direction}`);

    // Try to place the ship - pass the ship type
    const result = this.onShipPlacement(row, col, direction, shipType);

    console.log(`Placement result:`, result);

    if (result.success) {
      // Mark ship as placed
      shipItem.classList.add('placed');

      // Update the placement board
      this.renderBoard(
        this.currentPlayer.gameboard,
        this.placementBoardContainer,
        true
      );

      // Check if all ships are placed
      const placedShips = document.querySelectorAll('.ship-item.placed');
      if (placedShips.length === 5) {
        this.finishShipPlacement();
      }
    } else {
      this.showMessage(result.error || 'Invalid placement', 'error');
    }

    this.clearDragPreview();
  }

  clearAllShips() {
    // Clear the gameboard
    if (this.currentPlayer) {
      this.currentPlayer.gameboard = new Gameboard();
    }

    // Reset ship items
    const shipItems = document.querySelectorAll('.ship-item');
    shipItems.forEach((item) => {
      item.classList.remove('placed');
      // Reset ship previews to horizontal
      const preview = item.querySelector('.ship-preview');
      if (preview) {
        preview.classList.remove('vertical');
        preview.classList.add('horizontal');
      }
    });

    // Update the placement board
    this.renderBoard(
      this.currentPlayer.gameboard,
      this.placementBoardContainer,
      true
    );

    // Ensure placement mode is active
    this.isPlacingShips = true;

    this.showMessage('All ships cleared. Place them again.', 'info');
  }

  createBoard(container, isPlayerBoard = false, clickable = true) {
    container.innerHTML = '';
    container.className = 'game-board';

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (clickable) {
          cell.addEventListener('click', (e) => {
            if (this.gameOver) return;

            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);

            if (this.isPlacingShips && isPlayerBoard) {
              this.handleShipPlacement(row, col);
            } else if (
              !this.isPlacingShips &&
              !isPlayerBoard &&
              this.onCellClick
            ) {
              this.onCellClick(row, col);
            }
          });

          if (this.isPlacingShips && isPlayerBoard) {
            cell.addEventListener('mouseenter', (e) => {
              this.showPlacementPreview(
                parseInt(e.target.dataset.row),
                parseInt(e.target.dataset.col)
              );
            });

            cell.addEventListener('mouseleave', () => {
              this.clearPlacementPreview();
            });
          }
        }

        container.appendChild(cell);
      }
    }
  }

  renderBoard(gameboard, container, isPlayerBoard = false) {
    const cells = container.querySelectorAll('.board-cell');

    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      // Reset classes
      cell.className = 'board-cell';

      // Show ships on player board
      if (isPlayerBoard && gameboard.getShipAt(row, col)) {
        cell.classList.add('ship');
      }

      // Show hits
      const hitAttacks = gameboard.getHitAttacks();
      if (hitAttacks.some(([r, c]) => r === row && c === col)) {
        cell.classList.add('hit');

        // Check if ship is sunk
        const ship = gameboard.getShipAt(row, col);
        if (ship && ship.isSunk()) {
          cell.classList.add('sunk');
        }
      }

      // Show misses
      const missedAttacks = gameboard.getMissedAttacks();
      if (missedAttacks.some(([r, c]) => r === row && c === col)) {
        cell.classList.add('miss');
      }
    });
  }

  showMessage(message, type = 'info') {
    this.messageContainer.innerHTML = `<p class="message-${type}">${message}</p>`;
  }

  showGameOver(winner, message) {
    document.getElementById('game-over-title').textContent = `${winner} Wins!`;
    document.getElementById('game-over-message').textContent = message;
    this.showModal(this.gameOverModal);
    this.gameOver = true;
  }

  showModal(modal) {
    modal.classList.remove('hidden');
  }

  hideModal(modal) {
    modal.classList.add('hidden');

    // Clean up any ongoing drag operations when modal is closed
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
      draggingElement.classList.remove('dragging');
      this.clearDragPreview();
    }
  }

  startShipPlacement() {
    this.showShipPlacementSection();
  }

  showShipPlacementSection() {
    this.shipPlacementSection.classList.remove('hidden');
    this.gameBoardsSection.classList.add('hidden');
    this.isPlacingShips = true;

    // Reset ship items to allow placement
    const shipItems = document.querySelectorAll('.ship-item');
    shipItems.forEach((item) => {
      item.classList.remove('placed');
      // Reset ship previews to horizontal
      const preview = item.querySelector('.ship-preview');
      if (preview) {
        preview.classList.remove('vertical');
        preview.classList.add('horizontal');
      }
    });

    // Create the placement board
    this.createBoard(this.placementBoardContainer, true, true);

    // Ensure the placement board is properly set up for drag and drop
    if (this.currentPlayer) {
      this.renderBoard(
        this.currentPlayer.gameboard,
        this.placementBoardContainer,
        true
      );
    }
  }

  updatePlacementTitle() {
    const shipType = this.shipTypes[this.currentShipIndex];
    const shipLengths = {
      Carrier: 5,
      Battleship: 4,
      Cruiser: 3,
      Destroyer: 2,
      Submarine: 1,
    };
    const length = shipLengths[shipType];

    document.getElementById('placement-title').textContent =
      `Place your ${shipType} (${length} space${length > 1 ? 's' : ''})`;
  }

  handleShipPlacement(row, col) {
    if (!this.onShipPlacement) return;

    // Get the current ship type for click placement
    const shipType = this.shipTypes[this.currentShipIndex];
    const result = this.onShipPlacement(
      row,
      col,
      this.currentDirection,
      shipType
    );

    if (result.success) {
      this.currentShipIndex++;

      if (this.currentShipIndex >= this.shipTypes.length) {
        // All ships placed
        this.finishShipPlacement();
      } else {
        this.updatePlacementTitle();
      }

      this.renderBoard(
        this.currentPlayer.gameboard,
        this.placementBoardContainer,
        true
      );
      this.clearPlacementPreview();
    } else {
      this.showMessage(result.error || 'Invalid placement', 'error');
    }
  }

  showPlacementPreview(row, col) {
    this.clearPlacementPreview();

    const shipType = this.shipTypes[this.currentShipIndex];
    const shipLengths = {
      Carrier: 5,
      Battleship: 4,
      Cruiser: 3,
      Destroyer: 2,
      Submarine: 1,
    };
    const length = shipLengths[shipType];

    let valid = true;
    const previewCells = [];

    for (let i = 0; i < length; i++) {
      const previewRow = this.currentDirection === 'horizontal' ? row : row + i;
      const previewCol = this.currentDirection === 'horizontal' ? col + i : col;

      if (
        previewRow < 0 ||
        previewRow >= 10 ||
        previewCol < 0 ||
        previewCol >= 10
      ) {
        valid = false;
        break;
      }

      const cell = this.playerBoardContainer.querySelector(
        `[data-row="${previewRow}"][data-col="${previewCol}"]`
      );
      if (cell) {
        previewCells.push(cell);
        if (
          this.currentPlayer &&
          this.currentPlayer.gameboard.getShipAt(previewRow, previewCol)
        ) {
          valid = false;
        }
      }
    }

    previewCells.forEach((cell) => {
      cell.classList.add(valid ? 'preview-valid' : 'preview-invalid');
    });
  }

  clearPlacementPreview() {
    const previewCells = this.playerBoardContainer.querySelectorAll(
      '.preview-valid, .preview-invalid'
    );
    previewCells.forEach((cell) => {
      cell.classList.remove('preview-valid', 'preview-invalid');
    });
  }

  toggleDirection() {
    this.currentDirection =
      this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';

    // Update button text - show what direction it will be AFTER clicking
    const rotateBtn = document.getElementById('rotate-btn');
    if (rotateBtn) {
      // Show the NEXT direction (what it will be after clicking)
      const nextDirection =
        this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
      rotateBtn.textContent = `Rotate (${nextDirection === 'horizontal' ? 'H' : 'V'})`;
    }

    // Clear preview so it updates with new direction
    this.clearPlacementPreview();
  }

  finishShipPlacement() {
    this.isPlacingShips = false;
    this.shipPlacementSection.classList.add('hidden');
    this.gameBoardsSection.classList.remove('hidden');
    this.createBoard(this.playerBoardContainer, true, false);
    this.createBoard(this.enemyBoardContainer, false, true);
    this.showMessage('All ships placed! Click on enemy board to attack!');
  }

  updateShipStatus(player, isEnemy = false) {
    const statusContainer = isEnemy
      ? document.getElementById('enemy-ship-status')
      : document.getElementById('player-ship-status');

    if (!statusContainer || !player || !player.gameboard.ships) return;

    const ships = player.gameboard.ships;
    const statusHTML = ships
      .map(({ ship }) => {
        const status = ship.isSunk()
          ? 'sunk'
          : `${ship.health()}/${ship.length}`;
        const statusClass = ship.isSunk()
          ? 'ship-sunk'
          : ship.hits > 0
            ? 'ship-damaged'
            : 'ship-healthy';

        return `<div class="ship-status-item ${statusClass}">
        <span class="ship-name">${ship.name}</span>
        <span class="ship-health">${status}</span>
      </div>`;
      })
      .join('');

    const title = isEnemy ? 'Enemy Fleet Status' : 'Your Fleet Status';
    statusContainer.innerHTML = `
      <h3>${title}</h3>
      <div class="ships-list">${statusHTML}</div>
    `;
  }

  setPlayers(player, enemy) {
    this.currentPlayer = player;
    this.enemy = enemy;
  }

  setCallbacks({ onCellClick, onNewGame, onRandomPlacement, onShipPlacement }) {
    this.onCellClick = onCellClick;
    this.onNewGame = onNewGame;
    this.onRandomPlacement = onRandomPlacement;
    this.onShipPlacement = onShipPlacement;
  }

  reset() {
    this.gameOver = false;
    this.isPlacingShips = false;
    this.currentShipIndex = 0;
    this.hideModal(this.gameOverModal);
    this.shipPlacementSection.classList.add('hidden');
    this.gameBoardsSection.classList.add('hidden');

    // Reset ship items
    const shipItems = document.querySelectorAll('.ship-item');
    shipItems.forEach((item) => {
      item.classList.remove('placed');
      // Reset ship previews to horizontal
      const preview = item.querySelector('.ship-preview');
      if (preview) {
        preview.classList.remove('vertical');
        preview.classList.add('horizontal');
      }
    });
  }
}
