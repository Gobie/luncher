'use strict'

var tv4 = require('tv4')
var serviceSchema = require('../../../lib/schema/service')

module.exports = {
  verifyResponse: function (done) {
    return function (err, res) {
      if (err) {
        return done(err)
      }

      var result = tv4.validateResult(res, serviceSchema)
      if (!result.valid) {
        return done(result)
      }

      done()
    }
  }
}
