'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')

module.exports = (config, winston, serviceConfig) => {
  let helpers = require('../helpers')(winston)
  let zo = zomato(config)

  let noHeaders = (menu) => !menu.item.match(/hlavní chod|polévka:|polévka a hlavní chod|na tento týden/gi)

  let processMenu = (obj, options, next) => {
    let dailyMenus = obj.daily_menus
    let out = []
    for (let i = 0; i < dailyMenus.length; i++) {
      out.push({
        date: zo.parseDate(dailyMenus[i].start_date),
        items: _.filter(_.map(dailyMenus[i].daily_menu.dishes, zo.mapItem), noHeaders)
      })
    }

    next(null, out)
  }

  return {
    middleware: zo.middleware(serviceConfig.id, helpers.createProcessMenu(processMenu))
  }
}
