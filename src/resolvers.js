const axios = require("axios");

const url = "https://icanhazdadjoke.com/";
const headers = { Accept: "application/json" };

const resolvers = {
  Query: {
    joke: () =>
      axios({ method: "GET", url, headers }).then(({ data: { joke } }) => ({
        text: joke,
      })),
  },
};

module.exports = resolvers;
