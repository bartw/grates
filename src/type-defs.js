const { gql } = require("apollo-server");

const typeDefs = gql`
  type Joke {
    text: String!
  }

  type Query {
    joke: Joke!
  }
`;

module.exports = typeDefs;
