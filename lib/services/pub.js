'use strict'

module.exports = function () {
  var execute = function (data, next) {
    return next(null, {menu: 'nic zajimaveho'})
  }

  return {
    execute: execute
  }
}
