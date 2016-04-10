'use strict'

let config = require('./config.js')
let throng = require('throng')

let start = (workerId) => {
  let helmet = require('helmet')
  let compression = require('compression')
  let morgan = require('morgan')
  let winston = require('winston')
  let express = require('express')
  let app = express()
  let bus = require('./lib/bus')(config, winston)

  let onListen = () => winston.info('SERVER: worker', workerId, 'is listening on', config.PORT)

  let errorHandler = (err, req, res, next) => {
    winston.error('SERVER: error', err.stack)

    if (res.headersSent) return next(err)

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

throng({
  workers: config.WORKERS
}, start)
