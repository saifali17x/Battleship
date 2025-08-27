console.log('Testing rotate button functionality...');

// Simulate the current direction logic
let currentDirection = 'horizontal';

console.log('Initial direction:', currentDirection);

// Test the button text logic
const getButtonText = (direction) => {
  return `Rotate (${direction === 'horizontal' ? 'V' : 'H'})`;
};

console.log('Button text for horizontal:', getButtonText('horizontal'));
console.log('Button text for vertical:', getButtonText('vertical'));

// Test the toggle logic
const toggleDirection = () => {
  currentDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
  console.log('After toggle, direction:', currentDirection);
  console.log('Button text should be:', getButtonText(currentDirection));
};

console.log('\nTesting toggle:');
toggleDirection();
toggleDirection();
