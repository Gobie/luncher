'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')
let helpers = require('../helpers')

module.exports = (config, serviceConfig) => {
  let zo = zomato(config)

  let processMenu = (obj, options, next) => {
    let dailyMenus = obj.daily_menus
    let out = []
    for (let i = 0; i < dailyMenus.length; i++) {
      let dishes = dailyMenus[i].daily_menu.dishes
      let matches = dishes[0].dish.name.match(/Polévka\s*(\d+).+?(MENU)\s*(\d+).+?(\d{2,}).+?(\d{2,}).+?(\d{2,}).+?(\d{2,})/i)
      if (matches && dishes && dishes.length === 6) {
        dishes[0].dish.name = matches[2]
        dishes[0].dish.price = matches[3] + ' Kč'
        dishes[1].dish.price = matches[1] + ' Kč'
        dishes[2].dish.price = matches[4] + ' Kč'
        dishes[3].dish.price = matches[5] + ' Kč'
        dishes[4].dish.price = matches[6] + ' Kč'
        dishes[5].dish.price = matches[7] + ' Kč'
      }

      out.push({
        date: zo.parseDate(dailyMenus[i].start_date),
        items: _.map(dishes, zo.mapItem)
      })
    }

    next(null, out)
  }

  return {
    middleware: zo.middleware(serviceConfig.id, helpers.createProcessMenu(processMenu))
  }
}
