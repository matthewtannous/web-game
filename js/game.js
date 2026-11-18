class Sprite {
    constructor() { }
    update() { return false; }
    draw(ctx) { }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sprites = [];
        this.keys = {};
        this.bindKeyboardEvents();

        // Levels
        this.levels = [];
        this.currentLevelIndex = 0;
        this.pendingLevelIndex = null; // No pending level initially
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    update() {
        let updatedSprites = [];
        for (let sprite of this.sprites) {
            if (!sprite.update(this.sprites, this.keys)) {
                updatedSprites.push(sprite);
            }
        }
        this.sprites = updatedSprites;

        // Levels
        if (this.pendingLevelIndex !== null) {
            this.setLevel(this.pendingLevelIndex);
            this.pendingLevelIndex = null;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sprites.forEach(sprite => sprite.draw(this.ctx));
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
        this.setLevel(this.currentLevelIndex + 1);
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