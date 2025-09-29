const IEF = require('./lib/ief.cjs');

// Cube variables
let cube;
let angleX = 0;
let angleY = 0;

// Create scene elements
cube = IEF.set('3d', 'cube', 'myCube'); // Your scene node(2D or 3D), your object type, your object ID
cube.color = 'bright_green'; // Change the cube color
IEF.fill(cube);

// Animation Function
function animate() {
    angleX++;
    angleY += 2;
    // Use engine functions to manipulate the object
    IEF.rotate3D(cube, angleX, angleY, 0);
}

// Start the engine, passing your animation function as a callback
IEF.start(animate);
