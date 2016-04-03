'use strict'

var rootPath = '../../../'
var moment = require('moment')
var tv4 = require('tv4')
var ware = require('ware')
var serviceSchema = require(rootPath + 'lib/schema/service')
var config = require(rootPath + 'config')

var verifyResponse = function (done) {
  return function (err, req, res) {
    if (err) {
      return done(err)
    }

    var result = tv4.validateResult(res.data, serviceSchema, true, true)
    if (!result.valid) {
      return done(result)
    }

    done()
  }
}

var createServiceTests = function (serviceName, middleware) {
  describe('menu service: ' + serviceName, function () {
    this.timeout(5 * 1000)

    it('can correctly parse lunch menu', function (done) {
      var req = {data: {}}
      var res = {data: null}
      middleware.run(req, res, verifyResponse(done))
    })

    it('returns today\'s lunch menu', function (done) {
      var req = {data: {
        date: moment.utc().format('YYYY-MM-DD')
      }}
      var res = {data: null}
      middleware.run(req, res, verifyResponse(done))
    })

    it('returns next lunch menu', function (done) {
      var req = {data: {
        date: moment.utc().format('YYYY-MM-DD'),
        next: true
      }}
      var res = {data: null}
      middleware.run(req, res, verifyResponse(done))
    })
  })
}

describe('menu services', function () {
  for (var i = 0; i < config.SERVICES.length; i++) {
    var serviceName = config.SERVICES[i]
    var service = require(rootPath + 'lib/service/' + serviceName)()
    var middleware = ware().use(service.middleware)

    createServiceTests(serviceName, middleware)
  }
})
