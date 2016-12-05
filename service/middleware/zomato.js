'use strict'

let _ = require('lodash')
let moment = require('moment')
let Request = require('request')

function makeDriver(opts) {
  let request
  if (typeof opts === "function") {
    request = opts
  } else {
    request = Request.defaults(opts)
  }

  return function driver(context, callback) {
    var url = context.url

    request(url, function(err, response, body) {
      return callback(err, body)
    })
  }
}

module.exports = (config) => {
  let request = makeDriver({
    method: 'GET',
    headers: {
      'user_key': config.ZOMATO_USER_KEY,
      'Accept': 'application/json'
    }
  });

  let parseDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD')
  }

  let mapItem = (item) => {
    item = item.dish
    let title = item.name.replace(/\s+/g, ' ')
    let amount = title.match(/\d+g/)
    let prices = item.name.match(/(\/?\d+,-)+/)
    let price = item.price || (prices && prices[0]) || 'N/A Kč'
    return {
      item: _.trim(title.replace(/\d+g |^\- */g, '').replace(price, '')),
      price: _.trim(price.replace(/,-/g, ' Kč')),
      amount: amount ? amount[0] : '1ks'
    }
  }

  let middleware = (id, processMenuFn) => {
    return (req, res, next) => {
      let options = {}
      Object.assign(options, {url: 'https://developers.zomato.com/api/v2.1/dailymenu?res_id=' + id}, req.data)

      let done = processMenuFn(options, res, next)
      request(options, (err, body) => {
        if (err) return done(err)
        try {
          let json = JSON.parse(body)
          if (json && json.status !== 'success') err = '[Request error]' + body
          done(err, json)
        } catch (e) {
          done(e)
        }
      })
    }
  }

  return {parseDate, mapItem, middleware}
}
