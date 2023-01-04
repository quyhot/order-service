const repo = (container) => {
  const invoiceRepo = require('./invoiceRepo')(container)
  const productRepo = require('./productRepo')(container)
  const transportRepo = require('./transportRepo')(container)
  const orderRepo = require('./orderRepo')(container)
  return { invoiceRepo, productRepo, transportRepo, orderRepo }
}
const connect = (container) => {
  const dbPool = container.resolve('db')
  if (!dbPool) throw new Error('Connect DB failed')
  return repo(container)
}

module.exports = { connect }
