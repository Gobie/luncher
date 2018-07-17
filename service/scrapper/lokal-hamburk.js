'use strict'

let _ = require('lodash')
let moment = require('moment')
let helpers = require('../helpers')

module.exports = (config) => {
  let x = require('../../lib/xray')(config)

  let getItem = (lunchMenuItem) => {
    let item = lunchMenuItem.item.replace(lunchMenuItem.allergens, '')
    return _.trim(item)
      .replace(/\s+/g, ' ') // remove extra spacing
      .replace(/(,\s*)?\d+\s*g/, '') // remove amount from title
  }

  let getAmount = (lunchMenuItem) => {
    let m = lunchMenuItem.item.match(/\d+\s*g/) // get amount from title
    return m ? m[0] : '1ks'
  }

  let processMenu = (obj, options, next) => {
    let items = []

    for (let j = 0; j < obj.menus.length; j++) {
      let section = obj.menus[j]
      if (section.name !== 'Polévky' && section.name !== 'Hlavní jídla') continue // only in these sections we are interested

      for (let i = 0; i < section.menu.length; i++) {
        if (!section.menu[i].item) continue // not interested in headers

        let item = {
          item: getItem(section.menu[i]),
          price: section.menu[i].price,
          amount: getAmount(section.menu[i])
        }
        if (item.item.match(/^Expres/)) {
          items.unshift(item) // Express first
        } else {
          items.push(item)
        }
      }
    }

    let out = []

    if (obj.day) {
      out.push({
        date: moment(obj.day.replace(/^\D+/, ''), 'D. M. YYYY').format('YYYY-MM-DD'),
        items
      })
    }

    next(null, out)
  }

  let middleware = (req, res, next) => {
    let options = {}
    Object.assign(options, {
      url: 'http://lokal-hamburk.ambi.cz/cz/menu?id=11615'
    }, req.data)

    x(options.url, 'div.menu', {
      day: 'h2',
      menus: x('table.menu-list', [{
        name: 'h2',
        menu: x('tr', [{
          item: 'td.food',
          allergens: 'span.allergens',
          price: 'td:last-of-type'
        }])
      }])
    })(helpers.createProcessMenu(processMenu)(options, res, next))
  }

  return {middleware}
}
