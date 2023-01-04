module.exports = (app, container) => {
  const { serverSettings } = container.resolve('config')
  const { orderController } = container.resolve('controller')
  const { basePath } = serverSettings
  app.get(`${basePath}/orders`, orderController.getOrder)
  app.get(`${basePath}/orders/:id`, orderController.getOrderById)
  app.put(`${basePath}/orders/:id`, orderController.updateOrder)
  app.delete(`${basePath}/orders/:id`, orderController.deleteOrder)
  app.post(`${basePath}/orders`, orderController.addOrder)
}
