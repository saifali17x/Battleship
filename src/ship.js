export class Ship {
  constructor(name) {
    this.name = name;
    this.length = this.setLength(name);
    this.hits = 0;
  }

  setLength(name) {
    switch (name) {
      case 'Carrier':
        return 5;
      case 'Battleship':
        return 4;
      case 'Cruiser':
        return 3;
      case 'Destroyer':
        return 2;
      case 'Submarine':
        return 1;
      default:
        return 0;
    }
  }

  hit() {
    if (this.hits < this.length) {
      this.hits++;
    }
  }

  hitCount() {
    return this.hits;
  }

  health() {
    return this.length - this.hits;
  }

  isSunk() {
    return this.hits >= this.length;
  }
}
