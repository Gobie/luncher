'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')
let helpers = require('../helpers')

module.exports = () => {
  let zo = zomato()

  let mapItem = (item) => {
    let title = _.trim(item.title)
    let amount = title.match(/\d+g/)
    return {
      item: title.replace(/\d+g |^\- */g, ''),
      price: _.trim(item.price),
      amount: amount ? amount[0] : '1ks'
    }
  }

  let noHeaders = (menu) => menu.price

  let processMenu = (obj, options, next) => {
    let out = []
    for (let i = 0; i < obj.menus.length; i++) {
      let menu = obj.menus[i]
      out.push({
        date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
        items: _.filter(_.map(menu.items, mapItem), noHeaders)
      })
    }

    next(null, out)
  }

  let url = 'https://www.zomato.com/cs/praha/u-z%C3%A1bransk%C3%BDch-karl%C3%ADn-praha-8/menu'

  return {
    middleware: zo.middleware(url, helpers.createProcessMenu(processMenu))
  }
}
