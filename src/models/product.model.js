module.exports = (joi, mongoose, { joi2MongoSchema, schemas }) => {
  const productJoi = joi.object({
    name: joi.string().required(),
    description: joi.string().default(''),
    amount: joi.number().default(0),
    price: joi.number().required()
  })
  const productSchema = joi2MongoSchema(productJoi, {}, {
    createdAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000)
    }
  })
  productSchema.statics.validateObj = (obj, config = {}) => {
    return productJoi.validate(obj, config)
  }
  productSchema.statics.validateTaiLieu = (obj, config = {
    allowUnknown: true,
    stripUnknown: true
  }) => {
    return productJoi.validate(obj, config)
  }
  const productModel = mongoose.model('Product', productSchema)
  productModel.syncIndexes()
  return productModel
}
