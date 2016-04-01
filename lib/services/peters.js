'use strict'

var _ = require('lodash')
var zomato = require('../zomato')
var helpers = require('../helpers')

module.exports = function () {
  var zo = zomato()

  var mapItem = function (item) {
    var title = _.trim(item.title)
    var amount = title.match(/\d+g/)
    amount = amount ? amount[0] : '1ks'
    return {
      item: title,
      price: _.trim(item.price),
      amount: amount
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
        out.push({
          date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
          items: _.map(menu.items, mapItem)
        })
      }

      out = helpers.handleOptions(out, options)

      setImmediate(function () {
        next(null, {menu: out})
      })
    }
  }

  var execute = zo.execute('https://www.zomato.com/cs/praha/peters-burger-pub-karl%C3%ADn-praha-8/menu', processMenu)

  return {
    execute: execute
  }
}
