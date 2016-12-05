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
      out.push({
        date: zo.parseDate(dailyMenus[i].start_date),
        items: _.map(dailyMenus[i].daily_menu.dishes, zo.mapItem)
      })
    }

    next(null, out)
  }

  return {
    middleware: zo.middleware(serviceConfig.id, helpers.createProcessMenu(processMenu))
  }
}
