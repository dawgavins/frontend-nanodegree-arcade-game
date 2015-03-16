var MIN_ENEMY_SPEED = 101 / 1.25; // 1.25 seconds per tile
var MAX_ENEMY_SPEED = 101 / 0.3; // .3 seconds per tile 
var ENEMY_WIDTH = 101;
var PLAYER_WIDTH = 60;
var PLAYER_SIDE_SPACE = 25;

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // x and y are the coordinates of the enemy on the canvas
    this.x = 0;
    this.y = 0;

    // row is an integer index representing which row of tiles the enemy is moving on.
    // the enemy's y value can be calculated directly from the row its on
    this.row = 0;

    // speed is the number of tiles the enemy will move per second
    this.speed = 0;

    // randomize the enemies position and start him moving across the screen
    this.reset();
}

Enemy.prototype.reset = function()
{
    // Choose a row for the enemy to be started on. 
    // First we will check if there are any enemies in the player's current row.  If not
    // this enemy will go down this row.  Otherwise we will choose a random row, taking care 
    // not to put more than two enemies in a row at the same time.

    var newRow = -1; // the row the enemy will be placed in
    var playerRowCount = 0; // used to keep track of # of enemies in the player's current row
    var playerRow = player.row; // the player's current row

    // check if there are any enemies currently in the player's row
    for ( i in allEnemies )
    {
        if ( allEnemies[i].row === playerRow )
        {
            // there is already an enemy in the player's row
            playerRowCount++;
        }
    }    
    // if there aren't any enemies in the player's row, put this one there for sure!
    //  keep that player moving!
    if ( playerRowCount == 0 )
    {
        newRow = playerRow;
    }
    else
    {
        // Otherwise, pick a random row.  However, if there are already 2 enemies
        // on that row, then don't put this enemy into the same one.
        // Note - there is no chance of an infinite while loop here because there are only 4 
        // enemies - not enough to have 2 per row.  These numbers should really be put into
        // tweaker variables rather than hard-coded, but the project is simple enough 
        // to do this directly

        var rowCount = 5; // the number of enemies in the currently selected row

        // repeat until we have a row with less than two other enemies
        while ( rowCount >= 2)
        {
            rowCount = 0;
            // select a random row other than the water row, and then check how many enemies are on it
            newRow = Math.floor(Math.random()*4) + 1;
            for ( i in allEnemies )
            {
                // don't count ourselves as belonging to any row just now
                if ( allEnemies[i] !== this )
                {
                    // add 1 to the rowCount if we find an enemy in the proposed row
                    if ( allEnemies[i].row === newRow )
                    {
                        rowCount++;
                    }
                }
            }        
        }   
    }
    // assign the result of the row search and the initial position of the enemy based on that
    this.row = newRow;
    this.x = -101; // this will put the enemy just off to the left of the screen
    this.y = this.row * 83 - 25;
    // randomly generate a speed in tiles/second, between the constants min/max enemy speed
    this.speed = Math.random() * (MAX_ENEMY_SPEED - MIN_ENEMY_SPEED) + MIN_ENEMY_SPEED;
}

// return true if this enemy has collided with the player, and false otherwise
Enemy.prototype.isCollidingWithPlayer = function() {
    // to collide the enemy must be in the same row, and overlap the player's horizontal position
    // Note:  I added some non-colliding space on either side of the player (PLAYER_SIDE_SPACE)
    // because he doesn't occupy a full tile width.
    if ( this.row === player.row && this.x + ENEMY_WIDTH > (player.x + PLAYER_SIDE_SPACE) && this.x < ( player.x + 101 - PLAYER_SIDE_SPACE ) ) {
        return true;
    }
    return false;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;

    // if the enemy is colliding with the player, set the lostGame flag
    if ( this.isCollidingWithPlayer() ) {
        player.lostGame = true;
    }

    // if the enemy is off the screen to the right, reset it 
    // so that it will begin on the left again
    if ( this.x > 101 * 5 ) {
        this.reset();
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


// Player class

// Enemies our player must avoid
var Player = function() {
 
    // The image/sprite for our player, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/char-boy.png';

    // row is an integer indicating which tile layer the player is occupying
    this.row = 5; 

    // x, y represent the position of the player on the canvas
    this.x = this.column * 101;
    this.y = this.row * 83 - 25;

    // wonGame and lostGame are flags used to indicate when the game has been
    // won or lost
    this.wonGame = false;
    this.lostGame = false;

    this.reset();
}

Player.prototype.reset = function()
{
    // reset the player position to the starting tile
    this.column = 2;
    this.row = 5;
    this.x = this.column * 101;
    this.y = this.row * 83 - 25;
    // set the end-game flags to false
    this.wonGame = false;
    this.lostGame = false;
}

// Update the player's position, required method for game
// Parameter: dt, a time deltahighScore between ticks
Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// read the user input so that we can make the player react accordingly
Player.prototype.handleInput = function(keyPressed) {
    // read the keyPressed and increment or decrement the player's row/column members
    // while making sure they stay within the boundaries of the game

    if ( keyPressed === "left" ) {
        if ( this.column > 1  )
        {
           this.column -= 1;
           currentScore += 1;
        }
    }
    else if ( keyPressed === "right" ) {
        if ( this.column < 4 )
        {
           this.column += 1;
           currentScore += 1;
        }
    }
    else if ( keyPressed === "up" ) {
        this.row -= 1;
        currentScore += 1;
        // if the player has reached row 0, they have won the game!
        if ( this.row < 1 ) {
            this.wonGame = 1;
            currentScore += 50;
        }
    }
    else if ( keyPressed === "down" ) {
        if ( this.row < 5 ) {
            this.row += 1;
            currentScore += 1;
        }
    }

    // convert the row/column values to canvas x/y coordinates
    this.x = this.column * 101;
    this.y = this.row * 83 - 25;
}

// Now instantiate your objects.

// the number of enemies active at a time
var NUM_ENEMIES = 4;

// create the player
var player = new Player();

// create an array of NUM_ENEMIES enemies
var allEnemies = [];
for ( var i = 0; i < NUM_ENEMIES; ++i ) 
{
    allEnemies[i] = new Enemy();
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // only send this keyPressed if the game is in a running state
    // i.e. don't move the player if we are in the results screen
    if ( gameState === "running" )
    {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
