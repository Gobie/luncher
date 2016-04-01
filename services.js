'use strict'

var config = require('./config.js')
var _ = require('lodash')
var spawn = require('node-spawn')

for (var i = 0; i < config.SERVICES.length; i++) {
  if (!config.SERVICES[i]) {
    continue
  }

  spawn({
    env: _.assign({}, process.env, {SERVICE_NAME: config.SERVICES[i]}),
    cmd: 'npm',
    args: ['run', 'service']
  }).forever()
}
