const { GraphQLServer } = require('graphql-yoga')

const options = {
  port: 8000
}

// 1
const typeDefs = `
type Query {
  info: String!
}
`

// 2
const resolvers = {
  Query: {
    info: () => `This is the API of a Todo list application`
  }
}

// 3
const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(options, ({ port }) => 
  console.log(
    `Server is running on http://localhost:${port}`,
  ),
)