//import necessary tools
import { Chess } from './node_modules/chess.js/dist/chess.js'
import {objToFen} from 'https://unpkg.com/chessboard-element/bundled/chessboard-element.bundled.js';
import {DEFAULT_POSITION} from './node_modules/chess.js/dist/chess.js'
//main
function endlesschess() {
//Assign piece values
const PIECE_VALUES = {
  ['p']: 1,
  ['n']: 3,
  ['b']: 3,
  ['r']: 5,
  ['q']: 9,
  ['k']: 0
}
//assign promotion options
const board = document.querySelector('chess-board');
const game = new Chess();
const start_positions = game.fen().split(" ")[0];
const scoreElement = document.querySelector('#score')
const statusElement = document.querySelector('#status');
const fenElement = document.querySelector('#fen');
const pgnElement = document.querySelector('#pgn');
const gamebox = document.getElementById('endbox'); //submission form
const overlay = document.getElementById('overlay')

function showform() {
  overlay.style.display = 'block';
  gamebox.style.display = 'block';
} //submission form end

var turncounter = 0;
var score = 0;
var taken = 0;
var checkmates = 0;
var moveaudio = new Audio('./audio/move-self.mp3')
var takeaudio = new Audio('./audio/capture.mp3')

//load in stockfish engine
const stockfish = new Worker('./node_modules/stockfish.js/stockfish.js');
stockfish.postMessage('uci');
stockfish.onmessage = (event) => {
  if (event.data === 'uciok') {
    stockfish.postMessage('setoption name Skill Level value 0');
    stockfish.postMessage('ucinewgame');
    stockfish.postMessage(`setoption name PlayerColor value black`);
    game.reset();
  }
};

    board.addEventListener('drag-start', (e) => {
const {source, piece, position, orientation} = e.detail;

// do not pick up pieces if the game is over
if (game.isGameOver()) {
e.preventDefault();
return;
}

// only pick up pieces for the side to move
if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
e.preventDefault();
return;
}
});

board.addEventListener('drop', (e) => {
const {source, target, setAction} = e.detail;


// see if the move is legal
const move = game.move({
from: source,
to: target,
promotion: 'q'
});


// illegal move
if (move === null) {
setAction('snapback');
// check for promotion
} else {

  //count player turn
  turncounter ++;

  //update difficulty
  if (checkmates <= 20){
    stockfish.postMessage(`setoption name Skill Level value ${checkmates}`);//${nextdifficulty}
  }

  //check for capture
    if (move.captured && move.color === 'w') { //only add to score if capturing AI piece
      takeaudio.play();
      taken ++;
      score += PIECE_VALUES[move.captured];
    };

  //check for checkmate by player
    if (game.isStockCheckmate() || game.isDraw()){
      updateStatus();
      return;
    }
    else {
      moveaudio.play();

  //increase difficulty according to player wins, stop at max
    updateStatus()

    // send the move to Stockfish
    stockfish.postMessage(`setoption name PlayerColor value black`);
    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage(`go movetime 1000`); // set the engine to think for a second
    // get the engine's response
    stockfish.onmessage = (event) => {
      const match = event.data.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
      if (match) {
        const engineMove = game.move({from: match[1], to: match[2], promotion: match[3]});
        if (engineMove === null) {
          console.error(`Stockfish made an illegal move: ${match[0]}`);
        } else {
          board.setPosition(game.fen());
          if (engineMove.captured) {
            takeaudio.play();
          }
          else {
            moveaudio.play();
          }
          updateStatus();
          }
        }
      }
    }
  }
})
updateStatus()
;



// update the board position after the piece snap
// for castling, en passant, pawn promotion
board.addEventListener('snap-end', (e) => {
board.setPosition(game.fen());
});

function updateStatus () {
let status = '';
let moveColor = 'White';
if (game.turn() === 'b') {
moveColor = 'Black';
}

//if player checkmates
if (game.inCheck() && game.isStockCheckmate()){
  status = `Checkmate!`;
    checkmates ++;
    game.reset();
  } else if (game.inCheck() && game.isPlayerCheckmate()) { //if player is in checkmate
    status = `${moveColor} is in checkmate!`;
    setTimeout(showform, 1500); //show form

  } else if (game.isDraw()) {
// draw?
status = 'Drawn position';
  game.reset(); // Reset the game

} else if (game.inCheck()) {
// game still on
status = `${moveColor} is in check`;
} else {
  status = `${moveColor} to move`;
}

statusElement.innerHTML = 'Status: ' + status;
document.getElementById('turncounter').innerHTML = 'Moves made: ' + turncounter;
document.getElementById('moves-display').innerHTML = turncounter;
document.getElementById('score').innerHTML = 'Score: ' + score;
document.getElementById('score-display').innerHTML = score;
document.getElementById('taken').innerHTML = 'Pieces taken: ' + taken;
document.getElementById('pieces-display').innerHTML = taken;
document.getElementById('checkmates').innerHTML = 'Checkmates: ' + checkmates;
document.getElementById('checkmate-display').innerHTML = checkmates;
if (checkmates <= 20) { //difficulty specific
document.getElementById('difficulty').innerHTML = `Current Difficulty: ${checkmates}/20`;
document.getElementById('diff-display').innerHTML = checkmates;
} else {
  document.getElementById('difficulty').innerHTML = 'Current Difficulty: 20';
  document.getElementById('diff-display').innerHTML = 20;
} //
}
updateStatus();

const reset = document.getElementById("reset");
reset.addEventListener("click", () => {
  game.reset();
  board.setPosition(game.fen())
  turncounter = 0;
  score = 0;
  taken = 0;
  checkmates = 0;
  updateStatus();
});

function getchoice(source) { //Chess.js library has en passant bug, will be implemented if it is ever fixed - gets promo choice
  const piece = game.get(source).type;
  console.log(piece)
  if (piece.type === 'p') {
  const promo = document.getElementById("promo");
  promo.style.display = 'block';
  const qbutt = document.getElementById("queen");
  const rbutt = document.getElementById("rook");
  const nbutt = document.getElementById("knight");
  const bbutt = document.getElementById("bishop");
  var choice;
  qbutt.addEventListener('click', function(event) {
    choice = 'q'
    promo.style.display = 'none';
    return choice;
  });
  rbutt.addEventListener('click', function(event) {
    choice = 'r'
    promo.style.display = 'none';
    return choice;
  });
  nbutt.addEventListener('click', function(event) {
    choice = 'n'
    promo.style.display = 'none';
    return choice;
  });
  bbutt.addEventListener('click', function(event) {
    choice = 'b'
    promo.style.display = 'none';
    return choice;
  })
  }
}
}

function helpers() {

  ////exit submission form
  const gamebox = document.getElementById('endbox');
      const overlay = document.getElementById('overlay')
      var exitbtn = document.getElementById('exitbtn');
      exitbtn.addEventListener("click", () => {
        overlay.style.display = 'none';
        gamebox.style.display = 'none';
      })

      //deal with card issues for window resize
      window.addEventListener('resize', function(event) {
  var rules = $('#rules');
  var ruledetails = document.getElementById('ruledetails');
  if (window.innerWidth < 1280) {
    ruledetails.style.fontSize = "12px";
    ruledetails.style.minWidth = "240px";
  } else {
    ruledetails.style.fontSize = "18px";
    ruledetails.style.minWidth = "380px";
  }
  if (window.innerWidth < 1050) {
    rules.collapse('hide');
  }
});

};

export { endlesschess };
export { helpers };