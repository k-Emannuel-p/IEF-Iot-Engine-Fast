
/**
 *  Iot Enine - General-purpose terminal graphics engine in NodeJS/JavaScript
 *  Engine version: 0.0.15
 *  Open Source
 *  ------------------------------------------------------------------
 *  
 *  Main Features:
 *  
 *  - Support for 2D and 3D scenes
 *  - Colored text
 *  - More fast than others terminal graphics engines
 *  - Clear code
 *  - Fast Sintaxe
 *  - Customize all
 * 
 */

// Key elements
const canvas = [];
let scene2D = [];
let scene3D = [];
let sceneNode = '3d'; // Dimensions Selector

// Camera
let cameras2D = {};
let cameras3D = {};
let camera3D = {
    id: 'main', 
    position: [0, 6, 0], 
    rotation: {angleX: 0, angleY: 0, angleZ: 0}, 
    camera_distance: 750
};
let camera2D = {
    id: 'main', 
    position: [0, 0],
    rotation: 0, 
    camera_distance: 0
}

// Screen parameters
let ratio = 0.5;
let window = {
    width: 220,
    height: 220 * ratio, 
    title: 'My game'
};
const aspect_ratio = 2; // Formats sizes to fit the screen better

// Canvas and Frame Rate
const canvas_bg = ' ';
const canvas_text_color = 'black';
const canvas_bg_color = 'black';
const frame_rate = 60; // Frames per Second
const fps = 1000 / frame_rate;

// Side Parameters
let total_days = 0; // Absolute time count
let show_time = false;
var messages = [];

// Standard measures
let camera_distance = camera3D.camera_distance;

const colors_ansi = {
    // Text Colors
    text_black: '[30',
    text_red: '[31',
    text_green: '[32',
    text_yellow: '[33',
    text_blue: '[34',
    text_magenta: '[35',
    text_cyan: '[36',
    text_white: '[37',
    text_bright_black: '[90',
    text_bright_red: '[91',
    text_bright_green: '[92',
    text_bright_yellow: '[93',
    text_bright_blue: '[94',
    text_bright_magenta: '[95',
    text_bright_cyan: '[96',
    text_bright_white: '[97',

    // Background colors
    bg_black: ';40m',
    bg_red: ';41m',
    bg_green: ';42m',
    bg_yellow: ';43m',
    bg_blue: ';44m',
    bg_magenta: ';45m',
    bg_cyan: ';46m',
    bg_white: ';47m',
    bg_bright_black: ';100m',
    bg_bright_red: ';101m',
    bg_bright_green: ';102m',
    bg_bright_yellow: ';103m',
    bg_bright_blue: ';104m',
    bg_bright_magenta: ';105m',
    bg_bright_cyan: ';106m',
    bg_bright_white: ';107m'
};

let previous_canvas = [];
let userAnimate = () => {}; // Placeholder for user's animation function

/**
 * Resets the engine to new dimensions, clears and recreates canvas buffers,
 * and performs a full redraw to prime the terminal screen.
 * This is called on initial startup and whenever the terminal window is resized.
 */
function resetEngine() {
    window.width = process.stdout.columns;
    window.height = Math.floor(window.width * ratio);

    canvas.length = 0;
    previous_canvas.length = 0;

    for (let y = 0; y < window.height; y++) {
        for (let x = 0; x < window.width; x++) {
            let pixel = {
                'char': canvas_bg,
                'text_color': canvas_text_color,
                'bg_color': canvas_bg_color,
                x: x,
                y: y
            };
            canvas.push(pixel);
        }
    }
    previous_canvas = JSON.parse(JSON.stringify(canvas));

    let initial_draw_commands = '\x1b[2J\x1b[?25l';

    for (const pixel of canvas) {
        initial_draw_commands += `\x1b[${pixel.y + 1};${pixel.x + 1}H`;
        initial_draw_commands += color(pixel.char, pixel.text_color, pixel.bg_color);
    }
    process.stdout.write(initial_draw_commands);
}


/**
 * Initializes the screen by performing the first engine reset.
 */
function InitScreen() {
    resetEngine();
}

// ===========================
// =   Essential Functions   =
// ===========================

/**
 * Renders a single character (pixel) on the canvas at the specified coordinates.
 * The function rounds the coordinates to the nearest integer and checks if they are within the canvas boundaries.
 * @param {number} x - The x-coordinate for the pixel.
 * @param {number} y - The y-coordinate for the pixel.
 * @param {string} [char=" "] - The character to be displayed.
 * @param {string} [text_color='white'] - The text color for the character.
 * @param {string} [bg_color='white'] - The background color for the character.
 */
function print(x, y, char = " ", text_color = 'white', bg_color = 'white') {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    if (roundedX >= 0 && roundedX < window.width && roundedY >= 0 && roundedY < window.height) {
        const index = roundedY * window.width + roundedX;
        if (canvas[index]) {
            canvas[index].char = char;
            canvas[index].text_color = text_color;
            canvas[index].bg_color = bg_color;
        }
    }
}

/**
 * Draws a line on the canvas between two points (x1, y1) and (x2, y2) using Bresenham's line algorithm.
 * @param {number} x1 - The x-coordinate of the starting point.
 * @param {number} y1 - The y-coordinate of the starting point.
 * @param {number} x2 - The x-coordinate of the ending point.
 * @param {number} y2 - The y-coordinate of the ending point.
 * @param {string} [char=" "] - The character used to draw the line.
 */
function line(x1, y1, x2, y2, char = " ", text_color = 'white', bg_color = 'white') {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        print(x1, y1, char, text_color, bg_color);
        if (x1 === x2 && y1 === y2) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x1 += sx; }
        if (e2 < dx) { err += dx; y1 += sy; }
    }
}


// ==================
// =   2D section   =
// ==================

/**
 * Rotates a 2D point (x, y) around a specified pivot point (axes).
 * @param {number} x - The x-coordinate of the point to be rotated.
 * @param {number} y - The y-coordinate of the point to be rotated.
 * @param {number} deg - The angle of rotation in degrees.
 * @param {number[]} axes - An array containing the x and y coordinates of the pivot point [axesX, axesY].
 * @returns {number[]} An array containing the new rotated [x, y] coordinates.
 */
function rotatePoint2D(x, y, deg, pivot) {
    const rad = deg * (Math.PI / 180);
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const axesX = pivot[0]; const axesY = pivot[1];
    const mod_x = x - axesX; const mod_y = y - axesY;
    const nX = (cos * mod_x) - (sin * mod_y);
    const nY = (sin * mod_x) + (cos * mod_y);

    const rotatedX = nX + axesX;
    const rotatedY = nY + axesY;

    return [rotatedX, rotatedY];
}

/**
 * Adds a new 2D shape object to the `scene2D` array with default parameters.
 * If an object with the same ID already exists, an error is logged.
 * @param {string} type - The type of shape to add (e.g., 'square', 'triangle', 'rectangle', 'ellipse').
 * @param {string} id - A unique identifier for the new shape object.
 */
function set2D(type, id) {
    const existingObj = scene2D.find(obj => obj.id === id);
    if (existingObj) {
        console.log(color(`-------- \n\n An object ("${type}") with the ID "${id}" already exists in the 2D scene.  \n\n --------`, 'white', 'red'));
        return;
    }

    switch (type) {
        case 'square':
            const square = {
                id: id,
                type: 'square',
                position: [0, 0],
                length: 1,
                const_lenght: 1,
                fill: false,
                angle: 0,
                color: 'white',
                isDirty: true,
                cached_vertices: []
            };
            scene2D.push(square);
            break;
        case 'triangle':
            const triangle = {
                id: id,
                type: 'triangle',
                position: [0, 0],
                length: 1,
                const_lenght: 1,
                fill: false,
                angle: 0,
                color: 'white',
                isDirty: true,
                cached_vertices: []
            }
            scene2D.push(triangle);
            break;
        case 'rectangle':
            const rectangle = {
                id: id,
                type: 'rectangle',
                position: [0, 0],
                width: 2,
                height: 1,
                const_height: 1,
                const_width: 2,
                fill: false,
                angle: 0,
                color: 'white',
                isDirty: true,
                cached_vertices: []
            };
            scene2D.push(rectangle);
            break;
        case 'ellipse':
            const ellipse = {
                id: id,
                type: 'ellipse',
                position: [0, 0], // Replaced posStandard2d which was not defined
                radiusA: 1,
                radiusB: 1,
                const_radiusA: 1,
                const_radiusB: 1,
                fill: false,
                angle: 0,
                color: 'white'
            };
            scene2D.push(ellipse);
            break;
    }
}

/**
 * Draws a square on the canvas based on the properties of a scene object.
 * The function handles rotation and filling of the square.
 * @param {string} id - The unique identifier of the square object in the `scene2D` array.
 */
function square2D(id) {
    const object = scene2D.find(obj => obj.id === id);
    if (!object) {
        console.log(color(`-------- \n\n An object ("square") with ID ${id} does not exist in the 2D scene. \n\n --------`, 'white', 'red'));
        return;
    }

    if (object.isDirty) {
        const pos = object.position;
        const length = object.length;
        const half = length / 2;
        let vecs = [
            [pos[0] - half, pos[1] - half / aspect_ratio],
            [pos[0] + half, pos[1] - half / aspect_ratio],
            [pos[0] + half, pos[1] + half / aspect_ratio],
            [pos[0] - half, pos[1] + half / aspect_ratio]
        ];

        if (object.angle !== 0) {
            vecs = vecs.map(([x, y]) => {
                const rotated = rotatePoint2D(x, y * aspect_ratio, object.angle, [pos[0], pos[1] * aspect_ratio]);
                return [rotated[0], rotated[1] / aspect_ratio];
            });
        }
        object.cached_vertices = vecs;
        object.isDirty = false;
    }

    const vecs = object.cached_vertices;
    const colorName = object.color;

    if (object.fill === true) {
        fillPolygon2D(vecs, colorName);
    } else {
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0]];
        edges.forEach(([i1, i2]) => {
            const p1 = vecs[i1];
            const p2 = vecs[i2];
            line(Math.round(p1[0]), Math.round(p1[1]), Math.round(p2[0]), Math.round(p2[1]), ' ', colorName, colorName);
        });
    }
}

/**
 * Draws an equilateral triangle on the canvas based on the properties of a scene object.
 * It calculates the vertices based on the object's position and length, and handles rotation and filling.
 * @param {string} id - The unique identifier of the triangle object in the `scene2D` array.
 */
function triangle2D(id) {
    const object = scene2D.find(obj => obj.id === id);
    if (!object) {
        console.log(color(`-------- \n\n An object ("triangle") with ID ${id} does not exist in the 2D scene. \n\n --------`, 'white', 'red'));
        return;
    }

    if (object.isDirty) {
        const pos = object.position;
        const length = object.length;
        const angle = object.angle;
        const height_tri = (length * Math.sqrt(3)) / 2;

        let vecs = [
            [pos[0], pos[1] - (height_tri * 2 / 3) / aspect_ratio],
            [pos[0] - length / 2, pos[1] + (height_tri * 1 / 3) / aspect_ratio],
            [pos[0] + length / 2, pos[1] + (height_tri * 1 / 3) / aspect_ratio]
        ];

        if (angle !== 0) {
            vecs = vecs.map(([x, y]) => {
                const rotated = rotatePoint2D(x, y * aspect_ratio, angle, [pos[0], pos[1] * aspect_ratio]);
                return [rotated[0], rotated[1] / aspect_ratio];
            });
        }
        object.cached_vertices = vecs;
        object.isDirty = false;
    }

    const vecs = object.cached_vertices;
    const colorName = object.color;

    if (object.fill === true) {
        fillPolygon2D(vecs, colorName);
    } else {
        const edges = [[0, 1], [1, 2], [2, 0]];
        edges.forEach(([i1, i2]) => {
            const p1 = vecs[i1];
            const p2 = vecs[i2];
            line(Math.round(p1[0]), Math.round(p1[1]), Math.round(p2[0]), Math.round(p2[1]), ' ', colorName, colorName);
        });
    }
}

/**
 * Draws a rectangle on the canvas based on the properties of a scene object.
 * This function supports rotation and filling of the rectangle.
 * @param {string} id - The unique identifier of the rectangle object in the `scene2D` array.
 */
function rectangle2D(id) {
    const object = scene2D.find(obj => obj.id === id);
    if (!object) {
        console.log(color(`-------- \n\n An object ("rectangle") with ID ${id} does not exist in the 2D scene. \n\n --------`, 'white', 'red'));
        return;
    }

    if (object.isDirty) {
        const pos = object.position;
        const width = object.width;
        const height = object.height;
        const halfW = width / 2;
        const halfH = height / 2;

        let vecs = [
            [pos[0] - halfW, pos[1] - halfH / aspect_ratio],
            [pos[0] + halfW, pos[1] - halfH / aspect_ratio],
            [pos[0] + halfW, pos[1] + halfH / aspect_ratio],
            [pos[0] - halfW, pos[1] + halfH / aspect_ratio]
        ];

        if (object.angle !== 0) {
            vecs = vecs.map(([x, y]) => {
                const rotated = rotatePoint2D(x, y * aspect_ratio, object.angle, [pos[0], pos[1] * aspect_ratio]);
                return [rotated[0], rotated[1] / aspect_ratio];
            });
        }
        object.cached_vertices = vecs;
        object.isDirty = false;
    }

    const vecs = object.cached_vertices;
    const colorName = object.color;

    if (object.fill === true) {
        fillPolygon2D(vecs, colorName);
    } else {
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0]];
        edges.forEach(([i1, i2]) => {
            const p1 = vecs[i1];
            const p2 = vecs[i2];
            line(Math.round(p1[0]), Math.round(p1[1]), Math.round(p2[0]), Math.round(p2[1]), ' ', colorName, colorName);
        });
    }
}

/**
 * Draws an ellipse on the canvas based on its scene object properties using the Midpoint ellipse algorithm.
 * It considers the aspect ratio to prevent stretching in the terminal. Note: Filling and rotation are not currently implemented for ellipses.
 * @param {string} id - The unique identifier of the ellipse object in the `scene2D` array.
 */
function ellipse2D(id) {
    const object = scene2D.find(obj => obj.id === id);
    if (!object) {
        console.log(color(`-------- \n\n An object ("ellipse") such as ID ${id} does not exist in the 2D scene \n\n --------`, 'white', 'red'));
        return;
    }

    const cx = object.position[0]; // Center X
    const cy = object.position[1]; // Center Y
    const rx = object.radiusA; // Radius X
    const ry = object.radiusB; // Radius Y
    const colorName = object.color;

    const ry_aspect = ry / aspect_ratio;

    let x = 0;
    let y = ry_aspect;

    let d1 = (ry_aspect * ry_aspect) - (rx * rx * ry_aspect) + (0.25 * rx * rx);
    let dx = 2 * ry_aspect * ry_aspect * x;
    let dy = 2 * rx * rx * y;

    while (dx < dy) {
        print(cx + x, cy + y, ' ', colorName, colorName);
        print(cx - x, cy + y, ' ', colorName, colorName);
        print(cx + x, cy - y, ' ', colorName, colorName);
        print(cx - x, cy - y, ' ', colorName, colorName);

        if (d1 < 0) {
            x++;
            dx = dx + (2 * ry_aspect * ry_aspect);
            d1 = d1 + dx + (ry_aspect * ry_aspect);
        } else {
            x++;
            y--;
            dx = dx + (2 * ry_aspect * ry_aspect);
            dy = dy - (2 * rx * rx);
            d1 = d1 + dx - dy + (ry_aspect * ry_aspect);
        }
    }

    let d2 = ((ry_aspect * ry_aspect) * ((x + 0.5) * (x + 0.5))) + ((rx * rx) * ((y - 1) * (y - 1))) - (rx * rx * ry_aspect * ry_aspect);

    while (y >= 0) {
        print(cx + x, cy + y, ' ', colorName, colorName);
        print(cx - x, cy + y, ' ', colorName, colorName);
        print(cx + x, cy - y, ' ', colorName, colorName);
        print(cx - x, cy - y, ' ', colorName, colorName);

        if (d2 > 0) {
            y--;
            dy = dy - (2 * rx * rx);
            d2 = d2 + (rx * rx) - dy;
        } else {
            y--;
            x++;
            dx = dx + (2 * ry_aspect * ry_aspect);
            dy = dy - (2 * rx * rx);
            d2 = d2 + dx - dy + (rx * rx);
        }
    }
}

// ==================
// =   3D section   =
// ==================

/**
 * Projects a 3D point [x, y, z] into 2D screen coordinates using perspective projection.
 * Includes safety checks to prevent division by zero and projection of points behind the camera.
 * @param {number[]} point - An array containing the 3D coordinates [x, y, z] to project.
 * @returns {number[] | null} The projected 2D coordinates [x, y], or null if the point cannot be drawn.
 */
function project([x, y, z]) {
    if (z <= 0) {
            return null;
    }

    const projectedX = (x * camera_distance) / z;
    const projectedY = (y * camera_distance) / z;

    return [projectedX, projectedY];
}

function rotate3DX(x, y, z, deg, pivot){
    const rad = deg * (Math.PI / 180);
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const axesX = pivot[0]; const axesY = pivot[1]; const axesZ = pivot[2];
    const mod_x = x - axesX; const mod_y = y - axesY; const mod_z = z - axesZ;

    const nX = mod_x;
    const nY = (cos * mod_y) - (sin * mod_z); 
    const nZ = (sin * mod_y) + (cos * mod_z); 

    const rotatedX = nX + axesX;
    const rotatedY = nY + axesY;
    const rotatedZ = nZ + axesZ;
    return [rotatedX, rotatedY, rotatedZ];
}

function rotate3DY(x, y, z, deg, pivot){
    const rad = deg * (Math.PI / 180);
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const axesX = pivot[0]; const axesY = pivot[1]; const axesZ = pivot[2];
    const mod_x = x - axesX; const mod_y = y - axesY; const mod_z = z - axesZ;

    const nX = (cos * mod_x) + (sin * mod_z);
    const nY = mod_y;
    const nZ = (-sin * mod_x) + (cos * mod_z);

    const rotatedX = nX + axesX;
    const rotatedY = nY + axesY;
    const rotatedZ = nZ + axesZ;
    return [rotatedX, rotatedY, rotatedZ];
}

function rotate3DZ(x, y, z, deg, pivot){
    const rad = deg * (Math.PI / 180);
    const cos = Math.cos(rad); const sin = Math.sin(rad);
    const axesX = pivot[0]; const axesY = pivot[1]; const axesZ = pivot[2];
    const mod_x = x - axesX; const mod_y = y - axesY; const mod_z = z - axesZ;

    const nX = (cos * mod_x) + (-sin * mod_y);
    const nY = (sin * mod_x) + (cos * mod_y);
    const nZ = mod_z;

    const rotatedX = nX + axesX;
    const rotatedY = nY + axesY;
    const rotatedZ = nZ + axesZ;
    return [rotatedX, rotatedY, rotatedZ];
}

function rotatePoint3D(x, y, z, deg, axle, pivot){
    const axle_rotate = axle.toLowerCase();
    let rotated;
    switch(axle_rotate){
        case 'x':
            rotated = rotate3DX(x, y, z, deg, pivot);
            break;
        case 'y':
            rotated = rotate3DY(x, y, z, deg, pivot);
            break;
        case 'z':
            rotated = rotate3DZ(x, y, z, deg, pivot);
            break;
    }
    return rotated || null;
}

function cameraTransform(x, y, z) {
    const { position: [camX, camY, camZ], rotation } = camera3D;
    const { angleX, angleY, angleZ } = rotation;

    const translatedX = x - camX;
    const translatedY = y - camY;
    const translatedZ = z - camZ;

    const pivot = [0, 0, 0];

    const rX = rotatePoint3D(translatedX, translatedY, translatedZ, -angleX, 'x', pivot);
    const rY = rotatePoint3D(...rX, -angleY, 'y', pivot);
    const vec_final = rotatePoint3D(...rY, -angleZ, 'z', pivot);

    return vec_final;
}

/**
 * Adds a new 3D shape object to the `scene3D` array with default parameters.
 * Logs an error if an object with the same ID already exists.
 * @param {string} type - The type of the 3D object to be added (e.g., 'cube', 'vec').
 * @param {string} id - A unique identifier for the new object.
 */
function set3D(type, id) {
    const existingObj = find('3d', id);
    if (existingObj) {
        console.log(color(`-------- \n\n An object ("${type}") with the ID "${id}" already exists in the 3D scene.  \n\n --------`, 'white', 'red'));
        return;
    }

    switch (type) {
        case 'cube':
            const cube = {
                id: id,
                type: 'cube',
                position: [0, 0, 40],
                length: 3,
                const_length: 1, 
                fill: true,
                angleX: 0,
                angleY: 0,
                angleZ: 0,
                color: 'white', 
                isDirty: true, 
                cached_world_vertices: []
            };
            scene3D.push(cube);
            break;
        case 'vec':
            const vec = {
                id: id,
                type: 'vec',
                position: [0, 0, 0], // Replaced posStandard3d which was not defined
                color: 'white'
            };
            scene3D.push(vec);
            break;
    }
}

/**
 * Projects and draws a 3D vector (represented as a point) from the scene onto the 2D canvas.
 * @param {string} id - The unique identifier of the vector object in the `scene3D` array.
 */
function vec3D(id) {
    const object = scene3D.find(obj => obj.id === id);
    if (!object) return;

    let pos = object.position;
    let colorName = object.color;
    const transformed = cameraTransform(pos[0], pos[1], pos[2]);
    let projected = project(transformed);
    if (projected !== null) {
        const screenX = projected[0] + (window.width / 2);
        const screenY = projected[1] + (window.height / 2);

        print(screenX, screenY, ' ', colorName, colorName);
    }
}

/**
 * Fills a 2D polygon defined by an array of vertices.
 * This function is used by 2D shapes and 3D face rendering.
 * @param {number[][]} vecs - An array of [x, y] vertices defining the polygon.
 * @param {string} color - The color to fill the polygon with.
 */
function fillPolygon2D(vecs, colorName) {
    const yCoords = vecs.map(v => v[1]);
    const yMin = Math.ceil(Math.min(...yCoords));
    const yMax = Math.floor(Math.max(...yCoords));

    for (let y = yMin; y <= yMax; y++) {
        const intersections = [];
        for (let i = 0; i < vecs.length; i++) {
            const p1 = vecs[i];
            const p2 = vecs[(i + 1) % vecs.length];

            if (p1[1] !== p2[1]) {
                if ((y >= p1[1] && y < p2[1]) || (y >= p2[1] && y < p1[1])) {
                    
                    const x = (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]) + p1[0];
                    intersections.push(x);
                }
            }
        }

        intersections.sort((a, b) => a - b);

        for (let i = 0; i < intersections.length; i += 2) {
            if (intersections[i + 1] !== undefined) {
                line(Math.round(intersections[i]), y, Math.round(intersections[i + 1]), y, ' ', colorName, colorName);
            }
        }
    }
}

/**
 * Renders a 3D cube object from the scene onto the 2D canvas, 
 * using the Painter's Algorithm for face rendering if the 'fill' property is true.
 * @param {string} id - The unique identifier of the cube object in the `scene3D` array.
 */
function cube3D(id) {
    const object = scene3D.find(obj => obj.id === id);
    if (!object) return;

    if (object.isDirty) {
        const pos = object.position;
        const length = object.length;
        const half = length / 2;
        const angleX = object.angleX;
        const angleY = object.angleY;
        const angleZ = object.angleZ;

        const model_vertices = [
            [-half, -half, -half], [half, -half, -half], [half,  half, -half], [-half,  half, -half],
            [-half, -half,  half], [half, -half,  half], [half,  half,  half], [-half,  half,  half]
        ];

        const new_world_vertices = model_vertices.map(vec => {
            let current_vec = [...vec];
            const pivot = [0, 0, 0];

            if (angleX !== 0) {
                current_vec = rotate3DX(current_vec[0], current_vec[1], current_vec[2], angleX, pivot);
            }
            if (angleY !== 0) {
                current_vec = rotate3DY(current_vec[0], current_vec[1], current_vec[2], angleY, pivot);
            }
            if (angleZ !== 0) {
                current_vec = rotate3DZ(current_vec[0], current_vec[1], current_vec[2], angleZ, pivot);
            }
            return [
                current_vec[0] + pos[0],
                current_vec[1] + pos[1],
                current_vec[2] + pos[2]
            ];
        });

        object.cached_world_vertices = new_world_vertices;
        object.isDirty = false;
    }
    
    const colorName = object.color;
    const world_vertices = object.cached_world_vertices;

    const faces = [
        { indices: [0, 1, 2, 3] }, 
        { indices: [4, 5, 6, 7] }, 
        { indices: [0, 3, 7, 4] }, 
        { indices: [1, 2, 6, 5] }, 
        { indices: [0, 1, 5, 4] }, 
        { indices: [3, 2, 6, 7] }  
    ];

    const drawable_faces = [];
    const screen_points = []; 

    for (const [index, vec] of world_vertices.entries()) {
        const transformed = cameraTransform(vec[0], vec[1], vec[2]);
        const projected = project(transformed);

        if (projected === null) {
            screen_points.push(null);
        } else {
            const screenX = projected[0] + (window.width / 2);
            const screenY = (projected[1] / aspect_ratio) + (window.height / 2);
            screen_points.push([screenX, screenY]);
        }
    }
    
    for (const face of faces) {
        let projected_vertices = [];
        let total_z = 0;
        let is_drawable = true;

        for (const index of face.indices) {
            const vec = world_vertices[index];
            const transformed = cameraTransform(vec[0], vec[1], vec[2]);
            
            if (transformed[2] <= 0) {
                 is_drawable = false;
                 break;
            }
            
            const screen_point = screen_points[index];
            if (screen_point === null) {
                is_drawable = false;
                break;
            }

            projected_vertices.push(screen_point);
            total_z += transformed[2]; 
        }

        if (is_drawable) {
            const avg_z = total_z / face.indices.length;
            drawable_faces.push({
                avg_z: avg_z,
                vertices_2d: projected_vertices,
                color: colorName
            });
        }
    }

    if (object.fill === true) {
        drawable_faces.sort((a, b) => b.avg_z - a.avg_z);
        drawable_faces.forEach(face => {
            fillPolygon2D(face.vertices_2d, face.color);
        });
    }

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    for (const edge of edges) {
        const p1 = screen_points[edge[0]];
        const p2 = screen_points[edge[1]];

        if (p1 === null || p2 === null) {
            continue;
        }

        line(Math.round(p1[0]), Math.round(p1[1]), Math.round(p2[0]), Math.round(p2[1]), '•', colorName, colorName);
    }
}

// ========================
// =   Render Functions   =
// ========================

/**
 * Renders the canvas state to the terminal using a differential rendering technique.
 */
function render() {
    total_days++;
    let output = '';

    for (let i = 0; i < canvas.length; i++) {
        const current_pixel = canvas[i];
        const previous_pixel = previous_canvas[i];

        if (current_pixel.char !== previous_pixel.char ||
            current_pixel.text_color !== previous_pixel.text_color ||
            current_pixel.bg_color !== previous_pixel.bg_color) {

            output += `\x1b[${current_pixel.y + 1};${current_pixel.x + 1}H`;
            output += color(current_pixel.char, current_pixel.text_color, current_pixel.bg_color);

            previous_pixel.char = current_pixel.char;
            previous_pixel.text_color = current_pixel.text_color;
            previous_pixel.bg_color = current_pixel.bg_color;
        }
    }

    if (show_time) {
        const y_pos = window.height + 2;
        output += `\x1b[${y_pos};1H`;
        output += '\x1b[K';
    }

    if (output) {
        process.stdout.write(output);
    }
}

/**
 * The main engine loop.
 */
function update() {
    canvas.forEach(pixel => {
        pixel.char = canvas_bg;
        pixel.text_color = canvas_text_color;
        pixel.bg_color = canvas_bg_color;
    });

    if (sceneNode === '3d') {
        newCamera('3d', 'main');
        setCamera('3d', camera3D);
        scene3D.forEach(obj => {
            switch (obj.type) {
                case 'vec':
                    vec3D(obj.id);
                    break;
                case 'cube':
                    cube3D(obj.id);
                    break;
            }
        });
    } else if (sceneNode === '2d') {
        newCamera('2d', 'main');
        setCamera('2d', camera2D);
        scene2D.forEach(obj => {
            switch (obj.type) {
                case 'square':
                    square2D(obj.id);
                    break;
                case 'triangle':
                    triangle2D(obj.id);
                    break;
                case 'rectangle':
                    rectangle2D(obj.id);
                    break;
                case 'ellipse':
                    ellipse2D(obj.id);
                    break;
            }
        });
    } else {
        console.log(color("[404]-- ERROR: SCENE NODE DO NOT EXIST --[404]", 'white', 'red'));
        return;
    }

    userAnimate();
    render();
}

// =========================
// =   Support functions   =
// =========================

/**
 * Finds an object by its ID in the specified scene ('2d' or '3d').
 * @param {string} scene_node - The scene to search in, either '2d' or '3d'.
 * @param {string} id - The unique identifier of the object to find.
 * @returns {object | undefined} The found object, or undefined if not found.
 */
function find(scene_node, id) {
    const node = scene_node.toLowerCase();
    switch (node) {
        case '2d': {
            const object = scene2D.find(obj => obj.id === id);
            if (object) {
                return object;
            } else {
                show(`Error to find object:\nid: ${id}\nnode: 2D`);
                return undefined;
            }
        }
        case '3d': {
            const object = scene3D.find(obj => obj.id === id);
            if (object) {
                return object;
            } else {
                show(`Error to find object:\nid: ${id}\nnode: 3D`);
                return undefined;
            }
        }
        default:
            show(`Error: Invalid scene node '${scene_node}'`);
            return undefined;
    }
}

function set(node, type, id){
    let object;
    switch(node){
        case '2d': 
            set2D(type, id);
            object = find('2d', id);
            break;
        case '3d':
            set3D(type, id);
            object = find('3d', id);
            break;
    }
    return object;
}

/**
 * Adds a temporary message to be displayed below the rendered canvas.
 * @param {string} text - The message text to display.
 * @param {number} [duration=300] - The number of frames the message should remain visible.
 */
function show(text, duration = 300) {
    messages.push({
        text: text,
        duration: duration
    });
}

/**
 * Wraps a string with ANSI escape codes to apply text and background colors for terminal output.
 * @param {string} string - The input string to be colored.
 * @param {string} [textColor='white'] - The key for the desired text color in the `colors_ansi` object.
 * @param {string} [bgColor='black'] - The key for the desired background color in the `colors_ansi` object.
 * @returns {string} The formatted string with embedded ANSI color codes.
 */
function color(string, textColor = 'white', bgColor = 'black') {
    const textColorCode = colors_ansi[`text_${textColor}`] || colors_ansi.text_white;
    const bgColorCode = colors_ansi[`bg_${bgColor}`] || colors_ansi.bg_black;

    const prefix = '\x1b';
    const reset = '\x1b[0m';

    const colored_string = `${prefix}${textColorCode}${bgColorCode}${string}${reset}`;

    return colored_string;
}

/**
 * Scales an object by modifying its dimensions based on its original size.
 * @param {object} object - The scene object to scale.
 * @param {number} [value1=1] - The scaling factor for the primary dimension.
 * @param {number} [value2=1] - The scaling factor for the secondary dimension (if applicable).
 */
function scale(object, value1 = 1, value2 = 1) {
    if (!object) {
        console.log(color(`-------- \n\n Attempted to scale a null or undefined object. \n\n --------`, 'white', 'red'));
        return;
    }
    const type = object.type;
    switch (type) {
        case 'square':
        case 'triangle':
            object.length = object.const_lenght * value1;
            break;
        case 'rectangle':
            object.width = object.const_width * value1;
            object.height = object.const_height * value2;
            break;
        case 'ellipse':
            object.radiusA = object.const_radiusA * value1;
            object.radiusB = object.const_radiusB * value2;
            break;
        case 'cube':
            object.length = object.const_length * value1;
    }
    if (object.isDirty !== undefined) {
        object.isDirty = true;
    }
}

/**
 * Sets the fill state for a specified scene object.
 * @param {object} object - The scene object to fill.
 */
function fill(object) {
    if (!object) {
        console.log(color(`-------- \n\n Attempted to fill a null or undefined object. \n\n --------`, 'white', 'red'));
        return;
    }
    if(object.fill === false){
        object.fill = true;
    }
}

// ==============
// =   2D API   =
// ==============

/**
 * Updates the position of a specified 2D scene object.
 * @param {object} object - The scene object to be moved.
 * @param {number} x - The new x-coordinate for the object's center.
 * @param {number} y - The new y-coordinate for the object's center.
 */
function translate2D(object, x, y) {
    if (!object) { 
        console.log(color(`-------- \n\n Attempted to translate a null or undefined object. \n\n --------`, 'white', 'red'));
        return;
    }
    object.position = [x, y];
    if (object.isDirty !== undefined) {
        object.isDirty = true;
    }
}

/**
 * Updates the rotation angle of a specified 2D scene object.
 * @param {object} object - The scene object to be rotated.
 * @param {number} angle - The new rotation angle in degrees.
 */
function rotate2D(object, angle) {
    if (!object) {
        console.log(color(`-------- \n\n Attempted to rotate a null or undefined object. \n\n --------`, 'white', 'red'));
        return;
    }
    object.angle = angle;
    if (object.isDirty !== undefined) {
        object.isDirty = true;
    }
}

// ==============
// =   3D API   =
// ==============

/**
 * Create a default camera in the 2D/3D node
 * @param {string} node - The scene node
 * @param {string} id - The camera id 
 */
function newCamera(node, id){
    if(node === '3d'){
        cameras3D[id] = {
            id: id,
            position: [0, 0, 0], 
            rotation: {angleX: 0, angleY: 0, angleZ: 0}, 
            camera_distance: 750
        };
    } else if(node === '2d'){
        cameras2D[id] = {
            id: id,
            position: [0, 0]
        };
    }
}

/**
 * Edit a camera in the 2D/3D node using its id
 * @param {string} node - The scene node
 * @param {object} camera - Your custom camera object
 */
function setCamera(node, camera){
    if(node === '2d'){
        camera2D = camera;
    } else if(node === '3d'){
        camera3D = camera;
    }
}

/**
 * Updates the rotation angle of a specified 3D scene object.
 * @param {object} object - The scene object to be rotated.
 * @param {number} [angleX=0] - The new rotation angle in degrees for X axle.
 * @param {number} [angleY=0] - The new rotation angle in degrees for Y axle.
 * @param {number} [angleZ=0] - The new rotation angle in degrees for Z axle. 
 */
function rotate3D(object, angleX = 0, angleY = 0, angleZ = 0) {
    if (!object) {
        console.log(color(`-------- \n\n Attempted to rotate a null or undefined object. \n\n --------`, 'white', 'red'));
        return;
    }
    object.angleX = angleX;
    object.angleY = angleY;
    object.angleZ = angleZ;
    object.isDirty = true;
}

/**
 * Updates the position of a specified 3D scene object.
 * @param {object} object - The scene object to be moved.
 * @param {number} x - The new x-coordinate for the object's center.
 * @param {number} y - The new y-coordinate for the object's center.
 * @param {number} z - The new z-coordinate for the object's center.
 */
function translate3D(object, x, y, z) {
    if (!object) { 
        console.log(color(`-------- \n\n Attempted to translate a null or undefined object. \n\n --------`, 'white', 'red'));
        return;
    }
    object.position = [x, y, z];
    object.isDirty = true;
}

/**
 * Initializes the application and starts the engine's update loop.
 * @param {function} [animate] - The user-defined function for animations.
 */
function start(animate) {
    if (typeof animate === 'function') {
        userAnimate = animate;
    }

    process.stdout.write('\x1b]0;' + window.title + '\x07');
    process.stdout.on('resize', () => {
        console.clear();
        resetEngine();
    });

    InitScreen();
    setInterval(update, fps);
}

module.exports = {
    // Core
    start,
    InitScreen,
    
    // Configuration
    window,
    sceneNode,
    ratio,
    camera2D,
    camera3D,
    scene2D,
    scene3D,
    
    // Utilities
    find,
    set,
    show,
    color,
    scale,
    fill,
    print,
    line,
    
    // 2D API
    translate2D,
    rotate2D,
    set2D,
    square2D,
    triangle2D,
    rectangle2D,
    ellipse2D,
    
    // 3D API
    translate3D,
    rotate3D,
    set3D,
    cube3D,
    vec3D,

    // Camera
    newCamera,
    setCamera
};