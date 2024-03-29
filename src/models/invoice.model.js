module.exports = (joi, mongoose, { joi2MongoSchema, schemas }) => {
  const { ObjectId } = mongoose.Types
  const stateConfig = {
    WAIT_FOR_PAY: 1,
    PENDING: 2,
    SUCCESS: 3,
    CANCEL: 4
  }
  const invoiceJoi = joi.object({
    invoiceRef: joi.number(),
    amount: joi.number().required(),
    orderInfo: joi.string().required(),
    orderId: joi.string().required(),
    state: joi.number().valid(...Object.values(stateConfig)).default(stateConfig.WAIT_FOR_PAY)
  })
  const invoiceSchema = joi2MongoSchema(invoiceJoi, {
    orderId: {
      type: ObjectId,
      ref: 'Order'
    }
  }, {
    createdAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000)
    }
  })
  invoiceSchema.statics.validateObj = (obj, config = {}) => {
    return invoiceJoi.validate(obj, config)
  }
  invoiceSchema.statics.validateTaiLieu = (obj, config = {
    allowUnknown: true,
    stripUnknown: true
  }) => {
    return invoiceJoi.validate(obj, config)
  }
  invoiceSchema.statics.getConfig = () => {
    return { stateConfig }
  }
  const invoiceModel = mongoose.model('Invoice', invoiceSchema)
  invoiceModel.syncIndexes()
  return invoiceModel
}
