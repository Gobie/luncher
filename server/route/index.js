'use strict'

let _ = require('lodash')
let uuid = require('uuid')
let moment = require('moment')

module.exports = (bus, config) => {
  return (req, res) => {
    let options = {}
    _.defaults(options, req.query, {
      services: _.map(config.SERVICES, (service) => service.name),
      date: moment.utc().format('YYYY-MM-DD')
    })

    let timer = null
    let channelWrapper = null

    let respond = _.once((received) => {
      clearTimeout(timer)
      channelWrapper.close()
      res.send(received)
    })

    channelWrapper = bus.client((msg, content) => respond(content.data))

    channelWrapper.waitForConnect().then(() => {
      channelWrapper.sendToQueue('service.menu', options, {
        correlationId: uuid.v4(),
        replyTo: channelWrapper.replyTo
      })

      timer = setTimeout(() => respond([]), config.REQUEST_TIMEOUT)
    })
  }
}
