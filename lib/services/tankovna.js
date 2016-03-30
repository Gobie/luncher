'use strict'

var _ = require('lodash')
var zomato = require('../zomato')

module.exports = function () {
  var zo = zomato()

  var mapItem = function (prices) {
    return function (item, index) {
      var title = _.trim(item.title).replace(/^\d\s*\|\s*/, '')
      var amount = title.match(/\d+g/)
      amount = amount ? amount[0] : '1ks'
      return {
        item: title,
        price: prices[index],
        amount: amount
      }
    }
  }

  var processMenu = function (next, date) {
    return function (err, res) {
      if (err) {
        console.error(err)
        return next(err)
      }
      var out = {}
      var currentDay = null
      var nextDay = null
      var menus = res.menus
      for (var i = 0; i < menus.length; i++) {
        var menu = menus[i]
        currentDay = zo.parseDate(_.trim(menu.day))
        if (date.isSame(currentDay) || (!nextDay && date.isBefore(currentDay))) {
          nextDay = currentDay
        }
        var prices = menu.items[0].title.replace(/\s+=\s+MENU\s+\d+\,\- /, '').match(/\d+\,\-Kč/g)
        out[currentDay.format('YYYY-MM-DD')] = _.map(_.slice(menu.items, 1), mapItem(prices))
      }

      setImmediate(function () {
        next(null, {menu: out, nextDay: nextDay ? nextDay.format('YYYY-MM-DD') : null})
      })
    }
  }

  var execute = zo.execute('https://www.zomato.com/cs/praha/tankovna-karl%C3%ADn-karl%C3%ADn-praha-8/menu', processMenu)

  return {
    execute: execute
  }
}
