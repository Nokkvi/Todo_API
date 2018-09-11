const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const AuthPayload = require('./resolvers/AuthPayload')

const options = {
  port: 8000
}

const resolvers = {
  Query,
  Mutation,
  AuthPayload
}

// 3
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: process.env.PRISMA_DB_HOST,
      secret: process.env.PRISMA_DB_SECRET,
      debug: true,
    }),
  }),
})

server.start(options, ({ port }) => 
  console.log(
    `Server is running on http://localhost:${port}`,
  ),
)