module.exports = (joi, mongoose, { joi2MongoSchema, schemas }) => {
  const transportJoi = joi.object({
    name: joi.string().required(),
    description: joi.string().default(''),
    amount: joi.number().default(0),
    price: joi.number().required(),
    deliveryTime: joi.string().required(3)
  })
  const transportSchema = joi2MongoSchema(transportJoi, {}, {
    createdAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000)
    }
  })
  transportSchema.statics.validateObj = (obj, config = {}) => {
    return transportJoi.validate(obj, config)
  }
  transportSchema.statics.validateTaiLieu = (obj, config = {
    allowUnknown: true,
    stripUnknown: true
  }) => {
    return transportJoi.validate(obj, config)
  }
  const transportModel = mongoose.model('Transport', transportSchema)
  transportModel.syncIndexes()
  return transportModel
}
