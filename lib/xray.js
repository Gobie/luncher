'use strict'

let xray = require('x-ray')
let driverBuilder = require('request-x-ray')

let driver = driverBuilder({
  jar: true,
  gzip: true,
  maxRedirects: 0,
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
    'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'accept-encoding':'gzip, deflate',
    'accept-language':'cs,en;q=0.8,en-US;q=0.6'
  }
})

let x = xray()
x.driver(driver)

module.exports = x
