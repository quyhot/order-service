const serverSettings = {
  port: process.env.PORT || 8004,
  basePath: process.env.BASE_PATH || ''
}

const httpCode = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  TOKEN_EXPIRED: 409,
  UNKNOWN_ERROR: 520,
  FORBIDDEN: 403,
  ADMIN_REQUIRE: 406,
  UNAUTHORIZED: 401,
}

const dbSettings = {
  db: process.env.DB || 'quytest-order-service',
  user: process.env.DB_USER || '',
  pass: process.env.DB_PASS || '',
  repl: process.env.DB_REPLS || '',
  servers: (process.env.DB_SERVERS) ? process.env.DB_SERVERS.split(',') : [
    'mayhao:27017'
  ]
}
const serverHelper = function () {
  const jwt = require('jsonwebtoken')
  const crypto = require('crypto')
  const secretKey = process.env.SECRET_KEY || '112customer#$!@!'

  function decodeToken (token) {
    return jwt.decode(token)
  }

  function genToken (obj) {
    return jwt.sign(obj, secretKey, { expiresIn: '1d' })
  }

  function verifyToken (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, decoded) => {
        err ? reject(new Error(err)) : resolve(decoded)
      })
    })
  }

  function encryptPassword (password) {
    return crypto.createHash('sha256').update(password, 'binary').digest('base64')
  }

  const randomOrderRef = () => {
    return Math.floor(Math.random() * 100000)
  }

  return { decodeToken, encryptPassword, verifyToken, genToken, randomOrderRef }
}
const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMNCODE || 'B0YQQBCV',
  secretKey: process.env.VNPAY_SECRETKEY || 'OZKCXATUMAFDHPLNKRRTXIPZQCZYXIYG',
  vnpUrl: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnpVersion: process.env.VNPAY_VERSION || '2.0.1',
  vnpReturnUrl: process.env.VNPAY_VERSION || 'http://localhost:8004/invoices',
  vnpLocale: process.env.VNPAY_LOCALE || 'vn',
  vnpCurrCode: process.env.VNPAY_CURRCODE || 'VND',
  vnpCommand: process.env.VNPAY_CURRCODE || 'pay'
}

const urlConfig = {
  frontend: process.env.FE_URL || 'http://localhost:8080'
}

module.exports = { dbSettings, serverHelper: serverHelper(), serverSettings, httpCode, vnpayConfig, urlConfig }
