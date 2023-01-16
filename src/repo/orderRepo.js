module.exports = container => {
  const { schemas } = container.resolve('models')
  const { Order } = schemas
  const addOrder = (cate) => {
    const c = new Order(cate)
    return c.save()
  }
  const getOrderById = (id) => {
    return Order.findById(id).populate('products.product')
  }
  const deleteOrder = (id) => {
    return Order.findByIdAndRemove(id, { useFindAndModify: false })
  }
  const updateOrder = (id, n) => {
    return Order.findByIdAndUpdate(id, n, {
      useFindAndModify: false,
      returnOriginal: false
    })
  }
  const checkIdExist = (id) => {
    return Order.findOne({ id })
  }
  const getCount = (pipe = {}) => {
    return Order.countDocuments(pipe)
  }
  const getOrderAgg = (pipe) => {
    return Order.aggregate(pipe)
  }
  const getOrder = (pipe, limit, skip, sort) => {
    return Order.find(pipe).limit(limit).skip(skip).sort(sort).populate('products.product')
  }
  const getOrderNoPaging = (pipe) => {
    return Order.find(pipe)
  }
  const removeOrder = (pipe) => {
    return Order.deleteMany(pipe)
  }
  return {
    getOrderNoPaging,
    removeOrder,
    addOrder,
    getOrderAgg,
    getOrderById,
    deleteOrder,
    updateOrder,
    checkIdExist,
    getCount,
    getOrder
  }
}
