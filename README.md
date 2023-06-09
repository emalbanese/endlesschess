# Endless Chess
#### Video Demo:  <https://youtu.be/D_1EChT23Hs>
#### Description:
The following is a write up that was submitted as part of the final project for HarvardX's CS50 course.

Endless Chess is a challenge variation of the well-known game Chess, in which the player faces off against an increasingly difficult AI, attempting to beat records for turns survived, pieces taken, and checkmates made. It is designed as a web app, with the mechanics functioning entirely via javascript.

Files written: index.html, about.html main.js, and custom.css.

index.html is the main page of the website. It hosts the actual endless chess game, along with the game statistics, rules, a reset button, and a directory to the about page as well as a link to my github. It is where the chessboard, courtesy of chessboard-element, is defined and displayed. It has responsive design in mind for different sizes of browser windows, however, I chose not to create it with mobile in mind. This is because this is a challenge I created targeted at higher level players, who generally are chess streamers and/or pros, that wouldn't be playing a challenge variation on their phones. In theory I'd like it to be a web app first, and if it were to hypothetically become popular, I would develop a standalone app similar to the direction chess.com took.

about.html is simply a page that hosts some information about the project, the AI, some limitations of the project, and gives credit to the libraries that were used to make this project possible, which I will talk about more in-depth further on.

There was a plan to implement a leaderboard using SQL and python, but I had this idea after I had already built most of the existing website. Unfortunately, because the site was built with being accessed as an http-server on github in mind, I would have had to rewrite a lot of the existing code to get it to function as a flask app. I consider this a valuable lesson in planning out structure, language, and coding environment ahead of time.

custom.css contains all the custom css to make the page aesthetic - it includes my game over splash screen, the navbar/header, the statistics, and the about page boxes and headers.

main.js contains the actual functional endless-chess program itself as well as a short helper function.
main.js is made possible by chess.js, which provides actual chess rules and functionality in a javascript environment, stockfish.js, which contains the stockfish chess engine, and chessboard-element, which provides a functional chessboard with notation that chess.js can read.
main.js starts by initializing the statistics and some features specific to my webpage, creates a new chess game object, and initializes the stockfish engine. From there, the script first listens for the "drag-start" event, i.e. a piece being clicked on and/or picked up. Upon this event, the script checks first if the game is over, then if the piece is the player's piece and their turn. If the game is not over and it is the player's turn, they will be able to successfully pick up the piece. From there, the script listens for the drop event.
Upon the player releasing the piece, the script first checks if the move is legal, snapping the piece back to its starting point if not.
If legal, the script will update things like the difficulty, check for capture, check for checkmate or draw, and play the movement audio. From there, the move is sent to the stockfish engine, where it will consider the move and then make its own. There is an update status function that recurs constantly throughout the script, and this is to make sure all the statistics as well as the game state updates immediately after any action is taken. The script also the update status function, as well as providing functionality for the reset button. There is also a helper function, which provides some responsive design for the rule card in index.html and functionality for the exit button on the game over modal.

There is unused code for a function called getchoice(), which in theory should work, but after extensive testing it seems that there is a bug with a check in the chess.js source code that causes conflict. This function would have been used to provide players a choice when a pawn was to be promoted, but unfortunately lack of providing promotion options has been an open issue on chess.js's github since shortly after its release. There doesn't seem to be any fix due to the conflict with the en passant check in chess.js, which is arguably more important than promotion options. While a choice would be nice to provide, underpromotions are rare and 99% of the time people will promote to queen.

There was a lot of troubleshooting along the way - while many of these js libraries claim to be compatible with one another, it takes quite a bit of work to get them to work in tandem and not override each other. There are actually a few chessboard javascript libraries, but I landed on chessboard-element because they seemed to have the most recently updated documentation on compatibility to chess.js. Getting the stockfish.js AI to actually read the board and moves provided to it was quite a rabbithole as well.

In the end I had to sacrifice more functionality than I would have liked to make these libraries work together (and with my script). Things like promotion, being able to choose your starting color, and certain rules and elements that I planned to be in the game had to be scrapped entirely due to limitations on how these libraries could communicate with one another.
