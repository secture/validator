// This test loads the JavaScript version of the validator
const assert = require('assert')

// Build first to make sure dist/index.js exists
require('../index')
const Validator = require('../dist/index').default

const validator = new Validator()

describe('Validator JS API', () => {
  it('should validate correctly from the JS version', () => {
    const data = {
      name: "pablo"
    }

    const rules = {
      name: "string"
    }

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should sanitize correctly from the JS version', () => {
    const data = {
      name: "  pablo  "
    }

    const rules = {
      name: "trim"
    }

    const sanitized = validator.sanitize(rules, data)
    assert.equal(sanitized.name, "pablo")
  })
})