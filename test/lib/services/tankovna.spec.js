'use strict'

var assert = require('assert')
var tankovna = require('../../../lib/services/tankovna')

describe('menu service: tankovna', function () {
  this.timeout(5 * 1000)

  it('can correctly parse lunch menu', function (done) {
    tankovna().execute({}, function (err, res) {
      assert.equal(err, null)
      assert(res)
      assert(res.menu)
      done()
    })
  })
})
