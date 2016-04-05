'use strict'

var _ = require('lodash')
var zomato = require('./middleware/zomato')
var helpers = require('../helpers')

module.exports = function () {
  var zo = zomato()

  var filter = function (item) {
    return Boolean(_.trim(item.price))
  }

  var processMenu = function (obj, options, next) {
    var out = []
    for (var i = 0; i < obj.menus.length; i++) {
      var menu = obj.menus[i]
      out.push({
        date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
        items: _.map(_.filter(menu.items, filter), zo.mapItem)
      })
    }

    next(null, out)
  }

  var url = 'https://www.zomato.com/cs/praha/restaurace-u-san%C3%AD-karl%C3%ADn-praha-8/menu'

  return {
    middleware: zo.middleware(url, helpers.createProcessMenu(processMenu))
  }
}
