module.exports = (container) => {
  const invoiceController = require('./invoiceController')(container)
  const productController = require('./productController')(container)
  const transportController = require('./transportController')(container)
  const orderController = require('./orderController')(container)
  return { invoiceController, productController, transportController, orderController }
}
