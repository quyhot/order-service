const repo = (container) => {
  const invoiceRepo = require('./invoiceRepo')(container)
  return { invoiceRepo }
}
const connect = (container) => {
  const dbPool = container.resolve('db')
  if (!dbPool) throw new Error('Connect DB failed')
  return repo(container)
}

module.exports = { connect }
