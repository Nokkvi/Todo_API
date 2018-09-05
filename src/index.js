const { GraphQLServer } = require('graphql-yoga')

const options = {
  port: 8000
}

//TODO replace with real database
let users = [{
  id: "user-1",
  name: "Bob",
  todos: [{
    id: "todo-1",
    text: "Mop Ceiling"
  }]
}]

let userIdCount = users.length;

const resolvers = {
  Query: {
    info: () => `Welcome to the Todo list website`,

    users: () => users,
  },

  Mutation: {
    createUser: (root, args) => {
      const user = {
        id: `user-${++userIdCount}`,
        name: args.name,
        todos: []
      }

      users.push(user);
      return user;
    }
  },

  User: {
    id: (root) => root.id,
    name: (root) => root.name,
    todos: (root) => root.todos
  }
}

// 3
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
})
server.start(options, ({ port }) => 
  console.log(
    `Server is running on http://localhost:${port}`,
  ),
)