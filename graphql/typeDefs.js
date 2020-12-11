const { gql } = require("apollo-server");

module.exports = gql`
  type Player {
    name: String
  }

  type Game {
    id: ID!
    player1: Player
    player2: Player
    turn: String
    board: String!
    winner: String
    code: String!
  }

  type Query {
    game: Game
  }

  type Mutation {
    joinGame(name: String!, code: String!): String!
    clearPlayers: String!
    makeMove(name: String!, x: Int!, y: Int!): String!
    newGame(name: String!): String!
    rematch: String!
  }

  type Subscription {
    renameGame(id: ID!): Game
  }
`;

// `type Player {
//   id: ID!
//   name: String!
//   turn: Boolean!
// }

// type Game {
//   id: ID!
//   players: [Player]
// }`

//have subscription take in room/game id as a variable/parameter so it
//knows which room to watch

//returning strings mostly because I don't know how to deal with error/
// /return errors and correct responses both
