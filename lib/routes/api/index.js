'use strict'

var _ = require('lodash')
var uuid = require('uuid')
var moment = require('moment')

var createRoute = function (bus, config, inputCb, outputCb) {
  return function (req, res) {
    var input = _.defaults(req.query, {
      services: config.SERVICES
    })
    input.services = Array.isArray(input.services) ? input.services : [input.services]
    inputCb(input)

    var received = []
    var timer = null
    var channelWrapper = null

    var respond = _.once(function () {
      clearTimeout(timer)
      timer = null
      channelWrapper.close()
      channelWrapper = null
      res.send(outputCb(received))
    })

    channelWrapper = bus.client(function (msg, content) {
      received.push(content)

      if (input.services.length === received.length) {
        return respond()
      }
    })

    channelWrapper.waitForConnect().then(function () {
      input.services.forEach(function (menu) {
        channelWrapper.sendToQueue('service.menu.' + menu, input, {
          correlationId: uuid.v4(),
          replyTo: channelWrapper.replyTo
        })
      })

      timer = setTimeout(respond, config.REQUEST_TIMEOUT)
    })
  }
}

var standardOutput = function (output) {
  return output.map(function (service) {
    return {
      name: service.name,
      menu: service.data.menu,
      error: service.data.error
    }
  })
}

module.exports = function (router, bus, config) {
  router.get('/today', createRoute(bus, config, function (input) {
    input.date = moment.utc().format('YYYY-MM-DD')
  }, standardOutput))

  router.get('/next', createRoute(bus, config, function (input) {
    input.date = moment.utc().format('YYYY-MM-DD')
    input.next = true
  }, standardOutput))

  return router
}
