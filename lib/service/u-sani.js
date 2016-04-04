'use strict'

var _ = require('lodash')
var zomato = require('./middleware/zomato')
var helpers = require('../helpers')

module.exports = function () {
  var zo = zomato()

  var filter = function (item) {
    return Boolean(_.trim(item.price))
  }

  var processMenu = function (options, res, next) {
    return function (err, obj) {
      if (err) {
        return next(err)
      }

      var out = []
      for (var i = 0; i < obj.menus.length; i++) {
        var menu = obj.menus[i]
        out.push({
          date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
          items: _.map(_.filter(menu.items, filter), zo.mapItem)
        })
      }

      out = helpers.handleOptions(out, options)

      res.data = {menu: out}
      next()
    }
  }

  return {
    middleware: zo.middleware('https://www.zomato.com/cs/praha/restaurace-u-san%C3%AD-karl%C3%ADn-praha-8/menu', processMenu)
  }
}
