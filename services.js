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
  if (!config.SERVICES[i]) {
    continue
  }

  spawn({
    env: _.assign({}, process.env, {SERVICE_NAME: config.SERVICES[i]}),
    cmd: 'npm',
    args: ['run', 'service'],
    onStdout: logger(config.SERVICES[i], 'stdout'),
    onStderr: logger(config.SERVICES[i], 'stderr')
  }).forever()
}
