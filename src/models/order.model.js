module.exports = (joi, mongoose, { joi2MongoSchema, schemas }) => {
  const { ObjectId } = mongoose.Types
  const orderJoi = joi.object({
    products: joi.array().items(joi.object().keys({
      product: joi.string().allow(''),
      amount: joi.number()
    })).min(1),
    transport: joi.string().required(),
    email: joi.string().required(),
    phone: joi.string().required(),
    name: joi.string().required(),
    total: joi.number().required()
  })
  const orderSchema = joi2MongoSchema(orderJoi, {
    products: [{
      product: {
        type: ObjectId,
        ref: 'Product'
      },
      amount: {
        type: Number
      }
    }]
  }, {
    createdAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000)
    }
  })
  orderSchema.statics.validateObj = (obj, config = {}) => {
    return orderJoi.validate(obj, config)
  }
  orderSchema.statics.validateTaiLieu = (obj, config = {
    allowUnknown: true,
    stripUnknown: true
  }) => {
    return orderJoi.validate(obj, config)
  }
  const orderModel = mongoose.model('Order', orderSchema)
  orderModel.syncIndexes()
  return orderModel
}
