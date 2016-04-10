'use strict'

let amqp = require('amqp-connection-manager')

let prepareMessage = (onMessage) => (msg) => onMessage(msg, JSON.parse(msg.content.toString()))

module.exports = (config, winston) => {
  if (!config.AMQP) throw new Error('AMQP config variable must be set')

  let options = {
    urls: [config.AMQP],
    verbose: Boolean(config.DEBUG),
    queuePrefix: config.NODE_ENV
  }

  let connection = amqp.connect(options.urls)

  connection.on('connect', () => winston.info('AMQP: connected to', options.queuePrefix))
  connection.on('disconnect', (params) => winston.info('AMQP: disconnected', params.err))

  let createChannel = (name, setup, verbose) => {
    let channelWrapper = connection.createChannel({name, json: true, setup})

    channelWrapper.on('error', (err) => winston.info('AMQP channel:', name, 'error', err))

    if (verbose) {
      channelWrapper.on('connect', () => winston.info('AMQP channel:', name, 'connected'))
      channelWrapper.on('close', () => winston.info('AMQP channel:', name, 'closed'))
    }

    return channelWrapper
  }

  let client = (onMessage) => {
    let channelWrapper = createChannel('client', (channel) => {
      return channel.assertQueue('', {exclusive: true, autoDelete: true}).then((q) => {
        channelWrapper.replyTo = q.queue
        return channel.consume(q.queue, prepareMessage(onMessage), {noAck: true})
      })
    }, options.verbose)

    let orgSendToQueue = channelWrapper.sendToQueue.bind(channelWrapper)
    channelWrapper.sendToQueue = (queueName, msg, opts, next) => {
      orgSendToQueue(`${options.queuePrefix}.${queueName}`, msg, opts, next)
    }

    return channelWrapper
  }

  let server = (queueName, onMessage) => {
    return createChannel('server', (channel) => {
      return channel.assertQueue(`${options.queuePrefix}.${queueName}`, {durable: false, expires: 60 * 1000}).then(() => {
        return channel.prefetch(1)
      }).then(() => {
        return channel.consume(`${options.queuePrefix}.${queueName}`, prepareMessage(onMessage), {noAck: true})
      })
    }, options.verbose)
  }

  return {client, server}
}
