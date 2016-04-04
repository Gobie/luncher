'use strict'

var _ = require('lodash')
var moment = require('moment')
var xray = require('x-ray')

module.exports = function () {
  var x = xray()

  var monthMap = {
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

  var monthReplace = function (replacer) {
    return monthMap[replacer]
  }

  var parseDate = function (dateString) {
    dateString = dateString
      .replace(/^.+,\s+/, '')
      .replace(' (dnes)', '')
      .replace(new RegExp(_.keys(monthMap).join('|')), monthReplace)
    return moment(dateString, 'D M')
  }

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

  var middleware = function (url, processMenuFn) {
    return function (req, res, next) {
      var options = {}
      _.defaults(options, req.data, {
        url: url
      })

      x(options.url, '#menu-preview', {
        menus: x('div.tmi-group', [{
          day: 'div.tmi-group-name',
          items: x('div.tmi-daily', [{
            title: 'div.tmi-name',
            price: 'div.tmi-price'
          }])
        }])
      })(processMenuFn(options, res, next))
    }
  }

  return {
    parseDate: parseDate,
    mapItem: mapItem,
    middleware: middleware
  }
}
