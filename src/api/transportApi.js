module.exports = (app, container) => {
  const { serverSettings } = container.resolve('config')
  const { transportController } = container.resolve('controller')
  const { basePath } = serverSettings
  app.get(`${basePath}/transports`, transportController.getTransport)
  app.get(`${basePath}/transports/:id`, transportController.getTransportById)
  app.put(`${basePath}/transports/:id`, transportController.updateTransport)
  app.delete(`${basePath}/transports/:id`, transportController.deleteTransport)
  app.post(`${basePath}/transports`, transportController.addTransport)
}
