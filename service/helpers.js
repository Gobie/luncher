'use strict'

let _ = require('lodash')
let moment = require('moment')

module.exports = (winston) => {
  let handleOptions = (wholeMenu, options) => {
    let menu = wholeMenu

    if (options.date) {
      menu = _.find(menu, (day) => {
        if (day.date === options.date) return true
        if (options.next) return moment(options.date).isBefore(day.date)
        return false
      })
      menu = menu ? [menu] : []
    }

    return menu
  }

  let createProcessMenu = (processMenu) => {
    return (options, res, next) => {
      winston.info('SERVICE: HELPER: created', options.url)
      return (err, obj) => {
        winston.info('SERVICE: HELPER: response accepted', options.url)
        if (err) winston.info('SERVICE: HELPER: response err', err)
        if (err) return next(err)

        processMenu(obj, options, (err, menu) => {
          if (err) return next(err)

          res.menu = handleOptions(menu, options)
          next()
        })
      }
    }
  }

  return {
    createProcessMenu
  }
}
