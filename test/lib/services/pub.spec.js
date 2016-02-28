'use strict'

var assert = require('assert')
var pub = require('../../../lib/services/pub')

describe('menu service: pub', function () {
  this.timeout(5 * 1000)

  it('can correctly parse lunch menu', function (done) {
    pub().execute({}, function (err, res) {
      assert.equal(err, null)
      assert(res)
      assert(Object.keys(res.menu).length, 5)
      done()
    })
  })
})
