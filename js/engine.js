/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */


/* This is a helper class that facilitates drawing elements to a canvas once
   and then rendering the canvas onto the main canvas.  I added this because I 
   found that rendering text with fillText every frame really slowed down the game */
function CanvasImage(width, height)
{
    // create a new canvas element of requested dimensions
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    // store the context for ease of access
    this.ctx = this.canvas.getContext('2d');
    // flag the canvas to be redrawn the first time
    this.forceDraw = true;
}
/* function for forcing the results to be redrawn.  Likely called when 
   there is a new high score */
CanvasImage.prototype.setForceDraw = function() { 
    // set the forceDraw flag to true
    this.forceDraw = true; 
}
/* return true if the canvas should be redrawn before rendering, 
   false if its already up to date */
CanvasImage.prototype.shouldDrawToCanvas = function() {
    return this.forceDraw;
}
/* draw the contents of the canvas to the input parameter "context" at position
   x,y.  Check if the canvas should be redrawn first */
CanvasImage.prototype.draw = function(context, x, y) {
    // this is a 
    if ( this.shouldDrawToCanvas() )
    {
        this.drawToCanvas();
        this.forceDraw = false;

    }
    context.drawImage(this.canvas, x, y);
}
/* this function will be overridden by subclasses to actually draw
   to the canvas */
CanvasImage.prototype.drawToCanvas = function() {}


/* Subclass of CanvasImage that draws the background for the scoreboard
   This class only needs to redrawn the first time because it stays the same
   at all times */
function ScoreboardBG(width, height) {
    CanvasImage.call(this, width, height);
}
ScoreboardBG.prototype = Object.create(CanvasImage.prototype);
ScoreboardBG.prototype.constructor = ScoreboardBG;
/* draw a rectangle with a stroke as the background for the scoreboard,
   and render the static text as well */
ScoreboardBG.prototype.drawToCanvas = function() {
    // draw the rectangle with stroke border
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height );
    this.ctx.fillStyle = '#ddd'; // gray fill color
    this.ctx.fill();
    this.ctx.lineWidth = 7;
    this.ctx.strokeStyle = '#44a'; // blue border
    this.ctx.stroke();

    // draw the static text for the score and the high score which
    // does not change during the current game
    var highScoreText = "High:  " + highScore;
    this.ctx.font = "30pt Impact";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "#44a"; // blue text
    this.ctx.fillText( highScoreText, 20, 42 );    
    this.ctx.fillText( "Score:", this.canvas.width - 220, 42 );    
}

/* Subclass of CanvasImage that draws the foreground for the scoreboard
   This class needs to be redrawn every time the score changes. */
function ScoreboardFG(width, height) {
    CanvasImage.call(this, width, height);
    this.drawnScore = 0;
}
ScoreboardFG.prototype = Object.create(CanvasImage.prototype);
ScoreboardFG.prototype.constructor = ScoreboardFG;
// overridden function to check for a redraw if the score has changed
// or if its the first time through.
ScoreboardFG.prototype.shouldDrawToCanvas = function() {
    return this.forceDraw || this.drawnScore != currentScore;
}
// draw the text of the current score to the canvas
ScoreboardFG.prototype.drawToCanvas = function() {
    // clear the canvas first
    this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    this.ctx.font = "30pt Impact";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "#44a"; // blue text
    this.ctx.fillText( currentScore, 10, 37 );

    // store the latest score drawn
    this.drawnScore = currentScore;
}

/* Subclass of CanvasImage that draws the results screen.  I do this
   to avoid lots of fillText calls which slow the game down */
function ResultsScreen(width, height) {
    CanvasImage.call(this, width, height);
}
ResultsScreen.prototype = Object.create(CanvasImage.prototype);
ResultsScreen.prototype.constructor = ResultsScreen;
// Render the text for the results screen.
ResultsScreen.prototype.drawToCanvas = function() {
    // clear the canvas first
    this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    // Initialize main result text to the non-high score, getting-smushed case
    var resultText = "Smushed!";
    var promptText = "Press space bar to play again";

    // if the player got a high score, show congratulatory text
    if ( Number(currentScore) > Number(highScore) ) {
        resultText = "NEW HIGH SCORE:  " + currentScore;
        showHighScoreText = false;
    }
    // if they made it across, give them some props, even if it wasn't a record
    else if ( player.wonGame ) {
        resultText =  "You Made It!";
    }

    // show the result in large text in the center of the screen
    // white text with a black stroke
    this.ctx.font = "42pt Impact";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "white";
    this.ctx.fillText( resultText, this.canvas.width / 2, this.canvas.height / 2 );
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 3;
    this.ctx.strokeText( resultText, this.canvas.width / 2, this.canvas.height / 2 );        

    // prompt the user to press space again to restart
    // white text with a black stroke
    this.ctx.font = "24pt Impact";
    this.ctx.fillStyle = "white";
    this.ctx.fillText( promptText, this.canvas.width / 2, this.canvas.height / 2 + 82);
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    this.ctx.strokeText( promptText, this.canvas.width / 2, this.canvas.height / 2 + 82);        
}


var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        gameTimeElapsed;        

    // set the dimensions of the main canvas and add it to the DOM
    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    // Create the scoreboard BG and FG, and the results screen objects
    // Each of these has its own canvas that it draws to, which is then
    // drawn on the main canvas during the render stage.  This was done
    // for efficiency, as use of fillText was slowing down the game
    var scoreboardBG = new ScoreboardBG( canvas.width, 50 );
    var scoreboardFG = new ScoreboardFG( 80, 40 );
    var resultsScreen = new ResultsScreen( canvas.width, canvas.height );

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if ( gameState === "running" )
        {
            updateEntities(dt);
        }
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();

        if ( player.wonGame || player.lostGame )
        {
            resultsScreen.setForceDraw();
            global.gameState = "showResult";
        }

        gameTimeElapsed += dt;
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        // draw the static background for the scoreboard
        scoreboardBG.draw(ctx, 0, 0);
        // draw the dynamic content (foreground) for the scorebord 
        scoreboardFG.draw(ctx, 400, 5);
        // render the player and enemies
        renderEntities();

        // if the game is over, show the result screen
        if ( gameState === "showResult" )
        {
            // draw the results screen
            resultsScreen.draw(ctx, 0, 0);
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        // render the player as well
        player.render();
    }

    /* This function should be called when a new game is started.  It resets
       the state of all variables needed for the game.
     */
    function reset() {
        // reset the player (puts him at starting tile)
        player.reset();
        // reset the enemies - they will begin off screen to the left
        allEnemies.forEach(function(enemy) {
            enemy.reset();
        });
        // reset the game clock - I'm not really using this timer for now but good to have
        gameTimeElapsed = 0;
        // redraw the background of the scoreboard if the high score changed.  We try to 
        // draw this as seldom as possible to be more efficient. 
        if ( currentScore > highScore ) {
            highScore = currentScore;
            scoreboardBG.setForceDraw();
        }
        // reset the current score to zero
        currentScore = 0;

    }

    /* This function is an additional input handler only takes effect 
       when the gameState is "showResult" - when the current game is over.
       It listens for a space key to restart a new game.
     */
    function handleInput( keyPressed ) {
        // if the user pressed the space bar
        if ( keyPressed === "space" )
        {
            // if we're in the "showResult" game state
            if ( global.gameState === "showResult" )
            {
                // reset the game and transition back to the running state
                reset();
                global.gameState = "running";
            }
        }
    }
    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);


    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            32: 'space',
        };

        handleInput(allowedKeys[e.keyCode]);
    });


    
    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    // keep track of the current gameState.  "running" when game is active, 
    // "showResult" when the game is over and we are showing the results
    global.gameState = "running";

    // keep track of both the current and high scores
    global.currentScore = 0;
    global.highScore = 53;

})(this);
