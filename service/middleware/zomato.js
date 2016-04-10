'use strict'

let _ = require('lodash')
let moment = require('moment')
let xray = require('x-ray')

module.exports = () => {
  let x = xray()

  let monthMap = {
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

  let monthReplace = (replacer) => monthMap[replacer]

  let parseDate = (dateString) => {
    let date = dateString
      .replace(/^.+,\s+/, '')
      .replace(' (dnes)', '')
      .replace(new RegExp(_.keys(monthMap).join('|')), monthReplace)
    return moment(date, 'D M')
  }

  let mapItem = (item) => {
    let title = _.trim(item.title).replace(/\s+/g, ' ')
    let amount = title.match(/\d+g/)
    return {
      item: title,
      price: _.trim(item.price),
      amount: amount ? amount[0] : '1ks'
    }
  }

  let middleware = (url, processMenuFn) => {
    return (req, res, next) => {
      let options = {}
      Object.assign(options, {url}, req.data)

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

  return {parseDate, mapItem, middleware}
}
