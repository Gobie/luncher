'use strict'

var _ = require('lodash')
var xray = require('x-ray')
var moment = require('moment')
var helpers = require('../helpers')

module.exports = function () {
  var x = xray()

  var processMenu = function (options, res, next) {
    return function (err, obj) {
      if (err) {
        return next(err)
      }

      var out = []
      var currentDay = null
      var lunchMenu = obj.menus[0].menu
      for (var i = 0; i < lunchMenu.length; i++) {
        if (lunchMenu[i].day) {
          currentDay = {
            date: moment(lunchMenu[i].day.replace(/^.+,\s+/, ''), 'D. M. YYYY').format('YYYY-MM-DD'),
            items: []
          }
          out.push(currentDay)
        } else if (currentDay && lunchMenu[i].item) {
          currentDay.items.push({
            item: lunchMenu[i].item.replace(new RegExp('^' + lunchMenu[i].amount), ''),
            price: lunchMenu[i].price,
            amount: lunchMenu[i].amount
          })
        }
      }

      out = helpers.handleOptions(out, options)

      res.data = {menu: out}
      next()
    }
  }

  var middleware = function (req, res, next) {
    var options = {}
    _.defaults(options, req.data, {
      url: 'http://www.thepub.cz/praha-8/poledni-menu/'
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
    })(processMenu(options, res, next))
  }

  return {
    middleware: middleware
  }
}
