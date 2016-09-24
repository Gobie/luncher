'use strict'

let _ = require('lodash')
let uuid = require('uuid')
let moment = require('moment')

let createRoute = (bus, config, inputCb, outputCb) => {
  return (req, res) => {
    let options = {}
    Object.assign(options, {
      services: _.map(config.SERVICES, (service) => service.name)
    }, req.query)

    let timer = null
    let channelWrapper = null

    let respond = _.once((received) => {
      clearTimeout(timer)
      timer = null
      channelWrapper.close()
      channelWrapper = null
      res.send(outputCb(received))
    })

    channelWrapper = bus.client((msg, content) => respond(content))

    channelWrapper.waitForConnect().then(() => {
      channelWrapper.sendToQueue('service.menu', inputCb(options), {
        correlationId: uuid.v4(),
        replyTo: channelWrapper.replyTo
      })

      timer = setTimeout(() => respond({data: {error: 'Timeout'}}), config.REQUEST_TIMEOUT)
    })
  }
}

let normalizeOptions = (options, config) => {
  options.date = options.date || moment.utc().format('YYYY-MM-DD')
  if (!moment(options.date, 'YYYY-MM-DD', true).isValid()) {
    throw new Error(`invalid date input ${options.date}, required YYYY-MM-DD`)
  }

  options.services = Array.isArray(options.services) ? options.services : [options.services]
  options.services = options.services.filter((serviceName) => Boolean(_.find(config.SERVICES, ['name', serviceName])))

  return options
}

let formatOutput = (output) => output.data.error ? [{error: output.data.error}] : output.data

module.exports = (router, bus, config) => {
  router.get('/today', createRoute(bus, config, (options) => {
    let opts = normalizeOptions(options, config)

    return {
      services: opts.services,
      date: opts.date,
      next: false
    }
  }, formatOutput))

  router.get('/next', createRoute(bus, config, (options) => {
    let opts = normalizeOptions(options, config)

    return {
      services: opts.services,
      date: opts.date,
      next: true
    }
  }, formatOutput))

  return router
}
