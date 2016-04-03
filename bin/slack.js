'use strict'

var request = require('request')
var WebClient = require('@slack/client').WebClient
var config = require('../config')
var web = new WebClient(config.SLACK_API_TOKEN)

var postMessageHandler = function postMessage(err, info) {
  if (err) {
    console.log('Error:', err)
    return
  }

  if (info && !info.ok) {
    console.log('Slack error:', info.error)
  }
}

var prepareMessage = function (json) {
  var message = ''
  for (var i = 0; i < json.length; i++) {
    message += '*' + json[i].name + '*\n'
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

request('http://sbks-luncher.herokuapp.com/api/next', function (err, response, body) {
  if (err) {
    console.log('Error:', err)
    return
  }

  var json = null
  try {
    json = JSON.parse(body)
  } catch (e) {
    console.log('JSON error:', err)
    return
  }

  var message = prepareMessage(json)
  var options = {
    username: 'sbks-luncher'
  }

  sendMessage('@michal.brasna', message, options)
  sendMessage('@jan.pavlovsky', message, options)
})
