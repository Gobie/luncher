'use strict'

var _ = require('lodash')
var uuid = require('uuid')
var moment = require('moment')

var createRoute = function (bus, config, inputCb, outputCb) {
  return function (req, res) {
    var options = {}
    _.defaults(options, req.query, {
      services: config.SERVICES
    })
    options.services = Array.isArray(options.services) ? options.services : [options.services]

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

      if (options.services.length === received.length) {
        return respond()
      }
    })

    channelWrapper.waitForConnect().then(function () {
      options.services.forEach(function (menu) {
        channelWrapper.sendToQueue('service.menu.' + menu, inputCb(options), {
          correlationId: uuid.v4(),
          replyTo: channelWrapper.replyTo
        })
      })

      timer = setTimeout(respond, config.REQUEST_TIMEOUT)
    })
  }
}

var normalizeOptions = function (options) {
  options.date = options.date || moment.utc().format('YYYY-MM-DD')
  if (!moment(options.date, 'YYYY-MM-DD', true).isValid()) {
    throw new Error('invalid date input' + options.date + ', required YYYY-MM-DD')
  }

  return options
}

var formatOutput = function (output) {
  return output.map(function (service) {
    return {
      name: service.name,
      menu: service.data.menu,
      error: service.data.error
    }
  })
}

module.exports = function (router, bus, config) {
  router.get('/today', createRoute(bus, config, function (options) {
    options = normalizeOptions(options)

    return {
      date: options.date,
      next: false
    }
  }, formatOutput))

  router.get('/next', createRoute(bus, config, function (options) {
    options = normalizeOptions(options)

    return {
      date: options.date,
      next: true
    }
  }, formatOutput))

  return router
}
