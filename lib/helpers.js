'use strict'

var _ = require('lodash')
var moment = require('moment')

var handleOptions = function (wholeMenu, options) {
  var menu = wholeMenu
  if (options.date) {
    menu = _.find(menu, function (day) {
      if (day.date === options.date) {
        return true
      }
      if (options.next) {
        return moment(options.date).isBefore(day.date)
      }
      return false
    })
    menu = menu ? [menu] : []
  }

  return menu
}

var createProcessMenu = function (processMenu) {
  return function (options, res, next) {
    return function (err, obj) {
      if (err) {
        return next(err)
      }

      processMenu(obj, options, function (err, menu) {
        if (err) {
          return next(err)
        }

        res.menu = handleOptions(menu, options)
        next()
      })
    }
  }
}

module.exports = {
  createProcessMenu: createProcessMenu
}
