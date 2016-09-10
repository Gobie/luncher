'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')
let helpers = require('../helpers')

module.exports = () => {
  let zo = zomato()

  let mapItem = (prices) => (item, index) => {
    let title = _.trim(item.title).replace(/^\d\s*\|\s*/, '')
    let amount = title.match(/\d+g/)
    return {
      item: title,
      price: prices[index] || 'N/A Kč',
      amount: amount ? amount[0] : '1ks'
    }
  }

  let processMenu = (obj, options, next) => {
    let out = []
    for (let i = 0; i < obj.menus.length; i++) {
      let menu = obj.menus[i]
      let prices = menu.items[0].title.replace(/\s+=\s+MENU\s+\d+\,\- /, '').match(/\d+\,\-Kč/g)
      out.push({
        date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
        items: _.map(_.slice(menu.items, 1), mapItem(prices))
      })
    }

    next(null, out)
  }

  let url = 'https://www.zomato.com/cs/praha/tankovna-karl%C3%ADn-karl%C3%ADn-praha-8/menu'

  return {
    middleware: zo.middleware(url, helpers.createProcessMenu(processMenu))
  }
}
