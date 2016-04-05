'use strict'

var _ = require('lodash')
var xray = require('x-ray')
var moment = require('moment')
var helpers = require('../helpers')

module.exports = function () {
  var x = xray()

  var getItem = function (lunchMenuItem) {
    var item = lunchMenuItem.item.replace(lunchMenuItem.allergens, '')
    return _.trim(item)
      .replace(/\s+/g, ' ') // remove extra spacing
      .replace(/(,\s*)?\d+\s*g/, '') // remove amount from title
  }

  var getAmount = function (lunchMenuItem) {
    var m = lunchMenuItem.item.match(/\d+\s*g/) // get amount from title
    return m ? m[0] : '1ks'
  }

  var processMenu = function (obj, options, next) {
    var items = []

    // only interested in Polévky (1), Speciality Lokálu (2), Hlavní jídla (3)
    for (var j = 1; j < 4; j++) {
      var lunchMenu = obj.menus[j].menu
      for (var i = 0; i < lunchMenu.length; i++) {
        if (!lunchMenu[i].item) { // not interested in headers
          continue
        }

        items.push({
          item: getItem(lunchMenu[i]),
          price: lunchMenu[i].price,
          amount: getAmount(lunchMenu[i])
        })
      }
    }

    var out = [{
      date: moment(obj.day.replace(/^\D+/, ''), 'D. M. YYYY').format('YYYY-MM-DD'),
      items: items
    }]

    next(null, out)
  }

  var middleware = function (req, res, next) {
    var options = {}
    _.defaults(options, req.data, {
      url: 'http://lokal-hamburk.ambi.cz/cz/menu?id=11615'
    })

    x(options.url, 'div.menu', {
      day: 'h2',
      menus: x('table.menu-list', [{
        menu: x('tr', [{
          item: 'td.food',
          allergens: 'span.allergens',
          price: 'td:last-of-type'
        }])
      }])
    })(helpers.createProcessMenu(processMenu)(options, res, next))
  }

  return {
    middleware: middleware
  }
}
