'use strict'

const moment = require('moment')

module.exports = (config, winston) => {
  const helpers = require('../helpers')(winston)
  const x = require('../../lib/xray')(config)

  const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle']

  const processMenu = (lines, options, next) => {
    winston.info('SERVICE: GLOBUS: processMenu started')

    lines = lines.split('\n').map(line => line.trim()).filter(Boolean)

    const menuByDays = {}
    let dayName = null

    for (const line of lines) {
      if (dayNames.includes(line)) {
        dayName = line
        continue
      }

      if (!menuByDays[dayName]) {
          menuByDays[dayName] = []
      }

      menuByDays[dayName].push(line)
    }

    const todayName = dayNames[moment().isoWeekday() - 1]
    const todayMenu = menuByDays[todayName]

    const out = []

    if (todayMenu) {
      const items = []

      for (const meal of todayMenu) {
        const match = meal.match(/(.*)\s+(\d+),-$/)
        if (match) {
          items.push({
            item: match[1].trim(),
            price: `${match[2]} Kč`,
            amount: '1ks'
          })
        } else {
          items.push({
            item: meal,
            price: 'N/A Kč',
            amount: '1ks'
          })
        }
      }

      out.push({
        date: moment().format('YYYY-MM-DD'),
        items
      })
    }

    winston.info('SERVICE: GLOBUS: processMenu finished')
    next(null, out)
  }

  const middleware = (req, res, next) => {
    winston.info('SERVICE: GLOBUS: started')
    let options = {}
    Object.assign(options, {
      url: 'http://restauraceglobus.cz/poledni-menu/'
    }, req.data)

    x(options.url, '.entry-content')(helpers.createProcessMenu(processMenu)(options, res, next))
  }

  return {middleware}
}
