'use strict'

let x = require('../../lib/xray')
let moment = require('moment')
let helpers = require('../helpers')

module.exports = () => {
  const DAY_NAMES = {
    '1': 'Pondělí',
    '2': 'Úterý',
    '3': 'Středa',
    '4': 'Čtvrtek',
    '5': 'Pátek',
    '6': 'Sobota',
    '7': 'Neděle'
  }

  let processMenu = (sections, options, next) => {
    let items = []

    const today = DAY_NAMES[moment().isoWeekday()]

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      if (!section.days.length) continue

      for (let j = 0; j < section.days.length; j++) {
        const dayName = section.days[j]
        if (dayName !== today) continue

        const dailySoup = section.soups[j]
        const dailyMenu = section.menu[j].split('\n').filter(Boolean)
        const dailyDessert = dailyMenu.pop()

        items.push({
          item: dailySoup,
          price: '35 Kč',
          amount: '1ks'
        })

        dailyMenu.forEach(menuItem => {
          items.push({
            item: menuItem,
            price: '128 Kč',
            amount: '1ks'
          })
        })

        items.push({
          item: dailyDessert,
          price: 'N/A Kč',
          amount: '1ks'
        })

        break
      }
    }
  
    let out = []

    if (items.length) {
      out.push({
        date: moment().format('YYYY-MM-DD'),
        items
      })
    }

    next(null, out)
  }

  let middleware = (req, res, next) => {
    let options = {}
    Object.assign(options, {
      url: 'http://restauraceglobus.cz/poledni-menu/'
    }, req.data)

    x(options.url, 'section .vc_column-inner > .wpb_wrapper', [{
      days: ['h2'],
      soups: ['p'],
      menu: ['ol', 'li']
    }])(helpers.createProcessMenu(processMenu)(options, res, next))
  }

  return {middleware}
}
