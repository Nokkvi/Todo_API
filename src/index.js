const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const options = {
  port: 8000
}


const resolvers = {
  Query: {
    info: () => `Welcome to the Todo list website`,

    users: (root, args, context, info) => {
      return context.db.query.users({}, info);
    },

    user: (root, args, context, info) => {
      return context.db.query.user({
        where: {
          id: args.id
        }
      }, info);
    }
  },

  Mutation: {
    createUser: (root, args, context, info) => {
      return context.db.mutation.createUser({
        data: {
          name: args.name,
          password: args.password
        }
      }, info)
    },

    createTodo: (root, args, context, info) => {
      return context.db.mutation.createTodo({
        data: {
          text: args.text,
          done: false,
          dueAt: args.dueAt,
          user: {
            connect: {
              id: args.userId
            }
          }
        }
      }, info)
    },

    //TODO connect to db
    changePassword: (root, args, context, info) => {
      return context.db.mutation.updateUser({
        data: {
          password: args.password
        },
        where: {
          id: args.userId 
        }
      }, info)
      for(let i = 0; i < users.length; i++) {
        if(users[i].id === args.id) {
          users[i].password = args.password;
          return users[i];
        }
      }
    },

    deleteUser: (root, args, context, info) => {
      return context.db.mutation.deleteUser({
        where: {
          id: args.userId
        }
      }, info);
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
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://eu1.prisma.sh/nokkvi-sverrisson-13c544/database/dev',
      secret: 'mysecret123',
      debug: true,
    }),
  }),
})

server.start(options, ({ port }) => 
  console.log(
    `Server is running on http://localhost:${port}`,
  ),
)