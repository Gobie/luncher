'use strict'

var _ = require('lodash')
var moment = require('moment')
var xray = require('x-ray')

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

  var monthReplace = function (replacer) {
    return map[replacer]
  }

  var parseDate = function (dateString) {
    dateString = dateString
      .replace(/^.+,\s+/, '')
      .replace(' (dnes)', '')
      .replace(new RegExp(_.keys(map).join('|')), monthReplace)
    return moment(dateString, 'D M')
  }

  var execute = function (url, processMenuFn) {
    return function (options, next) {
      options = _.defaults(options, {
        url: url,
        date: moment().format('YYYY-MM-DD')
      })

      x(options.url, '#menu-preview', {
        menus: x('div.tmi-group', [{
          day: 'div.tmi-group-name',
          items: x('div.tmi-daily', [{
            title: 'div.tmi-name',
            price: 'div.tmi-price'
          }])
        }])
      })(processMenuFn(next, moment(options.date, 'YYYY-MM-DD')))
    }
  }

  return {
    parseDate: parseDate,
    execute: execute
  }
}
