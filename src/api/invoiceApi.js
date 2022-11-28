module.exports = (app, container) => {
  const { serverSettings } = container.resolve('config')
  const { invoiceController } = container.resolve('controller')
  const { basePath } = serverSettings
  app.get(`${basePath}/invoices`, invoiceController.getInvoice)
  app.get(`${basePath}/invoices/:id/result`, invoiceController.receiveOrderResult)
  app.get(`${basePath}/invoices/:id/pay`, invoiceController.payInvoice)
  app.get(`${basePath}/invoices/:id`, invoiceController.getInvoiceById)
  app.put(`${basePath}/invoices/:id`, invoiceController.updateInvoice)
  app.delete(`${basePath}/invoices/:id`, invoiceController.deleteInvoice)
  app.post(`${basePath}/invoices`, invoiceController.addInvoice)
}
