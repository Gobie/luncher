'use strict'

let _ = require('lodash')
let async = require('async')
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

let onlySubscribed = (allowed) => (service) => allowed.indexOf(service.name) !== -1
let getTitle = (service) => service.title

let prepareMessage = (json, subscribedServices) => {
  let allServices = config.SERVICES
  let availableServices = _.map(_.reject(allServices, onlySubscribed(subscribedServices)), getTitle)
  let message = 'Other available restaurants: ' + availableServices.join(', ') + '\n\n'

  let jsonMenus = _.filter(json, onlySubscribed(subscribedServices))
  for (let i = 0; i < jsonMenus.length; i++) {
    message += `*${jsonMenus[i].title}*\n`

    if (!jsonMenus[i].menu[0]) {
      message += 'No menu was found today, check it out yourself and report bugs to @michal.brasna!\n'
    } else {
      for (let j = 0; j < jsonMenus[i].menu[0].items.length; j++) {
        let menuItem = jsonMenus[i].menu[0].items[j]
        message += `- ${menuItem.item} (${menuItem.amount}) _${menuItem.price}_\n`
      }
    }

    message += '\n'
  }

  return message
}

let notifyClients = (next) => {
  request(config.URL + 'api/next', (err, response, body) => {
    if (err) {
      winston.error('SLACK: request failed', err)
      return next(err)
    }

    let json = null
    try {
      json = JSON.parse(body)
      if (json && json.length === 1 && json[0].error) {
        winston.error('SLACK: failed to obtain menus', json[0].error)
        return next(json[0].error);
      }
    } catch (e) {
      winston.error('SLACK: invalid JSON', e, body, response.statusCode, response.statusMessage)
      return next(e)
    }

    let options = {
      username: 'sbks-luncher'
    }

    try {
      for (let i = 0; i < config.NOTIFICATIONS.length; i++) {
        let message = prepareMessage(json, config.NOTIFICATIONS[i].services)
        web.chat.postMessage(config.NOTIFICATIONS[i].user, message, options, postMessageHandler)
      }
    } catch (e) {
      winston.error('SLACK: failed preparing message', e, json)
      return next(e)
    }

    next()
  })
}

// don't bother on weekends
if (isWeekend()) process.exit(0)

// try it few times as heroku can be slow in spawning instances
async.retry(
  {times: 3, interval: 5000},
  notifyClients,
  (err) => {
    if (err) return winston.error('SLACK: failed to send messages', err)
    return winston.info('SLACK: all messages were sent')
  }
)
