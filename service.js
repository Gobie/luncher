'use strict'

var config = require('./config.js')
var throng = require('throng')

function start(workerId) {
  var tv4 = require('tv4')
  var winston = require('winston')
  var serviceSchema = require('./lib/schema/service')
  var bus = require('./lib/bus')(config, winston)
  var app = require('./service/middleware/app')(config, winston)

  var channelWrapper = bus.server('service.menu', function (msg, data) {
    var validate = function (err, res) {
      if (err) {
        winston.error('SERVICE: error', data, err.stack || err)
        return {error: String(err)}
      }

      var result = tv4.validateResult(res, serviceSchema.response, true, true)
      if (!result.valid) {
        winston.error('SERVICE: schema validation failed', data, result)
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
    winston.info('SERVICE: worker', workerId, 'is listening')
  })
}

throng({
  workers: config.WORKERS
}, start)
