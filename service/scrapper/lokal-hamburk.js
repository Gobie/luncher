'use strict'

let _ = require('lodash')
let xray = require('x-ray')
let moment = require('moment')
let helpers = require('../helpers')

module.exports = () => {
  let x = xray()

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

    // only interested in Polévky (1), Lehká a bezmasá jídla (2), Speciality Lokálu (3), Hlavní jídla (4)
    for (let j = 1; j < 5; j++) {
      let lunchMenu = obj.menus[j].menu
      for (let i = 0; i < lunchMenu.length; i++) {
        if (!lunchMenu[i].item) continue // not interested in headers

        let item = {
          item: getItem(lunchMenu[i]),
          price: lunchMenu[i].price,
          amount: getAmount(lunchMenu[i])
        }
        if (item.item.match(/^Expres/)) {
          items.unshift(item) // Expres first
        } else {
          items.push(item)
        }
      }
    }

    let out = [{
      date: moment(obj.day.replace(/^\D+/, ''), 'D. M. YYYY').format('YYYY-MM-DD'),
      items
    }]

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
