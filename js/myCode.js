let backgroundMusic = new Audio("assets/audio/background-music.opus")
backgroundMusic.play();

// Colors
const COLOR0 = "black"; // Wall color, cannot phase through black object

// Player colors
const COLOR1 = "red";
const COLOR2 = "green";
const COLOR3 = "blue";

class Background extends Sprite {
    constructor(imageSrc) {
        super();
        if (!imageSrc) return;
        this.image = new Image();
        this.image.src = "assets/images/" + imageSrc;
    }
    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            ctx.fillStyle = "lightblue";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
}

class WindEffect extends Sprite {
    constructor() {
        super();

        this.particles = [];

        // Create wind particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                length: 20 + Math.random() * 50,
                speed: 3 + Math.random() * 5
            });
        }
    }

    update() {
        for (let p of this.particles) {
            // Move from right to left
            p.x -= p.speed;

            // Reset particle when it leaves the screen
            if (p.x + p.length < 0) {
                p.x = CANVAS_WIDTH + Math.random() * 100;
                p.y = Math.random() * CANVAS_HEIGHT;
            }
        }
    }

    draw(ctx) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;

        for (let p of this.particles) {
            ctx.beginPath();

            // Draw horizontal wind lines
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.length, p.y);

            ctx.stroke();
        }
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
        this.image = new Image();
        this.image.src = "assets/images/platform-spritesheet.png";
    }

    draw(ctx) {
        // Small platforms look weird as a sprite, will fix later
        if (this.width > 50) {
            switch (this.color) {
                case COLOR1:
                    ctx.drawImage(this.image, 0, 92, 522, 110, this.x, this.y, this.width, this.height);
                    break;
                case COLOR2:
                    ctx.drawImage(this.image, 0, 511, 522, 110, this.x, this.y, this.width, this.height);
                    break;
                case COLOR3:
                    ctx.drawImage(this.image, 0, 296, 522, 110, this.x, this.y, this.width, this.height);
                    break;
                default:
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

        }
    }
}

class Wall extends Sprite {
    constructor(x, y, width, height, color,
        topSpikes = false, bottomSpikes = false, leftSpikes = false, rightSpikes = false,
    ) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.topSpikes = topSpikes;
        this.leftSpikes = leftSpikes;
        this.rightSpikes = rightSpikes;
        this.bottomSpikes = bottomSpikes;
    }


    draw(ctx) {
        // Draw wall
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        const spikeSize = 20;

        const drawSpikes = (side) => {
            const horizontal = side === "top" || side === "bottom";
            const length = horizontal ? this.width : this.height;

            const count = Math.max(1, Math.floor(length / spikeSize));
            const spacing = length / count;

            for (let i = 0; i < count; i++) {
                const start = i * spacing;
                const end = (i + 1) * spacing;
                const middle = (start + end) / 2;

                ctx.beginPath();

                if (side === "top") {
                    ctx.moveTo(this.x + start, this.y);
                    ctx.lineTo(this.x + middle, this.y - spikeSize);
                    ctx.lineTo(this.x + end, this.y);
                }
                else if (side === "bottom") {
                    ctx.moveTo(this.x + start, this.y + this.height);
                    ctx.lineTo(this.x + middle, this.y + this.height + spikeSize);
                    ctx.lineTo(this.x + end, this.y + this.height);
                }
                else if (side === "left") {
                    ctx.moveTo(this.x, this.y + start);
                    ctx.lineTo(this.x - spikeSize, this.y + middle);
                    ctx.lineTo(this.x, this.y + end);
                }
                else if (side === "right") {
                    ctx.moveTo(this.x + this.width, this.y + start);
                    ctx.lineTo(this.x + this.width + spikeSize, this.y + middle);
                    ctx.lineTo(this.x + this.width, this.y + end);
                }

                ctx.closePath();

                ctx.fillStyle = "#888";
                ctx.fill();

                ctx.strokeStyle = "#333";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Highlight the upper-facing edge
                ctx.beginPath();

                if (side === "top" || side === "bottom") {
                    ctx.moveTo(this.x + start + 2,
                        side === "top" ? this.y - 2 : this.y + this.height + 2);
                    ctx.lineTo(this.x + middle,
                        side === "top" ? this.y - spikeSize + 2 :
                            this.y + this.height + spikeSize - 2);
                } else {
                    ctx.moveTo(
                        side === "left" ? this.x - 2 : this.x + this.width + 2,
                        this.y + start + 2
                    );
                    ctx.lineTo(
                        side === "left" ? this.x - spikeSize + 2 :
                            this.x + this.width + spikeSize - 2,
                        this.y + middle
                    );
                }

                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        if (this.topSpikes) drawSpikes("top");
        if (this.bottomSpikes) drawSpikes("bottom");
        if (this.leftSpikes) drawSpikes("left");
        if (this.rightSpikes) drawSpikes("right");
    }
}


class Hero extends Sprite {
    constructor(x, y, width, height, dX, color, maxJumps = 1, windPush = 0) {
        super();

        this.startX = x;
        this.startY = y;

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
        this.maxJumps = maxJumps;
        this.canJump = true; // true if space is not being pressed

        // Change color information
        this.canChangeColor = true; // true if  c  is not being pressed

        // Wind effect to constantly push the player
        this.windPush = windPush;

        // Sound effects
        // Jump
        this.jumpAudio = new Audio("assets/audio/jump.wav");

        // Spritesheet
        this.spritesheet = new Image();
        this.spritesheet.src = "assets/images/hero-spritesheet.png";

        this.frameWidth = 2172 / 16;
        this.frameHeight = 682 / 3;

        this.currentFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 6;

        // Sprite animation rows
        this.colorRows = {
            [COLOR1]: 0,
            [COLOR2]: 2,
            [COLOR3]: 1,
        };

        this.facingRight = true;
    }

    update(sprites, keys) {
        // Used for collision with wall and platforms
        const previousX = this.x;
        const previousY = this.y;

        // Horizontal movement
        // Define notCrossedLeft and notCrossedRight to avoid recalculating twice
        let notCrossedLeft = this.x >= 0;
        let notCrossedRight = this.x <= CANVAS_WIDTH - this.width;

        if (notCrossedLeft && notCrossedRight)
            this.x += this.windPush;

        if ((keys['ArrowLeft'] || keys['a']) && notCrossedLeft) {
            this.x -= this.dX;
            this.facingRight = false;
        }
        if ((keys['ArrowRight'] || keys['d']) && notCrossedRight) {
            this.x += this.dX;
            this.facingRight = true;
        }

        if (keys[' '] && this.canJump && this.jumpCount < this.maxJumps) {
            this.dY = this.jumpForce;
            this.jumpCount++;
            this.canJump = false;

            // Play jump sound
            this.jumpAudio.play();
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
                    if (crossesLeft) {
                        this.x = sprite.x - this.width;
                        if (sprite.leftSpikes) {
                            this.die();
                            return;
                        }
                    }
                    else if (crossesRight) {
                        this.x = sprite.x + sprite.width;
                        if (sprite.rightSpikes) {
                            this.die();
                            return;
                        }
                    }
                }
                if (collisionX) {
                    if (crossesTop) {
                        this.y = sprite.y - this.height;
                        if (sprite.topSpikes) {
                            this.die();
                            return;
                        }
                    }
                    else if (crossesBottom) {
                        this.y = sprite.y + sprite.height;
                        if (sprite.bottomSpikes) {
                            this.die();
                            return;
                        }
                    }
                }
            }

            // Ball landed on a platform/ground
            if (landingPlatform !== null) {
                this.y = landingPlatform.y - this.height;
                this.dY = 0;
                this.jumpCount = 0;
            }
        }

        // Spritesheet animation
        // Sprite animation
        this.animationTimer++;

        if (this.jumpCount > 0) {
            // Jump animation (frames 10-13)
            this.currentFrame = 10 + Math.min(
                3,
                Math.floor(Math.abs(this.dY) / 4)
            );
        } else if (keys['ArrowLeft'] || keys['ArrowRight'] ||
            keys['a'] || keys['d']) {

            // Walking animation (frames 0-9)
            if (this.animationTimer >= this.animationSpeed) {
                this.currentFrame++;

                if (this.currentFrame > 9) {
                    this.currentFrame = 0;
                }

                this.animationTimer = 0;
            }
        } else {
            // Idle animation
            this.currentFrame = 0;
        }
    }

    draw(ctx) {
        if (!this.spritesheet.complete || this.spritesheet.naturalWidth === 0) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        // Spritesheet animation
        ctx.save();

        if (!this.facingRight) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }

        const row = this.colorRows[this.color] ?? 0;

        const sx = this.currentFrame * this.frameWidth;
        const sy = row * this.frameHeight;

        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(
            this.spritesheet,
            sx,
            sy,
            this.frameWidth,
            this.frameHeight,
            0,
            0,
            this.width,
            this.height
        );

        ctx.restore();
    }

    die() {
        this.x = this.startX;
        this.y = this.startY;
        this.dY = 0;
        this.color = COLOR1;
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

class Button extends Sprite {
    constructor(x, y, width, height, text, onClick) {
        super();
        this.width = width;
        this.height = height;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.text = text;
        this.onClick = onClick;
        this.isHovered = false;
    }

    update(sprites, keys, mouse) {
        this.isHovered = this.isMouseOver(mouse);

        if (mouse.clicked && this.isHovered) {
            this.onClick();
            mouse.clicked = false; // Prevent multiple triggers
        }
    }

    isMouseOver(mouse) {
        if (mouse == undefined) return false;
        return (
            mouse.x >= this.x &&
            mouse.x <= this.x + this.width &&
            mouse.y >= this.y &&
            mouse.y <= this.y + this.height
        );
    }

    draw(ctx) {
        ctx.fillStyle = this.isHovered ? "#666" : "#333"; // Lighter color when hovered
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}

class TutorialText extends Sprite {
    draw(ctx) {
        ctx.font = "50px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Move left:  a or left arrow key", CANVAS_WIDTH / 2, 150);
        ctx.fillText("Move right: d or right arrow key", CANVAS_WIDTH / 2, 250);
        ctx.fillText("Jump: space", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText("Change color: j or c", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    }
}

class JokeText extends Sprite {
    constructor() {
        super();
        this.time = 300;
    }
    update(sprites, keys) {
        if (--this.time === 0) return true; // Delete the sprite
    }

    draw(ctx) {
        ctx.font = "50px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("Final Level (for now). You have 5 jumps! Good luck :)", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
    }
}

class LevelMenu extends Level {
    initialize() {
        this.game.addSprite(new Background('menu-background.png'));

        this.game.addSprite(new Button(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100, 200, 50, "Start Game", () => {
            this.game.changeLevel(2);
        }));

        this.game.addSprite(new Button(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 200, 50, "Help", () => {
            this.game.changeLevel(1);
        }));
    }
}

class LevelHelp extends Level {
    initialize() {
        this.game.addSprite(new Background('menu-background.png'));

        // Add tutorial
        this.game.addSprite(new TutorialText());

        // Add Button to go back to level menu
        this.game.addSprite(new Button(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 300, 200, 50, "Back", () => {
            this.game.changeLevel(0);
        }));
    }
}

class Level1 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background('level-background.png'));

        // Add hero
        const hero = new Hero(50, CANVAS_HEIGHT - 100, 50, 50, 5, COLOR1);
        this.game.addSprite(hero);

        // Add color helper
        this.game.addSprite(new ColorHelper(hero));

        // Add platforms
        // Ground
        this.game.addSprite(new Platform(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25, COLOR0));

        this.game.addSprite(new Platform(200, CANVAS_HEIGHT - 150, 200, 30, COLOR1));
        this.game.addSprite(new Platform(500, CANVAS_HEIGHT - 250, 200, 30, COLOR1));

        this.game.addSprite(new Platform(200, CANVAS_HEIGHT - 350, 200, 30, COLOR2));
        this.game.addSprite(new Platform(500, CANVAS_HEIGHT - 450, 200, 30, COLOR2));

        this.game.addSprite(new Platform(200, CANVAS_HEIGHT - 550, 200, 30, COLOR3));
        this.game.addSprite(new Platform(500, CANVAS_HEIGHT - 650, 200, 30, COLOR3));

        this.game.addSprite(new Platform(900, CANVAS_HEIGHT - 700, 300, 30, COLOR1));

        // Add gift
        const gift = new Gift(CANVAS_WIDTH - 100, 20, 35, 40, this.game); // Change level when collecting gift
        this.game.addSprite(gift);
    }
}

class Level2 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background('level-background.png'));

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

class Level3 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background('level-background.png'));

        // Add hero
        const hero = new Hero(50, CANVAS_HEIGHT - 150, 50, 50, 5, COLOR1, 1);
        this.game.addSprite(hero);

        // Add color helper
        this.game.addSprite(new ColorHelper(hero));

        // Add platforms
        // Ground
        this.game.addSprite(new Wall(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25, COLOR0, true));

        this.game.addSprite(new Platform(50, CANVAS_HEIGHT - 80, 200, 30, COLOR1));
        // this.game.addSprite(new Wall(260, CANVAS_HEIGHT - 190, 30, 50, COLOR0, true, true, true, true));

        this.game.addSprite(new Platform(330, CANVAS_HEIGHT - 100, 200, 30, COLOR2));
        this.game.addSprite(new Platform(500, CANVAS_HEIGHT - 200, 50, 30, COLOR3));

        this.game.addSprite(new Platform(260, CANVAS_HEIGHT - 250, 50, 50, COLOR2));
        this.game.addSprite(new Platform(260, CANVAS_HEIGHT - 350, 50, 50, COLOR3));

        this.game.addSprite(new Platform(80, CANVAS_HEIGHT - 450, 150, 30, COLOR1));
        this.game.addSprite(new Platform(200, 250, 50, 30, COLOR2));
        this.game.addSprite(new Platform(300, 150, 30, 20, COLOR3));

        this.game.addSprite(new Wall(400, 80, 70, 30, COLOR0, true, true, true, true));
        this.game.addSprite(new Platform(470, 100, 70, 30, COLOR3));
        this.game.addSprite(new Wall(540, 80, 70, 30, COLOR0, true, true, true, true));

        this.game.addSprite(new Wall(CANVAS_WIDTH / 2, 50, 30, 730, COLOR0, true, true, true, true));

        // Add gift
        const gift = new Gift(800, CANVAS_HEIGHT - 100, 35, 40, this.game); // Change level when collecting gift
        this.game.addSprite(gift);
    }
}

class Level4 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background('level-background.png'));

        // Add wind animation
        this.game.addSprite(new WindEffect());

        // Add hero
        const hero = new Hero(300, CANVAS_HEIGHT - 150, 50, 50, 5, COLOR1, 1, -3);
        this.game.addSprite(hero);

        // Add color helper
        this.game.addSprite(new ColorHelper(hero));

        // Add platforms
        // Ground
        this.game.addSprite(new Platform(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25, COLOR0));

        this.game.addSprite(new Platform(500, CANVAS_HEIGHT - 150, 150, 25, COLOR1));
        this.game.addSprite(new Platform(700, CANVAS_HEIGHT - 270, 150, 25, COLOR2));
        this.game.addSprite(new Platform(900, CANVAS_HEIGHT - 390, 150, 25, COLOR3));
        this.game.addSprite(new Platform(1100, CANVAS_HEIGHT - 510, 100, 25, COLOR1));

        this.game.addSprite(new Platform(700, CANVAS_HEIGHT - 550, 100, 25, COLOR2));
        this.game.addSprite(new Platform(300, CANVAS_HEIGHT - 600, 100, 25, COLOR3));

        // Add gift
        const gift = new Gift(20, 50, 35, 40, this.game); // Change level when collecting gift
        this.game.addSprite(gift);
    }
}

class Level5 extends Level {
    initialize() {
        // Add background
        this.game.addSprite(new Background('level-background.png'));

        // Add hero
        const hero = new Hero(300, CANVAS_HEIGHT - 150, 50, 50, 5, COLOR1, 1);
        this.game.addSprite(hero);

        // Add color helper
        this.game.addSprite(new ColorHelper(hero));

        // Add platforms
        // Ground
        this.game.addSprite(new Platform(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25, COLOR0));

        // Add gift
        const gift = new Gift(CANVAS_WIDTH - 50, 50, 35, 40, this.game); // Change level when collecting gift
        this.game.addSprite(gift);
    }
}

// Add camera
let camera = new Camera();
camera.setLevelBoundaries(500, 600);

// Start game
const game = new Game(camera);
game.addLevel(new LevelMenu(game));
game.addLevel(new LevelHelp(game));
game.addLevel(new Level1(game));
game.addLevel(new Level2(game));
game.addLevel(new Level3(game));
game.addLevel(new Level4(game));
game.addLevel(new Level5(game));
game.animate();
