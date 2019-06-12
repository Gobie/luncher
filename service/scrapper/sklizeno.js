'use strict'

const moment = require('moment')

module.exports = (config, winston) => {
  const helpers = require('../helpers')(winston)
  const x = require('../../lib/xray')(config)

  const dayNames = ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle']

  const processMenu = (pageData, options, next) => {
    winston.info('SERVICE: Sklizeno: processMenu started')

    const out = []
    const days = pageData && pageData[0] && pageData[0].days
    const menu = pageData && pageData[0] && pageData[0].menu

    if (!days || !menu) {
      winston.error('SERVICE: Sklizeno: menu not found')
      next(null, out)
      return
    }

    const todayName = dayNames[moment().isoWeekday() - 1]
    const todayMenuIndex = days.indexOf(todayName)

    const todayMenu = (menu[todayMenuIndex] || {}).day

    if (!todayMenu) {
      winston.error('SERVICE: Sklizeno: today menu not found')
      next(null, out)
      return
    }

    const items = []

    for (const {meal, price} of todayMenu) {
      items.push({
        item: meal,
        price,
        amount: '1ks'
      })
    }

    out.push({
      date: moment().format('YYYY-MM-DD'),
      items
    })

    winston.info('SERVICE: Sklizeno: processMenu finished')
    next(null, out)
  }

  const middleware = (req, res, next) => {
    winston.info('SERVICE: Sklizeno: started')
    let options = {}
    Object.assign(options, {
      url: 'https://www.sklizeno.cz/o-nas/my-food-corso/'
    }, req.data)

    x(options.url, '.dny', [{
      days: ['.top ul a'],
      menu: x('.jidla > div', [{
        day: x('li', [{
          meal: x('span'),
          price: x('small')
        }])
      }])
    }])(helpers.createProcessMenu(processMenu)(options, res, next))
  }

  return {middleware}
}
