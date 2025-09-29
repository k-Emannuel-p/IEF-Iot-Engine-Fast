import { start, set, rotate3D } from './lib/ief.mjs';

// Cube variables
let cube;
let angleX = 0;
let angleY = 0;

// Create scene elements
cube = set('3d', 'cube', 'myCube'); // Your scene node(2D or 3D), your object type, your object ID
cube.color = 'bright_yellow'; // Change the cube color
IEF.fill(cube);

// Animation Function
function animate() {
  angleX++; // Spins the cube
  angleY++;
  rotate3D(cube, angleX, angleY, 0); // X, Y, Z
}

start(animate);