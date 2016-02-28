'use strict'

var _ = require('lodash')
var uuid = require('uuid')

module.exports = function (bus, timeout) {
  return function (req, res) {
    // TODO get from req
    var menus = ['pub']
    var received = []
    var timer = null
    var channelWrapper = null

    var respond = _.once(function () {
      clearTimeout(timer)
      channelWrapper.close()
      res.send(received)
    })

    channelWrapper = bus.client(function (msg, data) {
      received.push(data)

      if (menus.length === received.length) {
        return respond()
      }
    })

    channelWrapper.waitForConnect().then(function () {
      menus.forEach(function (menu) {
        channelWrapper.sendToQueue('service.menu.' + menu, {}, {
          correlationId: uuid.v4(),
          replyTo: channelWrapper.replyTo
        })
      })

      timer = setTimeout(respond, timeout)
    })
  }
}
