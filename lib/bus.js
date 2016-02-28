'use strict'

if (!process.env.CLOUDAMQP_URL) {
  throw new Error('CLOUDAMQP_URL environment variable must be set')
}

var _ = require('lodash')

module.exports = function (options) {
  options = _.defaults(options, {
    urls: [process.env.CLOUDAMQP_URL],
    verbose: Boolean(process.env.DEBUG),
    queuePrefix: process.env.NODE_ENV || 'development'
  })

  var amqp = require('amqp-connection-manager')
  var connection = amqp.connect(options.urls)

  connection.on('connect', function () {
    console.log('AMQP: connected')
  })
  connection.on('disconnect', function (params) {
    console.log('AMQP: disconnected', params.err)
  })

  var prepareMessage = function (onMessage) {
    return function (msg) {
      return onMessage(msg, JSON.parse(msg.content.toString()))
    }
  }

  var createChannel = function (name, setup, verbose) {
    var channelWrapper = connection.createChannel({
      name: name,
      json: true,
      setup: setup
    })

    channelWrapper.on('error', function (err) {
      console.log('AMQP channel:', name, 'error', err)
    })

    if (verbose) {
      channelWrapper.on('connect', function () {
        console.log('AMQP channel:', name, 'connected')
      })
      channelWrapper.on('close', function () {
        console.log('AMQP channel:', name, 'closed')
      })
    }

    return channelWrapper
  }

  var client = function (onMessage) {
    var channelWrapper = createChannel('client', function (channel) {
      return channel.assertQueue('', {exclusive: true, autoDelete: true}).then(function (q) {
        channelWrapper.replyTo = q.queue
        return channel.consume(q.queue, prepareMessage(onMessage), {noAck: true})
      })
    }, options.verbose)

    var orgSendToQueue = channelWrapper.sendToQueue.bind(channelWrapper)
    channelWrapper.sendToQueue = function (queueName, msg, opts, next) {
      orgSendToQueue(options.queuePrefix + '.' + queueName, msg, opts, next)
    }

    return channelWrapper
  }

  var server = function (queueName, onMessage) {
    queueName = options.queuePrefix + '.' + queueName
    return createChannel('server', function (channel) {
      return channel.assertQueue(queueName, {durable: false, expires: 60 * 1000}).then(function () {
        return channel.prefetch(1)
      }).then(function () {
        return channel.consume(queueName, prepareMessage(onMessage), {noAck: true})
      })
    }, options.verbose)
  }

  return {
    client: client,
    server: server
  }
}
