'use strict'

let moment = require('moment')
let winston = require('winston')
let request = require('request')
let WebClient = require('@slack/client').WebClient
let config = require('../config')
let web = new WebClient(config.SLACK_API_TOKEN)

let isWeekend = () => {
  let weekDay = moment().day()
  return weekDay === 0 || weekDay === 6
}

let postMessageHandler = (err, info) => {
  if (err) return winston.error('SLACK: postMessage failed:', err)
  if (info && !info.ok) return winston.error('SLACK: invalid postMessage response:', info)
}

let prepareMessage = (json) => {
  let message = ''
  for (let i = 0; i < json.length; i++) {
    if (!json[i].menu[0]) continue

    message += `*${json[i].title}*\n`
    for (let j = 0; j < json[i].menu[0].items.length; j++) {
      let menuItem = json[i].menu[0].items[j]
      message += `- ${menuItem.item} (${menuItem.amount}) _${menuItem.price}_\n`
    }
    message += '\n'
  }

  return message
}

let only = (allowed) => (place) => allowed.indexOf(place.name) !== -1

// don't bother on weekends
if (isWeekend()) process.exit(0)

request(config.URL + 'api/next', (err, response, body) => {
  if (err) return winston.error('SLACK: request failed', err)

  let json = null
  try {
    json = JSON.parse(body)
  } catch (e) {
    return winston.error('SLACK: invalid JSON', e, body)
  }

  let options = {
    username: 'sbks-luncher'
  }

  for (let i = 0; i < config.NOTIFICATIONS.length; i++) {
    let menu = json.filter(only(config.NOTIFICATIONS[i].services))
    web.chat.postMessage(config.NOTIFICATIONS[i].user, prepareMessage(menu), options, postMessageHandler)
  }
})
