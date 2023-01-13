module.exports = container => {
  const { schemas } = container.resolve('models')
  const { Invoice } = schemas
  const addInvoice = (cate) => {
    const c = new Invoice(cate)
    return c.save()
  }
  const getInvoiceById = (id) => {
    return Invoice.findById(id)
  }
  const deleteInvoice = (id) => {
    return Invoice.findByIdAndRemove(id, { useFindAndModify: false })
  }
  const updateInvoice = (id, n) => {
    return Invoice.findByIdAndUpdate(id, n, {
      useFindAndModify: false,
      returnOriginal: false
    })
  }
  const checkIdExist = (id) => {
    return Invoice.findOne({ id }).populate('orderId')
  }
  const getCount = (pipe = {}) => {
    return Invoice.countDocuments(pipe)
  }
  const getInvoiceAgg = (pipe) => {
    return Invoice.aggregate(pipe)
  }
  const getInvoice = (pipe, limit, skip, sort) => {
    return Invoice.find(pipe).limit(limit).skip(skip).sort(sort).populate('orderId')
  }
  const getInvoiceNoPaging = (pipe) => {
    return Invoice.find(pipe)
  }
  const removeInvoice = (pipe) => {
    return Invoice.deleteMany(pipe)
  }
  return {
    getInvoiceNoPaging,
    removeInvoice,
    addInvoice,
    getInvoiceAgg,
    getInvoiceById,
    deleteInvoice,
    updateInvoice,
    checkIdExist,
    getCount,
    getInvoice
  }
}
