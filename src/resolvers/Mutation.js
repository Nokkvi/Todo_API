const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
  // Encrypt password
  const password = await bcrypt.hash(args.password, 10)
  // Create user
  const user = await context.db.mutation.createUser({
    data: { ...args, password },
  }, `{ id }`)

  // Generate JWT Token
  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  // return AuthPayload
  return {
    token,
    user,
  }
}

async function login(parent, args, context, info) {
  // Fetch User
  const user = await context.db.query.user({ where: { email: args.email } }, ` { id password } `)
  if (!user) {
    throw new Error('No such user found')
  }

  // Check password
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  // Generate JWT Token
  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  // return AuthPayload
  return {
    token,
    user,
  }
}

function createTodo(parent, args, context, info) {
  const creatorId = getUserId(context)
  const userId = args.userId || creatorId
  return context.db.mutation.createTodo({
    data: {
      text: args.text,
      done: false,
      dueAt: args.dueAt,
      user: {
        connect: {
          id: userId,
        }
      },
      creator: {
        connect: {
          id: creatorId,
        }
      },
    },
  }, info);
}

async function changePassword(parent, args, context, info) {
  const userId = getUserId(context)
  const password = await bcrypt.hash(args.password, 10)
  return context.db.mutation.updateUser({
    data: {
      password,
    },
    where: {
      id: userId,
    },
  }, info);
}

async function editTodo(parent, args, context, info) {
  const userId = getUserId(context)
  const todo = await context.db.query.todo({
    where: {
      id: args.todoId,
    },
  }, ` { id creator {id} } `);
  
  if (!todo) throw new Error('Todo does not exist'); 
  if (userId != todo.creator.id) {
    throw new Error('Logged in user is not creator');
  }
  return context.db.mutation.updateTodo({
    data: {
      text: args.text,
      dueAt: args.dueAt,
    },
    where: {
      id: args.todoId,
    },
  }, info);
}

async function assignTodo(parent, args, context, info) {
  const userId = getUserId(context)
  const todo = await context.db.query.todo({
    where: {
      id: args.todoId,
    },
  }, ` { id creator {id} } `);
  
  if (!todo) throw new Error('Todo does not exist'); 
  if (userId != todo.creator.id) {
    throw new Error('Logged in user is not creator');
  }
  return context.db.mutation.updateTodo({
    data: {
      user: {
        connect: {
          id: args.userId,
        }
      },
    },
    where: {
      id: args.todoId,
    },
  }, info);
}

async function finishTodo(parent, args, context, info) {
  const userId = getUserId(context)
  const todo = await context.db.query.todo({
    where: {
      id: args.todoId,
    },
  }, ` { id user {id} } `)
  if (userId != todo.user.id) {
    throw new Error('Logged in user is not asignee')
  }
  return context.db.mutation.updateTodo({
    data: {
      done: true,
    },
    where: {
      id: args.todoId,
    },
  }, info);
}

function deleteUser(parent, args, context, info) {
  const userId = getUserId(context)
  return context.db.mutation.deleteUser({
    where: {
      id: userId,
    },
  }, info);
}

async function deleteTodo(parent, args, context, info) {
  const userId = getUserId(context)
  const todo = await context.db.query.todo({
    where: {
      id: args.todoId,
    },
  }, ` { id creator {id} user {id}} `);
  
  if (!todo) throw new Error('Todo does not exist'); 
  if (!((userId == todo.creator.id) || (userId == todo.user.id))) {
    throw new Error('Logged in user is not creator or assignee');
  }
  return context.db.mutation.deleteTodo({
    where: {
      id: args.todoId,
    }
  }, info);
}

module.exports = {
    signup,
    login,
    createTodo,
    changePassword,
    editTodo,
    assignTodo,
    finishTodo,
    deleteUser,
    deleteTodo,
}