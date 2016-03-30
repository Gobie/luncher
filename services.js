'use strict'

require('dotenv').config({silent: true})
var _ = require('lodash')
var spawn = require('node-spawn')

var services = (process.env.SERVICE_NAMES || '').split(',')
for (var i = 0; i < services.length; i++) {
  if (!services[i]) {
    continue
  }

  spawn({
    env: _.assign({}, process.env, {SERVICE_NAME: services[i]}),
    cmd: 'npm',
    args: ['run', 'service']
  }).forever()
}
