const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");

const { typeDefs, resolvers } = require("./graphql");
const Game = require("./models/Game");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tic-tac", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => server.listen({ port: PORT }))
  .then((res) => {
    console.log(res.url);
    return Game.find({});
  })
  .then((game) => {
    // console.log(game);
    // game.players = [];
    // game.save();
    console.log(game);
  })
  .catch((err) => console.error(err));

//notes:

//MVP:

//Forget about rooms for now?
//add later: ability to create room or join room (spectate?)
//limit array to 2 people through mongoose?

//TODOs:
//add resign feature? or just new game in general?
//more than one game?
//jwt
//errors!!!

//thinking about games/rooms/
//cleaning up old ones? automatically delete after a game ends?
//or after a certain amount of time? or manually?
//keep track using timestamps perhaps?
//model after jackbox -- have a vip who can start/restart?
//still use 4-digit alphanumeric code?

// more notes 12/08/2020

// shouldn't be returning strings as a habit
// return types defined in typedefs
// resolve issue of sometimes using body, sometimes token for name/id
// check if all games are being affected by all pubsub updates
// if so, change code to avoid that (more than just GAME_CHANGE)?
