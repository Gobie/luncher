'use strict'

var _ = require('lodash')
var moment = require('moment')
var winston = require('winston')
var request = require('request')
var WebClient = require('@slack/client').WebClient
var config = require('../config')
var web = new WebClient(config.SLACK_API_TOKEN)

var isWeekend = function () {
  var weekDay = moment().day()
  return weekDay === 0 || weekDay === 6
}

var postMessageHandler = function (err, info) {
  if (err) {
    winston.error('SLACK: postMessage failed:', err)
    return
  }

  if (info && !info.ok) {
    winston.error('SLACK: invalid postMessage response:', info)
  }
}

var prepareMessage = function (json) {
  var message = ''
  for (var i = 0; i < json.length; i++) {
    if (!json[i].menu[0]) {
      continue
    }

    message += '*' + json[i].title + '*\n'
    for (var j = 0; j < json[i].menu[0].items.length; j++) {
      var menuItem = json[i].menu[0].items[j]
      message += '- ' + menuItem.item + ' (' + menuItem.amount + ') _' + menuItem.price + '_\n'
    }
    message += '\n'
  }

  return message
}

var sendMessage = function (user, message, options) {
  web.chat.postMessage(user, message, options, postMessageHandler)
}

var only = function (allowed) {
  return function (place) {
    return allowed.indexOf(place.name) !== -1
  }
}

// don't bother on weekends
if (isWeekend()) {
  process.exit(0)
}

request(config.URL + 'api/next', function (err, response, body) {
  if (err) {
    winston.error('SLACK: request failed', err)
    return
  }

  var json = null
  try {
    json = JSON.parse(body)
  } catch (e) {
    winston.error('SLACK: invalid JSON', e, body)
    return
  }

  var options = {
    username: 'sbks-luncher'
  }

  for (var i = 0; i < config.NOTIFICATIONS.length; i++) {
    var menu = _.filter(json, only(config.NOTIFICATIONS[i].services))
    sendMessage(config.NOTIFICATIONS[i].user, prepareMessage(menu), options)
  }
})
