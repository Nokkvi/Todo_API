function info() {
  return `Welcome to the Todo list website`
}

function users(parent, args, context, info) {
  return context.db.query.users({}, info)
}

function user(parent, args, context, info) {
  return context.db.query.user({
    where: {
      id: args.id
    }
  }, info)
}

function todo(parent, args, context, info) {
  return context.db.query.todo({
    where: {
      id: args.id
    }
  }, info)
}

module.exports = {
  info,
  users,
  user,
  todo,
}
