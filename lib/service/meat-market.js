'use strict'

var _ = require('lodash')
var zomato = require('./middleware/zomato')
var helpers = require('../helpers')

module.exports = function () {
  var zo = zomato()

  var mapItem = function (item) {
    var title = _.trim(item.title)
    var amount = title.match(/\d+g/)
    title = title.replace(/\d+g |^\- */g, '')
    amount = amount ? amount[0] : '1ks'
    return {
      item: title,
      price: _.trim(item.price),
      amount: amount
    }
  }

  var filter = function (menu) {
    return !menu.item.match(/na tento týden|hlavní chod|polévky|^Dobrou chuť|^!!!/gi)
  }

  var processMenu = function (obj, options, next) {
    var out = []
    for (var i = 0; i < obj.menus.length; i++) {
      var menu = obj.menus[i]
      out.push({
        date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
        items: _.filter(_.map(menu.items, mapItem), filter)
      })
    }

    next(null, out)
  }

  var url = 'https://www.zomato.com/cs/praha/restaurace-u-san%C3%AD-karl%C3%ADn-praha-8/menu'

  return {
    middleware: zo.middleware(url, helpers.createProcessMenu(processMenu))
  }
}
