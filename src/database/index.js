const mongo = require('./mongo')
const { ObjectId } = require('mongodb')
module.exports = { connect: mongo.connect, ObjectId }
