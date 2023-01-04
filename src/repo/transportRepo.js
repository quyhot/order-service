module.exports = container => {
  const { schemas } = container.resolve('models')
  const { Transport } = schemas
  const addTransport = (cate) => {
    const c = new Transport(cate)
    return c.save()
  }
  const getTransportById = (id) => {
    return Transport.findById(id)
  }
  const deleteTransport = (id) => {
    return Transport.findByIdAndRemove(id, { useFindAndModify: false })
  }
  const updateTransport = (id, n) => {
    return Transport.findByIdAndUpdate(id, n, {
      useFindAndModify: false,
      returnOriginal: false
    })
  }
  const checkIdExist = (id) => {
    return Transport.findOne({ id })
  }
  const getCount = (pipe = {}) => {
    return Transport.countDocuments(pipe)
  }
  const getTransportAgg = (pipe) => {
    return Transport.aggregate(pipe)
  }
  const getTransport = (pipe, limit, skip, sort) => {
    return Transport.find(pipe).limit(limit).skip(skip).sort(sort)
  }
  const getTransportNoPaging = (pipe) => {
    return Transport.find(pipe)
  }
  const removeTransport = (pipe) => {
    return Transport.deleteMany(pipe)
  }
  return {
    getTransportNoPaging,
    removeTransport,
    addTransport,
    getTransportAgg,
    getTransportById,
    deleteTransport,
    updateTransport,
    checkIdExist,
    getCount,
    getTransport
  }
}
