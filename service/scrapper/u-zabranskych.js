'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')

module.exports = (config, winston, serviceConfig) => {
  let helpers = require('../helpers')(winston)
  let zo = zomato(config)

  let withPrice = (item) => Boolean(_.trim(item.dish.price))

  let processMenu = (obj, options, next) => {
    let dailyMenus = obj.daily_menus
    let out = []
    for (let i = 0; i < dailyMenus.length; i++) {
      out.push({
        date: zo.parseDate(dailyMenus[i].start_date),
        items: _.map(_.filter(dailyMenus[i].daily_menu.dishes, withPrice), zo.mapItem)
      })
    }

    next(null, out)
  }

  return {
    middleware: zo.middleware(serviceConfig.id, helpers.createProcessMenu(processMenu))
  }
}
