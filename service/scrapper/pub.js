'use strict'

let _ = require('lodash')
let xray = require('x-ray')
let moment = require('moment')
let helpers = require('../helpers')

module.exports = () => {
  let x = xray()

  let processMenu = (obj, options, next) => {
    let out = []
    let currentDay = null
    let lunchMenu = obj.menus[0].menu
    for (let i = 0; i < lunchMenu.length; i++) {
      if (lunchMenu[i].day) {
        currentDay = {
          date: moment(lunchMenu[i].day.replace(/^.+,\s+/, ''), 'D. M. YYYY').format('YYYY-MM-DD'),
          items: []
        }
        out.push(currentDay)
      } else if (currentDay && lunchMenu[i].item) {
        currentDay.items.push({
          item: lunchMenu[i].item.replace(new RegExp(`^${lunchMenu[i].amount}`), ''),
          price: lunchMenu[i].price,
          amount: lunchMenu[i].amount
        })
      }
    }

    next(null, out)
  }

  let middleware = (req, res, next) => {
    let options = {}
    _.defaults(options, req.data, {
      url: 'http://www.thepub.cz/praha-8/poledni-menu/'
    })

    x(options.url, 'div.content', {
      menus: x('table.menu', [{
        menu: x('tr', [{
          day: 'h2',
          item: 'td.item',
          price: 'td.price',
          amount: 'td.item span.right'
        }])
      }])
    })(helpers.createProcessMenu(processMenu)(options, res, next))
  }

  return {middleware}
}
