'use strict'

var throng = require('throng')

var WORKERS = process.env.WEB_CONCURRENCY || 1
var SERVICE_NAME = process.env.SERVICE_NAME || 'unknown'

throng(start, {
  workers: WORKERS
})

function start(workerId) {
  var bus = require('./lib/bus')()
  var service = require('./lib/services/' + SERVICE_NAME)()

  var channelWrapper = bus.server('service.menu.' + SERVICE_NAME, function (msg, data) {
    service.execute(data, function (err, res) {
      if (err) {
        console.error(err)
        res = {error: err}
      }

      channelWrapper.sendToQueue(
        msg.properties.replyTo,
        res,
        {correlationId: msg.properties.correlationId}
      )
    })
  })

  console.log(SERVICE_NAME, 'service worker', workerId, 'is listening')
}
