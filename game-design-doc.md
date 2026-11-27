# Game Design Document

## Title
- **Project:** Color Coded
- **Developer:** Matthew Tannous

## Table of Contents
1. [Introduction](#1-introduction)
2. [Game Overview](#2-game-overview)
3. [Gameplay Mechanics](#3-gameplay-mechanics)
4. [Story and Narrative](#4-story-and-narrative)
5. [Characters](#5-characters)
6. [Levels and Environments](#6-levels-and-environments)
7. [Art Style and Visuals](#7-art-style-and-visuals)
8. [Audio Design](#8-audio-design)
9. [User Interface (UI) Design](#9-user-interface-ui-design)
10. [Technical Requirements](#10-technical-requirements)
11. [Marketing and Promotion](#11-marketing-and-promotion)
12. [Budget and Schedule](#12-budget-and-schedule)
13. [Appendices](#13-appendices)

## 1. Introduction
Color coded is a 2D platforming game in which the player controls a character that can switch between three colors: red, green, and blue. The player must use color-matching mechanics, jumping, and environmental awareness to navigate challenging levels, avoid deadly obstacles, and collect gifts to progress.

The game is intended for casual gamers and those who enjoy platforming challenges.

## 2. Game Overview

### 2.1 High Concept

Navigate a sequence of platforming levels by changing the hero's color to match the platforms. Platforms of a different color cannot be landed on, while black platforms are always solid. Some levels add walls, spikes, and wind that pushes the hero.

### 2.2 Setting and Theme

The game uses abstract, colorful platforming environments. The visual theme is built around color recognition and movement challenges rather than a detailed fictional world. Background images establish the environment, while platform colors communicate the central gameplay rule.

### 2.3 Main Features

- Three selectable hero colors: red, green, and blue.
- Platforms that only support the hero when their color matches.
- Black platforms that always support the hero.
- Horizontal movement and jumping.
- Levels with walls and directional spikes.
- Wind effects in later levels.
- A level menu and a help/tutorial screen.
- A gift collectible that advances the game to the next level.
- Animated hero sprites and sound effects.

## 3. Gameplay Mechanics

### 3.1 Player Controls

| Input | Action |
|---|---|
| Left Arrow or A | Move left |
| Right Arrow or D | Move right |
| Space | Jump |
| C or J | Change to the next color |
| Mouse click | Activate a menu button |

The color sequence is `red -> green -> blue -> red`. The player changes one step in this sequence per key press.

### 3.2 Movement and Jumping

The hero moves horizontally at a fixed movement rate and is affected by gravity. Jumping applies an upward velocity, after which gravity pulls the hero downward.
The hero has a single jump throughout the game, though it can easily be increased if needed for later levels.

The game uses a fixed jump force and gravity value in the current implementation. Movement is updated once per animation frame.

### 3.3 Color-Matching Platforms

A platform can be landed on when the hero is falling, crosses the platform's top surface, overlaps it horizontally, and has the same color. Black platforms are treated as universally solid. A platform of another non-black color does not stop the hero.

The current collision behavior is based on landing from above; platforms are not implemented as general solid objects on all sides.

### 3.4 Walls and Hazards

Walls block the hero when the hero crosses their sides or top/bottom boundaries. A wall can have spikes on any combination of its four sides. Contact with a spiked side resets the hero to the level's starting position and restores the starting color. Walls are drawn in black with a visible outline and gray spikes.

### 3.5 Wind

Later levels add a visual wind effect made from moving horizontal particles. The hero can also receive a constant horizontal wind force configured per level. The visual particles move from right to left; the hero's configured wind push is applied during movement updates.

### 3.6 Objective and Progression

The objective in each playable level is to reach and collect the gift. Collecting it advances to the next level. The current game defines a menu, a help screen, and five playable levels. The final playable level has no separately implemented end-game or credits sequence; progression beyond it is not defined in the current prototype.

### 3.7 Failure and Restart

Touching a spiked wall side calls the hero's death/reset behavior. The hero returns to its recorded starting coordinates, vertical velocity is cleared, and the color is reset to red. There is no separate lives counter or game-over screen in the current implementation.

## 4. Story and Narrative

The current prototype does not contain a developed plot, dialogue, or named fictional setting. Its progression is challenge-based: the player moves through increasingly varied platform layouts and collects a gift to complete each level. Narrative elements, character backstory, branching paths, and multiple endings are outside the current scope.

## 5. Characters

### 5.1 The Hero

- **Role:** Player-controlled character.
- **Appearance:** A small character represented by an animated spritesheet. The selected color determines which color row of the spritesheet is displayed.
- **Abilities:** Move left and right, jump, change color, and withstand ordinary contact with non-spiked wall surfaces.
- **Motivation:** Reach the gift at the end of each level.
- **Behavior on hazard contact:** Reset to the starting position and red color.

No other named characters or non-player characters are currently implemented.

## 6. Levels and Environments

All playable levels use the same general background asset and are built by placing platforms, walls, the hero, a color indicator, a gift and (where applicable) wind particles. Coordinates are defined in the game code relative to a 1200x800 canvas.

### 6.1 Main Menu

Displays the menu background and two clickable buttons:
- **Start Game:** Opens the first playable level.
- **Help:** Opens the tutorial screen.

### 6.2 Help Screen

Displays the movement, jump, and color-change controls over the menu background, with a Back button that returns to the main menu.

### 6.3 Level 1

Introduces the core color-matching mechanic. The level contains a black ground platform, a sequence of red, green, and blue platforms at increasing heights, and a gift near the upper-right area.

### 6.4 Level 2

Uses a more varied platform arrangement, including small and narrow platforms, a vertical arrangement of colored platforms, a black wall, and a gift near the upper-right area. It tests movement and color selection across a less linear layout.

### 6.5 Level 3

Introduces spike hazards and a more constrained route. The level uses a black ground wall, colored platforms, several spiked walls, and a central vertical obstacle. The gift is placed toward the right side.

### 6.6 Level 4

Introduces wind. The level includes wind particles and a constant horizontal force on the hero, alongside colored platforms arranged across the play area. The gift is placed toward the upper-left area. The hero is configured with one jump.

### 6.7 Level 5

Combines wind, walls, colored platforms, and a more complex route. The hero starts near the right side and receives a stronger leftward wind push that prevents him from moving right. The level is configured with five jumps and includes a gift near the lower-left area.

### 6.8 Level Design Notes

The level layouts and object coordinates are currently authored directly in JavaScript. There is no separate level editor or external level-data format. Difficulty progression is expressed through platform placement, platform width, hazards, wind, and jump configuration.

## 7. Art Style and Visuals

The game uses a simple, high-contrast 2D style. Color is functional as well as decorative: red, green, and blue communicate which platforms can support the hero. Black indicates universally solid ground or walls.

Visual assets in the current project include:

- [`hero-spritesheet.png`](./assets/images/hero-spritesheet.png) for the player animation.
- [`platform-spritesheet.png`](./assets/images/platform-spritesheet.png) for larger colored platforms.
- [`menu-background.png`](./assets/images/menu-background.png) for the menu and help screens.
- [`level-background.png`](./assets/images/level-background.png) for playable levels.

Small platforms are drawn as solid colored rectangles because the platform sprites are not suitable for "tall" platforms. Walls and spikes are drawn procedurally with canvas shapes.

## 8. Audio Design

The current audio implementation includes:
- [`background-music.opus`](./assets/audio/background-music.opus) as looping/continuous background music intent (the current code creates an Audio object and calls `play()`).
- [`jump.wav`](./assets/audio/jump.wav) as the jump sound effect, triggered when a jump begins.

There is no implemented voice acting, dialogue audio, sound mixer, settings menu, or explicit mute/volume control. Browser autoplay restrictions may prevent background music from starting until the player interacts with the page.

## 9. User Interface (UI) Design

The interface is rendered directly on the HTML canvas.

### 9.1 Main Menu

Two centered buttons provide access to Start Game and Help. Buttons change shade when the pointer hovers over them and respond to mouse clicks.

### 9.2 Help Screen

The tutorial lists the keyboard controls and provides a Back button.

### 9.3 In-Game Indicators

- The hero's appearance communicates the current color.
- A small `Next:` indicator on the top-left of the canvas shows the next color in the rotation.
- The gift is represented by an orange rectangle with a red ribbon.
- Collecting the gift takes the player to the next level and displays a `You win` message during the transition frame/update.

## 10. Technical Requirements

The current build is a browser game using HTML, JavaScript, and the HTML5 Canvas 2D API. It requires a modern browser with JavaScript, canvas, image, audio, keyboard, mouse, and `requestAnimationFrame` support.

The page uses a 1200x800 canvas. No server, database, account system, or network connection is required by the current source. Detailed implementation requirements are documented in [`technical-design-doc.md`](./technical-design-doc.md).

## 11. Marketing and Promotion

No formal marketing campaign is currently defined. Potential materials for a future release include:
- A short gameplay trailer demonstrating color-matching and hazard mechanics.
- Screenshots or short clips showing the five levels.
- A concise browser-playable game page with control instructions.
- Social posts highlighting the color-switching mechanic.

These are recommendations for a future release, not features or campaigns already completed.

## 12. Budget and Schedule

A formal budget, staffing plan, and delivery schedule have not been provided. The current project is a small prototype with a limited asset set and a JavaScript implementation. Any future estimate should account for level design, programming, art and animation, audio, browser testing, accessibility, and release preparation.

## 13. Appendices

- [`index.html`](./index.html): page entry point and canvas declaration.
- [`js/game.js`](./js/game.js): game loop, input handling, level management, and camera.
- [`js/myCode.js`](./js/myCode.js): game-specific sprites, player behavior, hazards, UI elements, and level definitions.
- [`assets/images/`](./assets/images/): visual assets.
- [`assets/audio/`](./assets/audio/): music and sound effects.