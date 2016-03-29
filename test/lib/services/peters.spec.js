'use strict'

var assert = require('assert')
var peters = require('../../../lib/services/peters')

describe('menu service: peters', function () {
  this.timeout(5 * 1000)

  it('can correctly parse lunch menu', function (done) {
    peters().execute({}, function (err, res) {
      assert.equal(err, null)
      assert(res)
      assert(Object.keys(res.menu).length, 1)
      done()
    })
  })
})
