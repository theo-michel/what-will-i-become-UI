// Create a new Phaser config object
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    backgroundColor: '#000000',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

// Create a new Phaser game instance
const game = new Phaser.Game(config);

let player;
let ground;
let obstacles;
let cursors;
let score = 0;
let scoreText;
let gameSpeed = 5;

function preload() {
    // Load assets
    this.load.image('player', '/assets/player.png');
    this.load.image('ground', 'https://examples.phaser.io/assets/sprites/platform.png');
    this.load.image('obstacle', 'https://examples.phaser.io/assets/sprites/diamond.png');
}

function create() {
    // Create ground
    ground = this.physics.add.staticGroup();
    ground.create(400, 390, 'ground').setScale(2).refreshBody();

    // Create player
    player = this.physics.add.sprite(100, 300, 'player');
    player.setCollideWorldBounds(true);

    // Create obstacles group
    obstacles = this.physics.add.group();

    // Set up collisions
    this.physics.add.collider(player, ground);
    this.physics.add.collider(obstacles, ground);
    this.physics.add.collider(player, obstacles, gameOver, null, this);

    // Set up cursor keys
    cursors = this.input.keyboard.createCursorKeys();

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // Start spawning obstacles
    this.time.addEvent({
        delay: 1500,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });
}

function update() {
    // Jump when up arrow is pressed
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
    }

    // Move obstacles
    obstacles.children.entries.forEach((obstacle) => {
        obstacle.x -= gameSpeed;
        if (obstacle.x < -obstacle.width) {
            obstacle.destroy();
            score += 10;
            scoreText.setText('Score: ' + score);
            gameSpeed += 0.1;
        }
    });
}

function spawnObstacle() {
    const obstacle = obstacles.create(800, 330, 'obstacle');
    obstacle.body.allowGravity = false;
    obstacle.setImmovable(true);
}

function gameOver() {
    this.physics.pause();
    player.setTint(0xff0000);
    this.add.text(400, 200, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
}