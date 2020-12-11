const jwt = require("jsonwebtoken");

const { Game } = require("../models");
const checkAuth = require("../utils/check-auth");
const generateCode = require("../utils/generate-code");

const GAME_CHANGE = "GAME_CHANGE";

function generateToken(name, id) {
  return jwt.sign(
    {
      name,
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

module.exports = {
  Query: {
    game: async () => await Game.findOne({}),
  },
  Mutation: {
    joinGame: async (_, { name, code }, { pubsub }) => {
      const dbGame = await Game.findOne({ code });
      console.log(dbGame);
      if (!dbGame) throw new Error("Invalid Code");

      if (!name.trim().length) throw new Error("that's not a name");
      if (!dbGame.player1.name) dbGame.player1 = { name };
      else if (dbGame.player1.name === name)
        throw new Error("choose a different name");
      else if (!dbGame.player2.name) {
        dbGame.player2 = { name };
        dbGame.turn = "player" + Math.floor(Math.random() * 2 + 1);
      } else throw new Error("game full");

      dbGame.save();

      const token = generateToken(name, dbGame._id);

      pubsub.publish(GAME_CHANGE, { renameGame: dbGame });
      // return `You've joined the Game, ${name}!`;

      return token;
    },
    newGame: async (_, { name }, { pubsub }) => {
      const code = generateCode();
      console.log(code);

      if (!name.trim().length) throw new Error("that's not a name");

      try {
        const dbGame = await Game.create({
          code,
          player1: { name },
        });
        // dbGame.player1 = { name };
        // dbGame.save();

        console.log(dbGame);
        const token = generateToken(name, dbGame._id);

        pubsub.publish(GAME_CHANGE, { renameGame: dbGame });

        return token;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    clearPlayers: async (_, __, { req, pubsub }) => {
      // const dbGame = await Game.findOne({});
      // dbGame.player1 = {};
      // dbGame.player2 = {};
      // dbGame.turn = "";
      //for Now:
      const player = await checkAuth(req);
      console.log("player", player);

      await Game.findByIdAndDelete(player.id);

      //technically needs to check but like come on
      // const code = generateCode();
      // const dbGame = Game.create({ code });

      // // dbGame.save();
      pubsub.publish(GAME_CHANGE, { renameGame: null });
      return `NO MORE PLAYERS`;
    },
    rematch: async (_, __, { req, pubsub }) => {
      const player = await checkAuth(req);
      const dbGame = await Game.findById(player.id);

      if (!dbGame) throw new Error("Game Not Found");
      if (!dbGame.turn) throw new Error("The Game has not yet begun");

      dbGame.board = JSON.stringify([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]);
      dbGame.winner = "";
      dbGame.markCount = 0;
      dbGame.turn = "player" + Math.floor(Math.random() * 2 + 1);
      dbGame.save();

      pubsub.publish(GAME_CHANGE, { renameGame: dbGame });
      return "The Rematch has begun";
    },
    makeMove: async (_, { name, x, y }, { req, pubsub }) => {
      const player = await checkAuth(req);
      console.log("player", player);

      const dbGame = await Game.findById(player.id);

      if (!dbGame) throw new Error("Game Not Found");
      if (!dbGame.turn) throw new Error("The Game has not yet begun");
      if (dbGame.winner) throw new Error("The Game has ended");
      if (dbGame[dbGame.turn].name !== name)
        throw new Error("It is not your turn!");
      // if (dbGame.winner) return "The Game has ended";

      let board = JSON.parse(dbGame.board);
      if (board[x][y]) throw new Error("already a mark there");

      board[x][y] = dbGame.turn === "player1" ? "X" : "O";
      dbGame.markCount++;

      //let winner = "";
      let valid = [0, 1, 2];
      if (!valid.includes(x) || !valid.includes(y))
        throw new Error("Not a valid move");
      if (
        (board[x][0] === board[x][1] && board[x][1] === board[x][2]) ||
        (board[0][y] === board[1][y] && board[1][y] === board[2][y]) ||
        ((x + y) % 2 === 0 &&
          board[1][1] &&
          ((board[0][0] === board[1][1] && board[1][1] === board[2][2]) ||
            (board[0][2] === board[1][1] && board[1][1] === board[2][0])))
      ) {
        dbGame.winner = dbGame[dbGame.turn].name;
        // dbGame.gameOver = true;
        //admit
      } else if (dbGame.markCount === 9) {
        dbGame.winner = "It's a Cat's Game!";
      }

      dbGame.board = JSON.stringify(board);
      dbGame.turn = dbGame.turn === "player1" ? "player2" : "player1";

      dbGame.save();
      pubsub.publish(GAME_CHANGE, { renameGame: dbGame });

      if (dbGame.winner) return `${name} won the game!`;
      return `${name} made a move!`;
    },
  },
  Subscription: {
    renameGame: {
      subscribe: async (_, { id }, { pubsub }) => {
        //THIS IS THE ONLY ID NOT COMING FROM TOKEN
        //STAY CONSISTENT

        const dbGame = await Game.findById(id);
        //set error?
        setTimeout(
          () => pubsub.publish(GAME_CHANGE, { renameGame: dbGame }),
          0
        );
        return pubsub.asyncIterator(GAME_CHANGE);
      },
    },
  },
};

// joinGame: async (_, { name }, { pubsub }) => {
//   const dbGame = await Game.findOne({});

//   const id = dbGame.players.length + 1;
//   const turn = id === 1 ? true : false;

//   if (id === 3) return "game full";
//   if (dbGame.players.find((p) => p.name === name))
//     return "someone else has that name";

//   //why am i using names for tic-tac-toe?
//   dbGame.players.push({ name, id, turn });

//   dbGame.save();

//   pubsub.publish(GAME_CHANGE, { renameGame: dbGame });
//   return `You've joined the Game, ${name}!`;
// },

// clearPlayers: async (_, __, { pubsub }) => {
//   const dbGame = await Game.findOne({});
//   dbGame.players = [];
//   dbGame.save();
//   pubsub.publish(GAME_CHANGE, { renameGame: dbGame });
//   return `NO MORE PLAYERS`;
// },
