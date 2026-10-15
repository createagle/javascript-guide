// Show a greeting when the button is clicked
const button = document.querySelector('#greet');
const output = document.querySelector('#message');

button.addEventListener('click', () => {
  output.textContent = 'Hello from JavaScript!';
});
