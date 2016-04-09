'use strict'

var _ = require('lodash')
var uuid = require('uuid')
var moment = require('moment')

module.exports = function (bus, config) {
  return function (req, res) {
    var options = {}
    _.defaults(options, req.query, {
      services: _.map(config.SERVICES, function (service) {
        return service.name
      }),
      date: moment.utc().format('YYYY-MM-DD')
    })

    var received = []
    var timer = null
    var channelWrapper = null

    var respond = _.once(function () {
      clearTimeout(timer)
      channelWrapper.close()
      res.send(received)
    })

    channelWrapper = bus.client(function (msg, content) {
      received = content.data
      return respond()
    })

    channelWrapper.waitForConnect().then(function () {
      channelWrapper.sendToQueue('service.menu', options, {
        correlationId: uuid.v4(),
        replyTo: channelWrapper.replyTo
      })

      timer = setTimeout(respond, config.REQUEST_TIMEOUT)
    })
  }
}
