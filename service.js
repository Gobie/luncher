'use strict'

let config = require('./config.js')
let throng = require('throng')

let start = (workerId) => {
  let tv4 = require('tv4')
  let winston = require('winston')
  let serviceSchema = require('./lib/schema/service')
  let bus = require('./lib/bus')(config, winston)
  let app = require('./service/middleware/app')(config, winston)

  let channelWrapper = bus.server('service.menu', (msg, data) => {
    winston.info('SERVICE: request', data)
    let validate = (err, res) => {
      if (err) {
        winston.error('SERVICE: error', data, err.stack || err)
        return {error: String(err)}
      }

      let result = tv4.validateResult(res, serviceSchema.response, true, true)
      if (!result.valid) {
        winston.error('SERVICE: schema validation failed', data, result)
        return {error: result}
      }

      return res
    }

    let next = (err, req, res) => {
      winston.info('SERVICE: response', res ? res.data.length : err)
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

  channelWrapper.waitForConnect().then(() => winston.info('SERVICE: worker', workerId, 'is listening'))
}

throng({
  workers: config.WORKERS
}, start)
