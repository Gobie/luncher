'use strict'

var config = require('./config.js')
var throng = require('throng')

function start(workerId) {
  var tv4 = require('tv4')
  var serviceSchema = require('./lib/schema/service')
  var bus = require('./lib/bus')(config)
  var app = require('./lib/service/middleware/app')(config)

  var channelWrapper = bus.server('service.menu', function (msg, data) {
    var validate = function (err, res) {

      if (err) {
        console.error(data, err.stack || err)
        return {error: String(err)}
      }

      var result = tv4.validateResult(res, serviceSchema.serviceResponse, true, true)
      if (!result.valid) {
        console.error(data, result)
        return {error: result}
      }

      return res
    }

    var next = function (err, req, res) {
      channelWrapper.sendToQueue(
        msg.properties.replyTo,
        {
          data: validate(err, res ? res.data : null),
          timestamp: Date.now()
        },
        {correlationId: msg.properties.correlationId}
      )
    }

    app.middleware.run({data: data}, {data: [], send: next}, next)
  })

  channelWrapper.waitForConnect().then(function () {
    console.log('service worker', workerId, 'is listening')
  })
}

throng(start, {
  workers: config.WORKERS
})
