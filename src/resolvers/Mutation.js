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
  const userId = getUserId(context)
  return context.db.mutation.createTodo({
    data: {
      text: args.text,
      done: false,
      dueAt: args.dueAt,
      user: {
        connect: {
          id: userId,
        }
      }
    }
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
    }
  }, info);
}

function editTodo(parent, args, context, info) {
  return context.db.mutation.updateTodo({
    data: {
      text: args.text,
      dueAt: args.dueAt,
    },
    where: {
      id: args.todoId,
    }
  }, info);
}

function finishTodo(parent, args, context, info) {
  return context.db.mutation.updateTodo({
    data: {
      done: true,
    },
    where: {
      id: args.todoId,
    }
  }, info);
}

function deleteUser(parent, args, context, info) {
  const userId = getUserId(context)
  return context.db.mutation.deleteUser({
    where: {
      id: userId,
    }
  }, info);
}

function deleteTodo(parent, args, context, info) {
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
    finishTodo,
    deleteUser,
    deleteTodo,
}