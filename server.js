'use strict'

var throng = require('throng')

var WORKERS = process.env.WEB_CONCURRENCY || 1
var PORT = process.env.PORT || 3000
var REQUEST_TIMEOUT = 2000

throng(start, {
  workers: WORKERS
})

function start(workerId) {
  var bus = require('./lib/bus')()
  var helmet = require('helmet')
  var express = require('express')
  var app = express()

  app
    .use(helmet())
    .get('/', require('./lib/routes/index.js')(bus, REQUEST_TIMEOUT))
    .use(errorHandler)
    .listen(PORT, onListen)

  function onListen() {
    console.log('server worker', workerId, 'is listening on', PORT)
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
