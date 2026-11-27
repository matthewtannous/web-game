# Technical Design Document

## Title
- **Project:** Color Coded
- **Developer:** Matthew Tannous

## Table of Contents
1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [System Requirements](#3-system-requirements)
4. [User Interface (UI) Design](#4-user-interface-ui-design)
5. [Modules and Components](#5-modules-and-components)
6. [Algorithms and Data Structures](#6-algorithms-and-data-structures)
7. [Performance Optimization](#7-performance-optimization)
8. [Error Handling and Logging](#8-error-handling-and-logging)
9. [Testing and Quality Assurance](#9-testing-and-quality-assurance)
10. [Documentation](#10-documentation)

## 1. Introduction
Color Coded is a browser-based 2D platform game. The player moves a character through levels, changes between red, green, and blue, lands only on platforms matching the active color (with black platforms acting as universal surfaces), avoids spiked wall sides, and collects gifts to advance.

### 1.1 Scope

The current technical scope includes:
- HTML page and fixed-size canvas setup.
- JavaScript game loop and sprite lifecycle.
- Keyboard and mouse input.
- Level creation and transitions.
- Camera transform and coordinate helpers.
- Player movement, jumping, color switching, collision checks, and animation.
- Platforms, walls, spikes, gifts, backgrounds, wind particles, and simple menu/tutorial UI.
- Image and audio asset loading.

Networking, persistence, user accounts, online multiplayer, and server-side services are not part of the current implementation.

## 2. Architecture Overview

### 2.1 High-Level Structure

The application is organized into an HTML entry page and two JavaScript files:

- [`index.html`](./index.html) creates the canvas and loads the scripts.
- [`js/game.js`](./js/game.js) provides the game engine.
- [`js/myCode.js`](./js/myCode.js) defines game-specific objects and level content.
- [`assets/`](./assets/) contains images and audio files loaded by the JavaScript code.

The architecture is a lightweight object-oriented, sprite-based game loop. The `Game` object owns the active sprite list, input state, level list, rendering context, and camera. Each sprite may implement `update()` and `draw()` methods.

### 2.2 Runtime Flow

1. The browser loads [`index.html`](./index.html).
2. The page creates a 1200x800 canvas.
3. [`game.js`](./js/game.js) defines the base engine classes.
4. [`myCode.js`](./js/myCode.js) defines game-specific classes, constructs the camera and game, registers levels, and starts animation.
5. `Game.animate()` updates active sprites, draws the scene, and schedules the next frame with `requestAnimationFrame`.
6. Input event handlers update shared keyboard and mouse state.
7. A level transition is queued and applied during the game update.

## 3. System Requirements

### 3.1 Runtime Requirements

- A modern desktop browser with JavaScript enabled.
- HTML5 Canvas 2D support.
- `requestAnimationFrame` support.
- Keyboard and mouse event support.
- Browser image and audio playback support.
- Local access to the project HTML, JavaScript, and asset files, or static hosting that preserves their relative paths.

### 3.2 Display

- Canvas dimensions: 1200x800 pixels.
- The canvas is declared with fixed intrinsic dimensions in [`index.html`](./index.html).
- The current page does not implement responsive canvas scaling or touch-specific input.

### 3.3 Software and Dependencies

The supplied project uses browser-native APIs and does not declare an external package manager, build system, framework, or third-party runtime dependency.

## 4. User Interface (UI) Design

### 4.1 Canvas-Based UI

All current interface elements are drawn into the game canvas rather than built as HTML controls.

### 4.2 Menu and Help

`LevelMenu` creates a background and two `Button` sprites. The Start Game callback requests level index 2 (the first playable level, after menu and help); Help requests level index 1. `LevelHelp` creates the tutorial text and a Back button that requests level index 0.

The `Button` class checks pointer position during update, changes its fill shade on hover, and invokes its callback when the mouse click flag is set while hovered.

### 4.3 Gameplay Indicators

- Hero color is represented by the matching row of the hero spritesheet.
- `ColorHelper` draws `Next:` and a circle in the next color in the `red -> green -> blue` sequence.
- `Gift` draws a gift-like rectangle and ribbon, then draws `You win` after collection.
- `TutorialText` displays movement, jump, and color-switch instructions.
- `JokeText` is defined as a timed text sprite. It was only used for testing, and remains unused.

## 5. Modules and Components

### 5.1 [`index.html`](./index.html)

Responsibilities:
- Declares the document and page title.
- Creates the canvas element with ID `canvas` and dimensions 1200x800.
- Loads [`js/game.js`](./js/game.js) followed by [`js/myCode.js`](./js/myCode.js).

The script order is significant because [`myCode.js`](./js/myCode.js) extends and uses classes defined in [`game.js`](./js/game.js).

### 5.2 Core Engine: [`js/game.js`](./js/game.js)

#### `Sprite`

Base class for game objects. Defines default `update()` and `draw()` methods. An update method may return a truthy value to request removal from the active sprite list.

#### `Game`

Responsibilities:
- Gets the canvas 2D rendering context.
- Stores sprites, keyboard state, mouse state, levels, current level index, and pending level index.
- Registers keyboard and mouse event listeners.
- Calls each sprite's update method.
- Removes sprites whose update method returns truthy.
- Applies queued level changes.
- Clears and renders the canvas.
- Runs the animation loop using `requestAnimationFrame`.

`addSprite(sprite)` appends a sprite to the active list. `addLevel(level)` registers a level and initializes the first registered level. `setLevel(index)` clears active sprites and initializes the requested level if the index is valid. `changeLevel(index)` queues a transition. `nextLevel()` queues the next numeric level.

#### `Level`

Stores a reference to the game and provides an `initialize()` method for subclasses to populate the active scene.

#### `Camera`

Stores camera position and dimensions, level bounds, and smoothing configuration. It provides coordinate conversion, visibility testing, and drawing-context transform methods. The current main loop calls `begin()` and `end()` but does not call `update()`.

### 5.3 Game-Specific Components: [`js/myCode.js`](./js/myCode.js)

#### Constants and Audio

Defines black as the universal platform/wall color and red, green, and blue as player colors. Creates the background music Audio object and calls `play()` during script initialization.

#### `Background`

Loads a background image from [`assets/images/`](./assets/images/) and draws it across the canvas dimensions.

#### `WindEffect`

Creates 50 horizontal particles with randomized positions, lengths, and speeds. Each update moves particles left; particles leaving the left edge are repositioned to the right at a randomized vertical coordinate.

#### `Platform`

Stores position, dimensions, and color. Larger colored platforms draw a region from [`platform-spritesheet.png`](./assets/images/platform-spritesheet.png); small platforms and fallback cases draw filled rectangles. Platform collision is handled by `Hero`, not by the platform itself.

#### `Wall`

Stores position, dimensions, color, and four boolean spike flags. Draws a filled rectangle, outline, and optional procedural spikes on each enabled side.

#### `Hero`

Stores start position, current position, dimensions, horizontal speed, color, vertical velocity, gravity, jump force, jump count, jump limit, wind push, animation state, and audio/image resources.

Responsibilities:
- Apply horizontal keyboard movement and configured wind push.
- Apply jump impulse when Space is pressed, the key is newly available, and the jump limit has not been reached.
- Cycle player color when C or J is pressed.
- Apply gravity and update vertical position.
- Detect platform landings and wall intersections.
- Reset to the start position when a spiked wall side is crossed.
- Select animation frames and draw the correct color row, flipping the sprite when facing left.

The hero creates its own jump Audio object and loads the hero spritesheet.

#### `Gift`

Checks for overlap with the hero. On collection, marks itself collected and asks the game to advance to the next level. It draws the gift before collection and a `You Win!` message after collection on the final level.

#### `ColorHelper`

Reads the hero's current color, computes the next color in the sequence, and draws a text label and colored indicator.

#### `Button`

Stores a rectangle, label, callback, and hover state. It detects mouse hover and invokes its callback on a click inside its bounds.

#### `TutorialText`

Draws the keyboard instructions on the help screen.

#### `JokeText`

Unused Sprite. Displays a timed message for 300 update calls and then requests removal.

### 5.4 Level Classes

- `LevelMenu`: menu background, Start Game, Help.
- `LevelHelp`: tutorial instructions and Back button.
- `Level1`: introductory sequence of colored platforms and gift.
- `Level2`: mixed platform layout, vertical elements, wall, and gift.
- `Level3`: spike walls and more constrained platform layout.
- `Level4`: wind particles and horizontal wind force.
- `Level5`: wind, walls, multiple platform routes, five-jump configuration, and gift.

Levels are registered in this order. The menu is index 0, help is index 1, and playable levels are indices 2 through 6.

## 6. Algorithms and Data Structures

### 6.1 Sprite Collection

The active scene is represented by a JavaScript array of sprite instances. During update, the game builds a new array containing sprites whose `update()` methods do not return truthy. This supports self-removal, as used by timed sprites.

- Update traversal: O(n) per frame for n active sprites.
- Rebuilding the active list: O(n) per frame.
- Rendering: O(n) draw calls per frame, excluding the internal work of each sprite.

### 6.2 Input State

Keyboard state is stored in an object keyed by `KeyboardEvent.key`. Keydown sets a key to true; keyup sets it to false. Mouse coordinates and click state are stored in a shared object updated by canvas events.

The player uses latch booleans (`canJump` and `canChangeColor`) so holding a key does not repeatedly trigger a jump or color change. The key must be released to re-arm the action.

### 6.3 Color Cycle

The color transition is a three-state cycle:
- Red -> Green
- Green -> Blue
- Blue -> Red

The same mapping is used by the color helper to display the next color. Platform landing accepts a matching color or a black platform.

### 6.4 Platform Collision

For each platform, the hero checks:
1. Horizontal overlap between the hero rectangle and platform rectangle.
2. Whether the hero's previous bottom edge was at or above the platform top.
3. Whether the current bottom edge has crossed the platform top.
4. Whether the hero is falling or stationary vertically (`dY >= 0`).
5. Whether colors match or the platform is black.

The code tracks the candidate platform with the smallest y-coordinate among qualifying platforms, then places the hero on its top and clears vertical velocity and jump count.

### 6.5 Wall Collision

Wall collision uses previous and current hero positions to detect crossing the wall's left, right, top, or bottom boundary. If the relevant wall side has spikes, `Hero.die()` is called. Otherwise, the hero is repositioned against the wall boundary.

The current code uses axis-aligned rectangles and crossing tests; it does not use a physics engine or continuous collision library.

### 6.6 Gift Collection

The gift checks the hero's position for rectangle overlap. On collection it sets `collected` and calls `game.nextLevel()`. 

### 6.7 Wind Particle Update

For p particles, each particle is moved and conditionally reset once per update. The particle update is O(p), with p fixed at 50 in the current implementation.

## 7. Performance Optimization

### 7.1 Current Approach

The project is small and uses native canvas drawing, a single animation loop, and a modest number of sprites. The wind system uses a fixed pool of 50 particle objects rather than creating a new particle on each frame.

### 7.2 Recommended Improvements

These are recommendations, not currently implemented features:
- Use the elapsed frame time (delta time) to make movement independent of refresh rate.
- Avoid creating a new filtered sprite array every frame by using a controlled in-place removal strategy or a reusable buffer.
- Cache frequently used image assets instead of constructing separate image objects for repeated resources.
- Wait for image/audio load completion and provide explicit failure handling.
- Cull off-screen sprites using `Camera.isVisible()` once camera movement is enabled and level sizes justify it.
- Avoid repeated collision calculations where possible; separate collision detection from resolution.
- Profile with browser developer tools before introducing more complex optimization.
- Consider a fixed logical canvas with responsive CSS scaling and pointer-coordinate conversion.

## 8. Error Handling and Logging

The hero checks whether its spritesheet is loaded before drawing it. If it is unavailable, the hero is drawn as a solid rectangle in its current color. Other image draws do not consistently check image readiness.

The current code does not define a centralized error handler, logging utility, or structured error-reporting mechanism. Audio playback is initiated without handling the Promise returned by `play()`, so browser autoplay rejection may appear as an unhandled promise rejection.

## 9. Testing and Quality Assurance

No automated tests or test framework are included in the supplied project. The following plan is recommended for development and release validation.

### 9.1 Unit-Level Tests

Test isolated logic such as:
- Color cycle `red -> green -> blue -> red`.
- Jump latch: one jump per key press, re-armed after release.
- Jump limit enforcement and reset on landing.
- Platform matching and black-platform acceptance.
- Wall collision on each side, including spike and non-spike behavior.
- Gift overlap and one-time collection.
- Wind particle wraparound.

### 9.2 Integration Tests

- Confirm the menu loads and `Start Game` opens Level 1.
- Confirm `Help` opens and `Back` returns to the menu.
- Confirm collecting each gift advances exactly one level.
- Confirm player reset after spike contact.
- Confirm all images and audio files resolve from their expected relative paths.
- Confirm background and jump audio behavior under browser autoplay policies.
- Confirm no uncaught exceptions occur during normal play.

### 9.3 Manual Acceptance Tests

1. Open [`index.html`](./index.html) in a supported browser or serve the project from a local static web server.
2. Verify the menu and both buttons render and respond to clicks.
3. Verify left/right movement using both arrow keys and A/D.
4. Verify Space triggers a jump and holding Space does not repeatedly jump.
5. Verify C and J cycle colors once per press.
6. Verify the hero lands on matching and black platforms, but not on mismatched colored platforms.
7. Verify walls block movement and spiked sides reset the hero.
8. Verify wind levels visibly show particles and apply the configured force.
9. Verify gifts trigger progression through the available levels.
10. Verify the game behaves acceptably at different browser window sizes, documenting the current fixed-canvas limitation.

### 9.4 Browser Coverage

At minimum, test current versions of Chromium-based browsers and Firefox. Safari should also be tested if it is a target platform, particularly for Opus audio support and autoplay behavior.

## 10. Documentation

### 10.1 Code Documentation

- Use clear class and method names.
- Document non-obvious collision calculations and coordinate conventions.
- Keep comments synchronized with actual behavior.
- Document level-specific hero parameters (jump count and wind push) near each level definition.

### 10.2 Project Documentation

Maintain:
- [`game-design-doc.md`](./game-design-doc.md) for player experience, rules, levels, art, and audio direction.
- [`technical-design-doc.md`](./technical-design-doc.md) for architecture, implementation, algorithms, testing, and engineering decisions.
- A `README` with setup and run instructions, controls, and asset attribution.
- An asset inventory recording source, license, dimensions, and intended use.

### 10.3 API and Interface Contracts

The current project has no external API. Internal conventions include:
- A sprite may implement `update(sprites, keys, mouse)` and `draw(ctx)`.
- Returning a truthy value from `update()` asks `Game` to remove that sprite.
- A level implements `initialize()` and adds its scene objects through `game.addSprite()`.
- Level changes should be requested through `game.changeLevel(index)` or `game.nextLevel()` so they are applied by the game update loop.