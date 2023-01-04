module.exports = (app, container) => {
  const { serverSettings } = container.resolve('config')
  const { productController } = container.resolve('controller')
  const { basePath } = serverSettings
  app.get(`${basePath}/products`, productController.getProduct)
  app.get(`${basePath}/products/:id`, productController.getProductById)
  app.put(`${basePath}/products/:id`, productController.updateProduct)
  app.delete(`${basePath}/products/:id`, productController.deleteProduct)
  app.post(`${basePath}/products`, productController.addProduct)
}
