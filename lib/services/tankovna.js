'use strict'

var _ = require('lodash')
var zomato = require('../zomato')
var helpers = require('../helpers')

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

  var processMenu = function (next, options) {
    return function (err, res) {
      if (err) {
        return next(err)
      }

      var out = []
      for (var i = 0; i < res.menus.length; i++) {
        var menu = res.menus[i]
        var prices = menu.items[0].title.replace(/\s+=\s+MENU\s+\d+\,\- /, '').match(/\d+\,\-Kč/g)
        out.push({
          date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
          items: _.map(_.slice(menu.items, 1), mapItem(prices))
        })
      }

      out = helpers.handleOptions(out, options)

      setImmediate(function () {
        next(null, {menu: out})
      })
    }
  }

  var execute = zo.execute('https://www.zomato.com/cs/praha/tankovna-karl%C3%ADn-karl%C3%ADn-praha-8/menu', processMenu)

  return {
    execute: execute
  }
}
