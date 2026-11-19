// Colors
const COLOR0 = "black"; // Wall color, cannot phase through black object

// Player colors
const COLOR1 = "red";
const COLOR2 = "blue";
const COLOR3 = "yellow";

class Background extends Sprite {
    draw(ctx) {
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}

class Platform extends Sprite {
    constructor(x, y, width, height, color) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Wall extends Sprite {
    constructor(x, y, width, height, color) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


class Hero extends Sprite {
    constructor(x, y, width, height, dX, color) {
        super();

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dX = dX;
        this.color = color;

        // Jump information
        this.dY = 0;
        this.gravity = 0.6;
        this.jumpForce = -13;
        this.jumpCount = 0;
        this.maxJumps = 1;
        this.canJump = true; // true if space is not being pressed

        // Change color information
        this.canChangeColor = true; // true if  c  is not being pressed
    }

    update(sprites, keys) {
        // Used for collision with wall and platforms
        const previousX = this.x;
        const previousY = this.y;

        // Horizontal movement
        if ((keys['ArrowLeft'] || keys['a']) && this.x >= 0) {
            this.x -= this.dX;
        }
        if ((keys['ArrowRight'] || keys['d']) && this.x <= CANVAS_WIDTH - this.width) {
            this.x += this.dX;
        }

        if (keys[' '] && this.canJump && this.jumpCount < this.maxJumps) {
            this.dY = this.jumpForce;
            this.jumpCount++;
            this.canJump = false;
        }
        if (!keys[' ']) this.canJump = true;

        // Change color
        if ((keys['c'] || keys['j']) && this.canChangeColor) {
            this.canChangeColor = false;

            switch (this.color) {
                case COLOR1:
                    this.color = COLOR2;
                    break;
                case COLOR2:
                    this.color = COLOR3;
                    break;
                case COLOR3:
                    this.color = COLOR1;
            }
        }
        if (!keys['c'] && !keys['j']) this.canChangeColor = true;

        this.dY += this.gravity;
        this.y += this.dY;

        // Find the highest platform crossed during this falling frame.
        let landingPlatform = null;

        for (const sprite of sprites) {
            if (sprite instanceof Platform) {

                // x axis
                const overlaps =
                    this.x < sprite.x + sprite.width &&
                    this.x + this.width > sprite.x;

                // y axis
                const crossesTop =
                    previousY + this.height <= sprite.y && // ball was ABOVE the platform
                    this.y + this.height >= sprite.y; // ball is now BELOW the platform

                // Check if sprite and this have same color OR the sprite is black (black = always collide)
                const colorCollision = (this.color === sprite.color) || sprite.color === COLOR0;

                // Ball is falling AND ...
                if (this.dY >= 0 && overlaps && crossesTop && colorCollision) {
                    // if no platform found yet  OR  new platform is higher than previous landingPlatform
                    if (landingPlatform === null || sprite.y < landingPlatform.y) {
                        landingPlatform = sprite;
                    }
                }

            } else if (sprite instanceof Wall) {
                // x axis
                const crossesLeft =
                    previousX + this.width <= sprite.x &&
                    this.x + this.width >= sprite.x;

                const crossesRight =
                    previousX >= sprite.x + sprite.width &&
                    this.x <= sprite.x + sprite.width;

                const collisionX =
                    this.x < sprite.x + sprite.width &&
                    this.x + this.width > sprite.x;

                // y axis
                const crossesTop =
                    previousY + this.height <= sprite.y &&
                    this.y + this.height >= sprite.y;

                const crossesBottom =
                    previousY >= sprite.y + sprite.height &&
                    this.y <= sprite.y + sprite.height;


                const collisionY =
                    this.y < sprite.y + sprite.height &&
                    this.y + this.height > sprite.y;

                if (collisionY) {
                    if (crossesLeft) this.x = sprite.x - this.width;
                    else if (crossesRight) this.x = sprite.x + sprite.width;
                }
                if (collisionX) {
                    if (crossesTop) this.y = sprite.y - this.height;
                    else if (crossesBottom) this.y = sprite.y + sprite.height;
                }
            }

            // Ball landed on a platform/ground
            if (landingPlatform !== null) {
                this.y = landingPlatform.y - this.height;
                this.dY = 0;
                this.jumpCount = 0;
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();

        // ctx.fillStyle = "#e62f2fb0";
        ctx.fillStyle = this.color;
        // ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2, false);
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.fill();
    }
}

class Gift extends Sprite {
    constructor(x, y, width, height, game) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.collected = false;

        // Levels
        this.game = game;
    }

    update(sprites) {
        // Check this.collected  so it exits early, since there is no need to do
        // anything in this function after collecting the gift
        if (this.collected) return;

        for (let sprite of sprites) {
            if (sprite instanceof Hero) {
                // Check collision
                if (sprite.x + sprite.width >= this.x &&
                    sprite.x - sprite.width <= this.x + this.width &&
                    sprite.y + sprite.height >= this.y &&
                    sprite.y - sprite.height <= this.y + this.height
                ) {
                    this.collected = true;
                    this.game.nextLevel();
                }
            }
        }
    }

    draw(ctx) {
        if (this.collected) { // draw "you win" text
            ctx.font = "48px sans serif";
            ctx.fillStyle = "darkblue";
            ctx.textAlign = "center";
            ctx.fillText("You win!", CANVAS_WIDTH / 2, 50);
        } else { // draw gift
            ctx.fillStyle = "orange";
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = "#a92d2d";
            ctx.fillRect(this.x + this.width / 2 - 3, this.y, 6, this.height);
            ctx.fillRect(this.x, this.y + this.height / 4, this.width, 6);
        }
    }
}

class ColorHelper extends Sprite {
    constructor(hero) {
        super();
        this.hero = hero;
    }

    draw(ctx) {
        ctx.beginPath();
        switch (this.hero.color) {
            case COLOR1:
                this.nextColor = COLOR2;
                break;
            case COLOR2:
                this.nextColor = COLOR3;
                break;
            case COLOR3:
                this.nextColor = COLOR1;
        }
        ctx.font = "20px Arial";
        ctx.fillStyle = this.nextColor;
        ctx.textAlign = "left";
        ctx.fillText("Next:", 0, 20);
        ctx.arc(65, 15, 15, 0, Math.PI * 2, false);
        ctx.fill();

    }
}

class Level1 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background());

        // Add hero
        const hero = new Hero(50, CANVAS_HEIGHT - 100, 50, 50, 5, COLOR1);
        this.game.addSprite(hero);

        // Add color helper
        this.game.addSprite(new ColorHelper(hero));

        // Add platforms
        // Ground
        this.game.addSprite(new Platform(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25, COLOR0));

        this.game.addSprite(new Platform(300, CANVAS_HEIGHT - 150, 200, 30, COLOR1));
        this.game.addSprite(new Platform(600, CANVAS_HEIGHT - 250, 200, 30, COLOR1));

        this.game.addSprite(new Platform(300, CANVAS_HEIGHT - 350, 200, 30, COLOR2));
        this.game.addSprite(new Platform(600, CANVAS_HEIGHT - 450, 200, 30, COLOR2));

        this.game.addSprite(new Platform(300, CANVAS_HEIGHT - 550, 200, 30, COLOR3));
        this.game.addSprite(new Platform(600, CANVAS_HEIGHT - 650, 200, 30, COLOR3));

        // Add gift
        const gift = new Gift(900, 20, 35, 40, this.game); // Change level when collecting gift
        this.game.addSprite(gift);

    }
}

class Level2 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background());

        // Add hero
        const hero = new Hero(50, CANVAS_HEIGHT - 100, 50, 50, 5, COLOR1);
        this.game.addSprite(hero);

        // Add color helper
        this.game.addSprite(new ColorHelper(hero));

        // Add gift
        const gift = new Gift(CANVAS_WIDTH - 50, 20, 35, 40, this.game);
        this.game.addSprite(gift);

        // Add platforms
        // Ground
        this.game.addSprite(new Platform(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25, COLOR0));

        this.game.addSprite(new Platform(125, 320, 150, 25, COLOR3));
        this.game.addSprite(new Platform(340, 220, 140, 25, COLOR1));
        this.game.addSprite(new Platform(570, 100, 125, 25, COLOR2));
        this.game.addSprite(new Platform(725, 280, 90, 25, COLOR1));

        // Lower half platforms
        this.game.addSprite(new Platform(150, CANVAS_HEIGHT - 150, 20, 100, COLOR2));
        this.game.addSprite(new Platform(150, CANVAS_HEIGHT - 250, 20, 100, COLOR3));
        this.game.addSprite(new Platform(150, CANVAS_HEIGHT - 350, 20, 100, COLOR1));

        this.game.addSprite(new Platform(1000, 200, 100, 25, COLOR2));

        // Add walls
        this.game.addSprite(new Wall(720, -100, 20, 300, COLOR0));
    }
}

// Add camera
let camera = new Camera();
camera.setLevelBoundaries(500, 600);

// Start game
const game = new Game(camera);
game.addLevel(new Level1(game));
game.addLevel(new Level2(game));
game.animate();
