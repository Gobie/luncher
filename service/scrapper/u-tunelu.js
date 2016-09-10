'use strict'

let _ = require('lodash')
let zomato = require('../middleware/zomato')
let helpers = require('../helpers')

module.exports = () => {
  let zo = zomato()

  let processMenu = (obj, options, next) => {
    let out = []
    for (let i = 0; i < obj.menus.length; i++) {
      let menu = obj.menus[i]
      out.push({
        date: zo.parseDate(_.trim(menu.day)).format('YYYY-MM-DD'),
        items: _.map(menu.items, zo.mapItem)
      })
    }

    next(null, out)
  }

  let url = 'https://www.zomato.com/cs/praha/hostinec-u-tunelu-karl%C3%ADn-praha-8/menu'

  return {
    middleware: zo.middleware(url, helpers.createProcessMenu(processMenu))
  }
}
