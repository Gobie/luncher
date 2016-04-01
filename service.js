'use strict'

var config = require('./config.js')
var throng = require('throng')

throng(start, {
  workers: config.WORKERS
})

function start(workerId) {
  var tv4 = require('tv4')
  var bus = require('./lib/bus')(config)
  var service = require('./lib/services/' + config.SERVICE_NAME)()
  var serviceSchema = require('./lib/schema/service')

  var channelWrapper = bus.server('service.menu.' + config.SERVICE_NAME, function (msg, data) {
    service.execute(data, function (err, res) {
      if (err) {
        console.error(data, err)
        res = {error: err}
      } else {
        var result = tv4.validateResult(res, serviceSchema, true, true)
        if (!result.valid) {
          console.error(data, result)
          res = {error: result}
        }
      }

      res = {
        name: config.SERVICE_NAME,
        data: res,
        timestamp: Date.now()
      }

      channelWrapper.sendToQueue(
        msg.properties.replyTo,
        res,
        {correlationId: msg.properties.correlationId}
      )
    })
  })

  channelWrapper.waitForConnect().then(function () {
    console.log(config.SERVICE_NAME, 'service worker', workerId, 'is listening')
  })
}
