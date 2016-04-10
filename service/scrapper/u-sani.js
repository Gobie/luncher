'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')
let helpers = require('../helpers')

module.exports = () => {
  let zo = zomato()

  let withPrice = (item) => Boolean(_.trim(item.price))

  let processMenu = (obj, options, next) => {
    let out = []
    for (let i = 0; i < obj.menus.length; i++) {
      let menu = obj.menus[i]
      out.push({
        date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
        items: _.map(_.filter(menu.items, withPrice), zo.mapItem)
      })
    }

    next(null, out)
  }

  let url = 'https://www.zomato.com/cs/praha/restaurace-u-san%C3%AD-karl%C3%ADn-praha-8/menu'

  return {
    middleware: zo.middleware(url, helpers.createProcessMenu(processMenu))
  }
}
