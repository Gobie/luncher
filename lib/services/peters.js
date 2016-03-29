'use strict'

var _ = require('lodash')
var xray = require('x-ray')
var moment = require('moment')

module.exports = function () {
  var x = xray()

  var map = {
    leden: '01',
    únor: '02',
    březen: '03',
    duben: '04',
    květen: '05',
    červen: '06',
    červenec: '07',
    srpen: '08',
    září: '09',
    říjen: '10',
    listopad: '11',
    prosinec: '12'
  }

  var parseDate = function (dateString) {
    return moment(dateString.replace(/^.+,\s+/, '').replace(' (dnes)', '').replace(new RegExp(_.keys(map).join('|')),
      function (replacer) {
        return map[replacer]
      }), 'D M')
  }

  var processMenu = function (next) {
    return function (err, res) {
      if (err) {
        console.error(err)
        return next(err)
      }
      var out = {}
      var menus = res.menus
      for (var i = 0; i < menus.length; i++) {
        var menu = menus[i]
        var currentDay = parseDate(_.trim(menu.day))
        var currentDayFormatted = currentDay.format('YYYY-MM-DD')
        out[currentDayFormatted] = []
        for (var j = 0; j < menu.items.length; j++) {
          var title = _.trim(menu.items[j].title)
          var amount = title.match(/\d+g/)
          amount = amount ? amount[0] : 1
          out[currentDayFormatted].push({
            item: title,
            price: _.trim(menu.items[j].price),
            amount: amount
          })
        }
      }

      setImmediate(function () {
        next(null, {menu: out, nextDay: null})
      })
    }
  }

  var execute = function (options, next) {
    options = _.defaults(options, {
      url: 'https://www.zomato.com/cs/praha/peters-burger-pub-karl%C3%ADn-praha-8/menu'
    })

    x(options.url, '#menu-preview', {
      menus: x('div.tmi-group', [{
        day: 'div.tmi-group-name',
        items: x('div.tmi-daily', [{
          title: 'div.tmi-name',
          price: 'div.tmi-price'
        }])
      }])
    })(processMenu(next))
  }

  return {
    execute: execute
  }
}
