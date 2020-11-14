# Grates

Grates, which is short for GRAphql TESting of course, is a minimal setup for testing an [Apollo](https://www.apollographql.com/docs/apollo-server/) [GraphQL](https://graphql.org/) server that gets data from external api's using [apollo-server-testing](https://www.apollographql.com/docs/apollo-server/testing/testing/), [Jest](https://jestjs.io/) and [msw](https://mswjs.io/).

## Prerequisites

- node
- some knowledge about GraphQL
- not enough knowledge about testing a GraphQL server

## Setup the Apollo GraphQL server

Get a terminal going and type in some stuff:

```
mkdir grates
cd grates
npm init --yes
npm install apollo-server graphql axios
mkdir src
touch src/index.js src/resolvers.js src/server.js src/type-defs.js
```

Add a start script to `package.json`:

```
"start": "node src/index.js"
```

Get a dad joke from the [icanhazdadjoke](https://icanhazdadjoke.com/api) api in `resolvers.js`:

```
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
```

Create a schema to expose the dad joke in `type-defs.js`:

```
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
```

Make an Apollo server using the schema and resolvers in `server.js`:

```
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./type-defs");
const resolvers = require("./resolvers");

const server = new ApolloServer({ typeDefs, resolvers });

module.exports = server;
```

Start the server from `index.js`:

```
const server = require('./server');

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

## Manually test the server

Terminal time:

```
npm start
```

Browse to http://localhost:4000. This should open a Playground where you can test your GraphQL server.

Query a joke on the left:

```
{
  joke {
    text
  }
}
```

Click the `play` button. On the right you should see something like this:

```
{
  "data": {
    "joke": {
      "text": "They're making a movie about clocks. It's about time"
    }
  }
}
```

## Automate the test

This is what it's all about.

Back to the terminal:

```
npm install -D apollo-server-testing jest msw
touch src/index.test.js
```

Add a test script to `package.json`:

```
"test": "jest --watchAll"
```

Immediatly run the test script from the terminal. It should become green when you're done:

```
npm test
```

`index.test.js`:

First import all the 3rd party stuff:

```
const { rest } = require("msw");
const { setupServer } = require("msw/node");
const { gql } = require("apollo-server");
const { createTestClient } = require("apollo-server-testing");
```

Import the `server` like in `index.js` to ensure you're as close to the production code as possible:

```
const server = require("./server");
```

Set up a mock server using msw to intercept the rest call to icanhazdadjoke and return your own response:

```
const mockServer = setupServer(
  rest.get("https://icanhazdadjoke.com/", (req, res, ctx) =>
    res(ctx.json({ joke: "hello there" }))
  )
);
```

Start the mock server before the tests run, reset it after each test and stop it when all tests are done:

```
beforeAll(() => mockServer.listen());

afterEach(() => mockServer.resetHandlers());

afterAll(() => mockServer.close());
```

Create an apollo test client that talks to the GraphQL server. Call that test client with the same query you used in the Playground. Assert that our mocked joke is returned:

```
test("i can haz joke query", async () => {
  const { query } = createTestClient(server);

  const { data } = await query({ query: gql`
  {
    joke {
      text
    }
  }
` });

  expect(data).toEqual({ joke: { text: "hello there" } });
});
```

If everything was copy pasted correctly, you should now have a green test.

If you also payed a little attention, you should have a better idea about how to test an Apollo GraphQL server.

## License

This repo is licensed under the [MIT License](LICENSE).
