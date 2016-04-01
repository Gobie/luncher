'use strict'

var moment = require('moment')
var helpers = require('./helpers')
var service = require('../../../lib/services/pub')()

describe('menu service: pub', function () {
  this.timeout(5 * 1000)

  it('can correctly parse lunch menu', function (done) {
    service.execute({}, helpers.verifyResponse(done))
  })

  it('returns today\'s lunch menu', function (done) {
    service.execute({date: moment.utc().format('YYYY-MM-DD')}, helpers.verifyResponse(done))
  })

  it('returns next lunch menu', function (done) {
    service.execute({date: moment.utc().format('YYYY-MM-DD'), next: true}, helpers.verifyResponse(done))
  })
})
