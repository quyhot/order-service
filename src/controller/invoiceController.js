const crypto = require('crypto')
module.exports = (container) => {
  const logger = container.resolve('logger')
  const ObjectId = container.resolve('ObjectId')
  const moment = require('moment')
  const qs = require('qs')
  const {
    schemaValidator,
    schemas: {
      Invoice
    }
  } = container.resolve('models')
  const { stateConfig } = Invoice.getConfig()
  const { httpCode, serverHelper, vnpayConfig } = container.resolve('config')
  const { invoiceRepo } = container.resolve('repo')
  const addInvoice = async (req, res) => {
    try {
      const body = req.body
      const {
        error,
        value
      } = await schemaValidator(body, 'Invoice')
      if (error) {
        return res.status(httpCode.BAD_REQUEST).json({ msg: error.message })
      }
      const sp = await invoiceRepo.addInvoice(value)
      res.status(httpCode.CREATED).json(sp)
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).end()
    }
  }
  const deleteInvoice = async (req, res) => {
    try {
      const { id } = req.params
      if (id) {
        await invoiceRepo.deleteInvoice(id)
        res.status(httpCode.SUCCESS).json({ ok: true })
      } else {
        res.status(httpCode.BAD_REQUEST).end()
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const getInvoiceById = async (req, res) => {
    try {
      const { id } = req.params
      if (id) {
        const invoice = await invoiceRepo.getInvoiceById(id).lean()
        res.status(httpCode.SUCCESS).json(invoice)
      } else {
        res.status(httpCode.BAD_REQUEST).end()
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const updateInvoice = async (req, res) => {
    try {
      const { id } = req.params
      const invoice = req.body
      const {
        error,
        value
      } = await schemaValidator(invoice, 'Invoice')
      if (error) {
        return res.status(httpCode.BAD_REQUEST).json({ msg: error.message })
      }
      if (id && invoice) {
        const sp = await invoiceRepo.updateInvoice(id, value)
        res.status(httpCode.SUCCESS).json(sp)
      } else {
        res.status(httpCode.BAD_REQUEST).end()
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const getInvoice = async (req, res) => {
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
        const pathType = (Invoice.schema.path(i) || {}).instance || ''
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
      const data = await invoiceRepo.getInvoice(pipe, perPage, skip, sort)
      const total = await invoiceRepo.getCount(pipe)
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
  const genReturnUrl = (id) => {
    return `${vnpayConfig.vnpReturnUrl}/${id}/result`
  }
  const payInvoice = async (req, res) => {
    try {
      const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress
      let ipv4 = ipAddr.split(':').pop()
      if (ipv4 === '1') ipv4 = '127.0.0.1'
      const { id } = req.params
      if (id && id.length === 24) {
        const invoice = await invoiceRepo.getInvoiceById(id)
        if (!invoice) return res.status(httpCode.BAD_REQUEST).json({ msg: 'invoice does not exists!' })
        if (invoice.state !== stateConfig.WAIT_FOR_PAY) return res.status(httpCode.BAD_REQUEST).json({ msg: 'invoice don\'t wait for pay' })
        const invoiceRef = serverHelper.randomOrderRef()
        const body = {
          vnp_Amount: `${invoice.amount * 100}`,
          vnp_Command: vnpayConfig.vnpCommand,
          vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
          vnp_CurrCode: vnpayConfig.vnpCurrCode,
          vnp_Locale: vnpayConfig.vnpLocale,
          vnp_OrderInfo: invoice.orderInfo,
          vnp_ReturnUrl: genReturnUrl(id),
          vnp_TmnCode: vnpayConfig.tmnCode,
          vnp_TxnRef: invoice.invoiceRef,
          vnp_Version: vnpayConfig.vnpVersion
        }
        const { secretKey } = vnpayConfig
        const signData = qs.stringify(body, { encode: false })
        const hmac = crypto.createHmac('sha512', secretKey)
        body.vnp_SecureHash = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')
        const url = `${vnpayConfig.vnpUrl}?${qs.stringify(body, { encode: false })}`
        await invoiceRepo.updateInvoice(id, { state: stateConfig.PENDING, invoiceRef })
        return res.redirect(url)
      }
      res.status(httpCode.BAD_REQUEST).json({ msg: 'wrong id' })
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  const receiveOrderResult = async (req, res) => {
    try {
      const q = req.query
      const { id } = req.params
      const { vnp_ResponseCode: vnpResponseCode } = q
      const data = {
        vnpResponseCode
      }
      switch (vnpResponseCode) {
        case '24':
          data.msg = 'Người dùng hủy giao dịch'
          await invoiceRepo.updateInvoice(id, { state: stateConfig.WAIT_FOR_PAY })
          return res.status(httpCode.BAD_REQUEST).json(data)
        case '00':
          data.msg = 'Giao dịch thành công'
          await invoiceRepo.updateInvoice(id, { state: stateConfig.SUCCESS })
          return res.status(httpCode.SUCCESS).json(data)
        default:
          data.msg = 'Lỗi'
          await invoiceRepo.updateInvoice(id, { state: stateConfig.WAIT_FOR_PAY })
          return res.status(httpCode.BAD_REQUEST).json(data)
      }
    } catch (e) {
      logger.e(e)
      res.status(httpCode.UNKNOWN_ERROR).json({ ok: false })
    }
  }
  return {
    addInvoice,
    getInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    payInvoice,
    receiveOrderResult
  }
}
