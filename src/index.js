const { GraphQLServer } = require('graphql-yoga')

const options = {
  port: 8000
}

//TODO replace with real database
let users = [{
  id: "user-1",
  name: "Bob",
  password: "password123",
  todos: [{
    id: "todo-1",
    text: "Mop Ceiling",
  }]
}]

let userIdCount = users.length;

const resolvers = {
  Query: {
    info: () => `Welcome to the Todo list website`,

    users: () => users,

    user: (root, args) => {
      for(let i = 0; i < users.length; i++){
        if(users[i].id === args.id){
          return users[i];
        }
      }
    }
  },

  Mutation: {
    createUser: (root, args) => {
      const user = {
        id: `user-${++userIdCount}`,
        name: args.name,
        password: args.password,
        todos: []
      }

      users.push(user);
      return user;
    },

    changePassword: (root, args) => {
      for(let i = 0; i < users.length; i++) {
        if(users[i].id === args.id) {
          users[i].password = args.password;
          return users[i];
        }
      }
    },

    deleteUser: (root, args) => {
      for(let i = 0; i < users.length; i++) {
        if(users[i].id === args.id) {
          users.splice(i, 1);
          return true;
        }
      }
      return false;
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