'use strict'

var _ = require('lodash')
var moment = require('moment')

module.exports = {
  handleOptions: function (out, options) {
    if (options.date) {
      out = _.find(out, function (day) {
        if (day.date === options.date) {
          return true
        }
        if (options.next) {
          return moment(options.date).isBefore(day.date)
        }
        return false
      })
      out = out ? [out] : []
    }

    return out
  }
}
