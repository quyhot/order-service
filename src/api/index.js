module.exports = (app, container) => {
  require('./invoiceApi')(app, container)
  require('./productApi')(app, container)
  require('./transportApi')(app, container)
  require('./orderApi')(app, container)
}
