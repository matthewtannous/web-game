const CANVAS = document.getElementById("canvas");
const CANVAS_WIDTH = CANVAS.width;
const CANVAS_HEIGHT = CANVAS.height;

class Sprite {
    constructor() { }
    update() { return false; }
    draw(ctx) { }
}

class Game {
    constructor(camera) {
        this.ctx = CANVAS.getContext('2d');
        this.sprites = [];
        this.keys = {};
        this.bindKeyboardEvents();

        this.mouse = { x: 0, y: 0, clicked: false };
        this.bindMouseEvents();
        this.mouseWasClicked = false;

        // Levels
        this.levels = [];
        this.currentLevelIndex = 0;
        this.pendingLevelIndex = null; // No pending level initially

        // Camera
        this.camera = camera;
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    update() {
        let updatedSprites = [];
        for (let sprite of this.sprites) {
            if (!sprite.update(this.sprites, this.keys, this.mouse)) {
                updatedSprites.push(sprite);
            }
        }
        this.sprites = updatedSprites;

        // Levels
        if (this.pendingLevelIndex !== null) {
            this.setLevel(this.pendingLevelIndex);
            this.pendingLevelIndex = null;
        }

        // Reset mouse click
        this.mouse.clicked = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

        if (!this.camera) return;
        this.camera.begin(this.ctx);

        this.sprites.forEach(sprite => sprite.draw(this.ctx));

        this.camera.end(this.ctx);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    bindKeyboardEvents() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    bindMouseEvents() {
        CANVAS.addEventListener("mousemove", (e) => {
            const rect = CANVAS.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        CANVAS.addEventListener("mousedown", () => {
            this.mouse.down = true;
            this.mouse.clicked = true; // Tracks single clicks
        });

        CANVAS.addEventListener("mouseup", () => {
            this.mouse.down = false;
        });

        CANVAS.addEventListener("mouseleave", () => {
            this.mouse.down = false;
        });
    }

    // Levels
    addLevel(level) {
        this.levels.push(level);
        if (this.levels.length === 1) {
            this.setLevel(0);
        }
    }

    setLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.sprites = [];
            this.currentLevelIndex = index;
            this.levels[index].initialize();
        }
    }

    changeLevel(index) {
        this.pendingLevelIndex = index;
    }

    nextLevel() {
        this.changeLevel(this.currentLevelIndex + 1);
    }

    previousLevel() {
        this.setLevel(this.currentLevelIndex - 1);
    }
}

class Level {
    constructor(game) {
        this.game = game;
    }
    initialize() { }
}

class Camera {
    constructor(player) {
        this.x = 0;
        this.y = 0;
        this.width = CANVAS_WIDTH;
        this.height = CANVAS_HEIGHT;
        this.player = null;

        /* Camera behavior configuration */
        // Distance from edges where player should stay w.r.t screen/camera
        this.leftOffset = 160;
        this.rightOffset = 160;

        // Smoothing factor for horizontal/vertical movement
        this.horizontalSmoothing = 0.1;
        this.verticalSmoothing = 0.05;

        // Vertical deadzone smooth platform transitions
        this.verticalDeadzone = 50;

        // Level boundaries
        this.maxX = 0;
        this.maxY = 0;

        // Player
        this.player = player;
    }

    setLevelBoundaries(width, height) {
        this.maxX = Math.max(0, width - CANVAS_WIDTH);
        this.maxY = Math.max(0, height - CANVAS_HEIGHT);
    }

    update() {
        if (!this.player) return;

        // Calculate target camera position
        let targetX = this.player.x - this.leftOffset;
        let targetY = this.player.y - this.height / 2;

        // Prevent backward scrolling
        targetX = Math.max(targetX, this.x);

        // Apply level boundaries
        targetX = Math.max(0, Math.min(targetX, this.maxX));
        targetY = Math.max(0, Math.min(targetY, this.maxY));

        // Smooth camera movement
        this.x += (targetX - this.x) * this.horizontalSmoothing;

        // Only adjust vertical position if change is significant
        if (Math.abs(targetY - this.y) > this.verticalDeadzone) {
            this.y += (targetY - this.y) * this.verticalSmoothing;
        }
    }

    worldToScreen(x, y) {
        return {
            x: x - this.x,
            y: y - this.y,
        };
    }

    screenToWorld(x, y) {
        return {
            x: x + this.x,
            y: y + this.y,
        };
    }

    isVisible(sprite) {
        return (
            sprite.x + sprite.width > this.x &&
            sprite.x < this.x + this.width &&
            sprite.y + sprite.height > this.y &&
            sprite.y < this.y + this.height
        );
    }

    // Apply camera transform to context
    begin(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
    }

    // Restore context state
    end(ctx) {
        ctx.restore();
    }

    draw(ctx) { }
}