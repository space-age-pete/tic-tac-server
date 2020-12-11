const { Schema, model } = require("mongoose");

const board = JSON.stringify([
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
]);

const GameSchema = new Schema({
  player1: {
    name: {
      type: String,
      // unique: true,
      // required: true,
    },
    // turn: Boolean,
  },
  player2: {
    name: {
      type: String,
      // unique: true,
      // required: true,
    },
    // turn: Boolean,
  },
  turn: {
    type: String,
    // default: "player1",
  },
  board: {
    type: String,
    default: board,
  },
  winner: String,
  markCount: {
    type: Number,
    default: 0,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

GameSchema.methods.checkForWin = function (x, y) {
  let board = JSON.parse(this.board);

  console.log("second this", this);

  let valid = [0, 1, 2];
  if (!valid.includes(x) || !valid.includes(y)) return "oh";

  if (
    (board[x][0] === board[x][1] && board[x][1] === board[x][2]) ||
    (board[0][y] === board[1][y] && board[1][y] === board[2][y])
  ) {
    return board[x][y];
  }
  if (
    (x + y) % 2 === 0 &&
    ((board[0][0] === board[1][1] && board[1][1] === board[2][2]) ||
      (board[0][2] === board[1][1] && board[1][1] === board[2][0]))
  ) {
    return board[x][y];
  }
  return "keep goin";

  //this.gameOver = true ?
  //this.status = "over?", "player1 win?"
  //this.winner = "player1"? player1.name?
};

GameSchema.methods.addMark = function (x, y) {
  let board = JSON.parse(this.board);
  if (board[x][y]) return "already a mark there";
  board[x][y] = this.turn;
  this.board = JSON.stringify(board);
  this.turn = this.turn === "player1" ? "player2" : "player1";
  return this.checkForWin(x, y);
};

module.exports = model("Game", GameSchema);

//INSTEAD of having an array of 2 players, maybe have 2 separate objects?
//I'll try it out but array may be better for scatman

// players: [
//   {
//     id: Number,
//     name: {
//       type: String,
//       unique: true,
//       //not really working, more validation needed
//       required: true,
//     },
//     turn: Boolean,
//   },
// ],
