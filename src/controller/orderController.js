module.exports = (container) => {
  const logger = container.resolve('logger')
  const ObjectId = container.resolve('ObjectId')
  const {
    schemaValidator,
    schemas: {
      Order,
      Invoice
    }
  } = container.resolve('models')
  const { httpCode } = container.resolve('config')
  const { orderRepo, invoiceRepo } = container.resolve('repo')
  let ref = 10
  const genInvoiceRef = () => {
    return ref++
  }
  const addOrder = async (req, res) => {
    try {
      const body = req.body
      const {
        error,
        value
      } = await schemaValidator(body, 'Order')
      if (error) {
        return res.status(httpCode.BAD_REQUEST).json({ msg: error.message })
      }
      const order = await orderRepo.addOrder(value)
      const invoiceBody = {
        invoiceRef: genInvoiceRef(),
        amount: order.total * 20000,
        orderId: order._id.toString(),
        orderInfo: 'test'
      }
      const check = await schemaValidator(invoiceBody, 'Invoice')
      if (check.error) {
        return res.status(httpCode.BAD_REQUEST).json({ msg: error.message })
      }
      const invoice = await invoiceRepo.addInvoice(check.value)
      res.status(httpCode.CREATED).json(invoice)
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).end()
    }
  }
  const deleteOrder = async (req, res) => {
    try {
      const { id } = req.params
      if (id) {
        await orderRepo.deleteOrder(id)
        res.status(httpCode.SUCCESS).json({ ok: true })
      } else {
        res.status(httpCode.BAD_REQUEST).end()
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const getOrderById = async (req, res) => {
    try {
      const { id } = req.params
      if (id) {
        const order = await orderRepo.getOrderById(id).lean()
        res.status(httpCode.SUCCESS).json(order)
      } else {
        res.status(httpCode.BAD_REQUEST).end()
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const updateOrder = async (req, res) => {
    try {
      const { id } = req.params
      const order = req.body
      const {
        error,
        value
      } = await schemaValidator(order, 'Order')
      if (error) {
        return res.status(httpCode.BAD_REQUEST).json({ msg: error.message })
      }
      if (id && order) {
        const sp = await orderRepo.updateOrder(id, value)
        res.status(httpCode.SUCCESS).json(sp)
      } else {
        res.status(httpCode.BAD_REQUEST).end()
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const getOrder = async (req, res) => {
    try {
      let {
        page,
        perPage,
        sort,
        ids
      } = req.query
      page = +page || 1
      perPage = +perPage || 10
      sort = +sort === 0 ? { _id: 1 } : +sort || { _id: -1 }
      const skip = (page - 1) * perPage
      const search = { ...req.query }
      if (ids) {
        if (ids.constructor === Array) {
          search.id = { $in: ids }
        } else if (ids.constructor === String) {
          search.id = { $in: ids.split(',') }
        }
      }
      delete search.ids
      delete search.page
      delete search.perPage
      delete search.sort
      const pipe = {}
      Object.keys(search).forEach(i => {
        const vl = search[i]
        const pathType = (Order.schema.path(i) || {}).instance || ''
        if (pathType.toLowerCase() === 'objectid') {
          pipe[i] = ObjectId(vl)
        } else if (pathType === 'Number') {
          pipe[i] = +vl
        } else if (pathType === 'String' && vl.constructor === String) {
          pipe[i] = new RegExp(vl, 'gi')
        } else {
          pipe[i] = vl
        }
      })
      const data = await orderRepo.getOrder(pipe, perPage, skip, sort)
      const total = await orderRepo.getCount(pipe)
      res.status(httpCode.SUCCESS).json({
        perPage,
        skip,
        sort,
        data,
        total,
        page
      })
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  return {
    addOrder,
    getOrder,
    getOrderById,
    updateOrder,
    deleteOrder
  }
}
