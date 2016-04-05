'use strict'

var _ = require('lodash')
var spawn = require('node-spawn')
var config = require('./config.js')

var logger = function (serviceName, type) {
  return function (data) {
    console.log('[' + serviceName + '] ' + type + ':', data.toString())
  }
}

for (var i = 0; i < config.SERVICES.length; i++) {
  spawn({
    env: _.assign({}, process.env, {SERVICE_NAME: config.SERVICES[i].name}),
    cmd: 'npm',
    args: ['run', 'service'],
    onStdout: logger(config.SERVICES[i].name, 'stdout'),
    onStderr: logger(config.SERVICES[i].name, 'stderr')
  }).forever()
}
