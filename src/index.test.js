const { rest } = require("msw");
const { setupServer } = require("msw/node");
const { gql } = require("apollo-server");
const { createTestClient } = require("apollo-server-testing");
const server = require("./server");

const mockServer = setupServer(
  rest.get("https://icanhazdadjoke.com/", (req, res, ctx) =>
    res(ctx.json({ joke: "hello there" }))
  )
);

beforeAll(() => mockServer.listen());

afterEach(() => mockServer.resetHandlers());

afterAll(() => mockServer.close());

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
