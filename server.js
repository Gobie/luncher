'use strict'

var config = require('./config.js')
var throng = require('throng')

function start(workerId) {
  var bus = require('./lib/bus')(config)
  var helmet = require('helmet')
  var compression = require('compression')
  var morgan = require('morgan')
  var express = require('express')
  var app = express()

  function onListen() {
    console.log('server worker', workerId, 'is listening on', config.PORT)
  }

  function errorHandler(err, req, res, next) {
    console.error(err.stack)

    if (res.headersSent) {
      return next(err)
    }

    res.status(500)
    res.send({error: err})
  }

  app
    .use(morgan(config.LOGGING))
    .use(compression())
    .use(helmet())
    .use('/api', require('./server/route/api/index')(express.Router(), bus, config))
    .get('/', require('./server/route/index')(bus, config))
    .use(errorHandler)
    .listen(config.PORT, onListen)
}

throng(start, {
  workers: config.WORKERS
})
