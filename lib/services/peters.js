'use strict'

var _ = require('lodash')
var xray = require('x-ray')
var moment = require('moment')

module.exports = function () {
  var x = xray()

  var processMenu = function (next, date) {
    return function (err, res) {
      if (err) {
        console.error(err)
        return next(err)
      }

      var out = {}
      out[date] = []
      var nextDay = null
      var lunchMenu = res.menus[0].menu
      for (var i = 0; i < lunchMenu.length; i++) {
        if (lunchMenu[i].item) {
          out[date].push({
            item: lunchMenu[i].item.replace(new RegExp('^' + lunchMenu[i].amount), ''),
            price: lunchMenu[i].price,
            amount: lunchMenu[i].amount
          })
        }
      }

      setImmediate(function () {
        next(null, {menu: out, nextDay: nextDay ? nextDay.format('YYYY-MM-DD') : null})
      })
    }
  }

  var execute = function (options, next) {
    options = _.defaults(options, {
      url: 'https://www.zomato.com/cs/praha/peters-burger-pub-karl%C3%ADn-praha-8',
      date: moment().format('YYYY-MM-DD')
    })

    x(options.url, '#menu-preview', {
      menus: x('div.tmi-group', [{
        menu: x('div.tmi-daily', [{
          item: 'div.tmi-name',
          price: 'div.tmi-price'
        }])
      }])
    })(processMenu(next, moment().format('YYYY-MM-DD')))
  }

  return {
    execute: execute
  }
}
