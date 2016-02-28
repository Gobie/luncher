'use strict'

var assert = require('assert')
var pub = require('../../../lib/services/pub')

describe('menu service: pub', function () {
  it('executes', function (done) {
    var pubInstance = pub()
    pubInstance.execute({}, function (err, res) {
      assert.equal(err, null)
      assert.deepEqual(res, {menu: 'nic zajimaveho'})
      done()
    })
  })
})
