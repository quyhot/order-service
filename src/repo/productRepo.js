module.exports = container => {
  const { schemas } = container.resolve('models')
  const { Product } = schemas
  const addProduct = (cate) => {
    const c = new Product(cate)
    return c.save()
  }
  const getProductById = (id) => {
    return Product.findById(id)
  }
  const deleteProduct = (id) => {
    return Product.findByIdAndRemove(id, { useFindAndModify: false })
  }
  const updateProduct = (id, n) => {
    return Product.findByIdAndUpdate(id, n, {
      useFindAndModify: false,
      returnOriginal: false
    })
  }
  const checkIdExist = (id) => {
    return Product.findOne({ id })
  }
  const getCount = (pipe = {}) => {
    return Product.countDocuments(pipe)
  }
  const getProductAgg = (pipe) => {
    return Product.aggregate(pipe)
  }
  const getProduct = (pipe, limit, skip, sort) => {
    return Product.find(pipe).limit(limit).skip(skip).sort(sort)
  }
  const getProductNoPaging = (pipe) => {
    return Product.find(pipe)
  }
  const removeProduct = (pipe) => {
    return Product.deleteMany(pipe)
  }
  return {
    getProductNoPaging,
    removeProduct,
    addProduct,
    getProductAgg,
    getProductById,
    deleteProduct,
    updateProduct,
    checkIdExist,
    getCount,
    getProduct
  }
}
