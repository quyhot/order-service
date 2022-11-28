module.exports = (container) => {
  const invoiceController = require('./invoiceController')(container)
  return { invoiceController }
}
