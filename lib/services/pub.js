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
      var currentDay = null
      var nextDay = null
      var lunchMenu = res.menus[0].menu
      for (var i = 0; i < lunchMenu.length; i++) {
        if (lunchMenu[i].day) {
          currentDay = moment(lunchMenu[i].day.replace(/^.+,\s+/, ''), 'D. M. YYYY')
          if (date.isSame(currentDay) || (!nextDay && date.isBefore(currentDay))) {
            nextDay = currentDay
          }
          out[currentDay.format('YYYY-MM-DD')] = []
        } else if (lunchMenu[i].item) {
          out[currentDay.format('YYYY-MM-DD')].push({
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
      url: 'http://www.thepub.cz/praha-8/poledni-menu/',
      date: moment().format('YYYY-MM-DD')
    })

    x(options.url, 'div.content', {
      menus: x('table.menu', [{
        menu: x('tr', [{
          day: 'h2',
          item: 'td.item',
          price: 'td.price',
          amount: 'td.item span.right'
        }])
      }])
    })(processMenu(next, moment(options.date, 'YYYY-MM-DD')))
  }

  return {
    execute: execute
  }
}
