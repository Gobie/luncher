'use strict'

var config = require('./config.js')
var throng = require('throng')

throng(start, {
  workers: config.WORKERS
})

function start(workerId) {
  var bus = require('./lib/bus')(config)
  var helmet = require('helmet')
  var compression = require('compression')
  var morgan = require('morgan')
  var express = require('express')
  var app = express()

  app
    .use(morgan(config.LOGGING))
    .use(compression())
    .use(helmet())
    .use('/api', require('./lib/routes/api/index')(express.Router(), bus, config))
    .get('/', require('./lib/routes/index')(bus, config))
    .use(errorHandler)
    .listen(config.PORT, onListen)

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
}
