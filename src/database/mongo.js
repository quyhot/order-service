const MongoClient = require('mongoose')
const getMongoURL = (options) => {
  let url
  if (options.user && options.pass) {
    url = options.servers
      .reduce((prev, cur) => prev + cur + ',', `mongodb://${options.user}:${options.pass}@`)
  } else {
    url = options.servers
      .reduce((prev, cur) => prev + cur + ',', `mongodb://`)
  }
  return `${url.substr(0, url.length - 1)}/${options.db}${options.repl ? `?replicaSet=${options.repl}` : ''}`
}
const connect = (container, mediator) => {
  const config = container.resolve('config')
  const { dbSettings } = config
  if (!dbSettings) throw new Error('missing dbSettings')
  const connectionString = getMongoURL(dbSettings)
  MongoClient.connect(connectionString, {
    useNewUrlParser: true,
    keepAlive: 1,
    useUnifiedTopology: true,
    authSource: 'admin',
    useCreateIndex: true
  })
  const db = MongoClient.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    mediator.emit('db.ready', db)
  })
}

module.exports = { connect }
