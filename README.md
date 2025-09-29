# Iot Engine - General-purpose terminal graphics engine in JavaScript

  - *\!Beta\! Version: 0.0.15*

  - *Language: English*

-----

## What is IEF?

> **IEF 0.0.15 (Iot Engine Fast)** is an **open-source** terminal graphics engine built in **NodeJS**. It was designed to be **fast and easy to use**, allowing the creation of complex **2D and 3D scenes** directly in your terminal, while combining **performance with efficiency**, ensuring quality for your scenes. <br>
> Its differential lies in its **performance, optimization, and practicality**, making it easier to display graphics in the terminal.

## What does IEF deliver to me?

> IEF's objective is to **facilitate the display of graphics in the terminal**, with **high performance and efficiency**. Its differential is high performance and efficiency. IEF aims to be a **simple-to-use, consistent, and efficient** graphics engine.

## Who is IEF for?

> IEF is an engine made **for everyone**, from an experienced developer who wants to create a game using the terminal, to a beginner who wants to start creating games. Or even for those who want to create **simulations, mathematical visualizations**, etc. <br>
> Our goal for IEF is to constantly **improve the experience and quality** of our engine for our users in all aspects.

<br>

-----

## What does IEF have to offer?

  - **3D and 2D Scene Rendering:** Create 2D or 3D scenes effortlessly and with equal performance in both.
  - **Open Source:** Anyone can access and use the code.
  - **High Performance:** Create complex scenes with countless elements and high quality smoothly, without lag or screen flickering.
  - **Rendering with Colors:** Bring your scenes to life by adding color to them in the terminal.
  - **Friendly API:** Easily manipulate any element in your scene without complication and with a clear syntax, using functions like `translate2D()` and `rotate3D()`.
  - **Zero Dependencies:** Pure NodeJS, which makes it light and easy to integrate into any project.

## How to use IEF?

IEF has two versions for you to use:

  * **Common JS:**
    Add the `lib/` folder and the `package.json` file to your directory, and inside `lib/` include the file `ief.cjs`.
    Then, create a file where you will use the engine.

    Example:
    
    `[hello\_world.js]`

    ```javascript
    const IEF = require('./lib/ief.cjs');

    // Cube variables
    let cube;
    let angleX = 0;
    let angleY = 0;

    // Create scene elements
    cube = IEF.set('3d', 'cube', 'myCube'); // Your scene node (2D or 3D), your object type, your object ID
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
    ```

-----

  * **ES Modules:**
    Add the `lib/` folder and the `package.json` file to your directory, and inside `lib/` include the file `ief.mjs`.
    Then, create a file where you will use the engine.

    Exemple:
    
    `hello_world.js`
    
    ```javascript
    import { start, set, rotate3D } from './lib/ief.mjs';

    // Cube variables
    let cube;
    let angleX = 0;
    let angleY = 0;

    // Create scene elements
    cube = set('3d', 'cube', 'myCube'); // Your scene node (2D or 3D), your object type, your object ID
    cube.color = 'bright_yellow'; // Change the cube color
    IEF.fill(cube);

    // Animation Function
    function animate() {
        angleX++; // Spins the cube
        angleY++;
        rotate3D(cube, angleX, angleY, 0); // X, Y, Z
    }

    start(animate);
    ```

-----

## Beta Version Considerations

Please note that IEF is under active development (beta version). Although the listed features are functional, the API may change in future releases, and bugs may be present. Community feedback and contributions are highly welcome to help stabilize and improve the project.
