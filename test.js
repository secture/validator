
const assert = require('assert')

const Validator = require('./index')
const validator = new Validator()

describe('Validator#validate', () => {
  it('should validate on simple structure', () => {
    let data = {
      name: "pablo"
    }

    let rules = {
      name: "string"
    }

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should not validate on simple wrong structure', () => {
    let data = {
      name: 35
    }

    let rules = {
      name: "string"
    }

    let errors = validator.validate(rules, data)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'name')
    assert.equal(errors[0].message, "Validation Error: parameter 'name' is waiting for a 'string' argument but received a 'number'")
  })

  it('should validate on simple structure with unknown fields', () => {
    let data = {
      name: "pepito",
      somethin: 'maybe expected'
    }
    let rules = {
      name: 'string',
      '*': '*'
    }

    let errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should not validate when passing something not expected', () => {
    let data = {
      name: "pablo",
      unexpected: "thing"
    }

    let rules = {
      name: "string"
    }

    let errors = validator.validate(rules, data)

    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'unexpected')
    assert.equal(errors[0].message, "Validation Error: parameter 'unexpected' found but was not expected")
  })

  it('should be recursive with objects', () => {
    let data = {
      level1: {
        level2: {
          level3: "something"
        }
      }
    }

    let rules = {
      level1: {
        level2: {
          level3: "string"
        }
      }
    }

    let errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should be super recursive with objects', () => {
    let data = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: 'something'
              }
            }
          }
        }
      }
    }

    let rules = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: 'string'
              }
            }
          }
        }
      }
    }

    let errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should be recursive with objects and fail if there are errors', () => {
    let data = {
      a: {
        b: {
          c: 35
        }
      }
    }

    let rules = {
      a: {
        b: {
          c: "string"
        }
      }
    }

    let errors = validator.validate(rules, data)

    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'a.b.c')
    // @todo pablo - validate message for the error
  })
  it('should be recursive with objects and fail if the structure does not match', () => {
    let data = {
      a: {
        b: {
          c: 'pepito'
        }
      }
    }

    let rules = {
      a: {
        x: {
          c: 'string'
        }
      }
    }

    let errors = validator.validate(rules, data)
    // a.b.c is not expected
    // a.x.c is not defined

    let expectedMessages = [
      "Validation Error: parameter 'a.x.c' is a required field",
      "Validation Error: parameter 'a.b' found but was not expected",
    ]
    assert.equal(errors.length, 2)
    assert.equal(errors[0].message, expectedMessages[0])
    assert.equal(errors[1].message, expectedMessages[1])

  })

  it('should validate also array types', () => {
    let data = {
      a: [
        'alpha',
        'bravo',
        'charlie',
        'delta',
      ]
    }

    let rules = {
      a: [ 'string' ]
    }

    let errors = validator.validate(rules, data)
    assert.equal(errors.length, 0) 
  })

  it('should validate also array types and fail if it is wrong', () => {
    let data = {
      a: [
        'alpha',
        null,
        'charlie',
        'delta',
      ]
    }

    let rules = {
      a: [ 'string' ]
    }

    let errors = validator.validate(rules, data)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'a.1')
  })

  it('should validate simple data', () => {
    let data = 'something expected'
    let rules = 'string'

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should validate simple data and fail', () => {
    let data = []
    let rules = 'string'

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    let expectedMessages = [
      "Validation Error: the default parameter is waiting for a 'string' argument but received a 'array'",
    ]
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, '') // default === ''
    assert.equal(errors[0].message, expectedMessages[0])
  })
  it('should validate simple arrays', () => {
    let data = [ 'something', 'is', 'expected' ]
    let rules = [ 'string' ]

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should validate simple arrays and fail', () => {
    let data = [ 'something', null, 'expected' ]
    let rules = [ 'string' ]

    let errors = validator.validate(rules, data)
    let expectedMessages = [
      "Validation Error: parameter '1' is waiting for a 'string' argument but received a 'null'",
    ]
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, '1') // default === ''
    assert.equal(errors[0].message, expectedMessages[0])
  })
  it('should raise its hand if a wrong array config is provided', () => {
    let data = [ 'something', 'not', 'expected' ]
    let rules = [ 'string', 'object' ]

    try {
      let errors = validator.validate(rules, data)
      assert.fail()
    }
    catch (e) {
      if (e.name !== 'Error') {
        throw e
      }

      assert.equal(e.name, 'Error')
      assert.equal(e.message, 'Invalid rule ["string","object"] in ')
    }
  })


  it('should validate simple wildcard', () => {
    let data = 'something expected'
    let rules = '*'

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })


  it('should fail if no params are sent to validator', () => {
    try {
      let errors = validator.validate()
      assert.fail()
    }
    catch (e) {
      if (e.name !== 'Error') {
        throw e
      }

      assert.equal(e.name, 'Error')
      assert.equal(e.message, 'Parameter rules cannot be undefined')
    }
  })

  it('should validate nulls', () => {
    let data = null
    let rules = 'null'

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should validate nulls and fail', () => {
    let data = 35
    let rules = 'null'

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, '') // default
    assert.equal(errors[0].message, "Validation Error: the default parameter is waiting for a 'null' argument but received a 'number'")
  })

  it('should throw a schema exception if rules contains anything not understandable', () => {

    try {
      validator.validate(null, 'mystring')
      assert.fail()
    } catch (e) {
      if (e.name !== 'Error') {
        throw e
      }
      assert.equal(e.message, 'Unknown type of rule: null')
    }
  })

  it.skip('should validate a complex object', () => {

    let data = {
      "name": "registered-contact",
      "data": {
        "contactId": "000000000011111111112222",
        "name": "Pablo",
        "surname": "López",
        "phone": "+34637412012",
        "location": "Las Rozas, Madrid",
        "isDependant": false,
        "registeredAt": "2019-09-18 12:30:00",
      },
      "stats": {
        "createdAt": "2019-09-21 10:00:00",
        "startedAt": null,
        "endedAt": null,
        "assigneeId": "999999999988888888887777",
      },
    }

    let rulesName = "string"

    let rulesData = {
      contactId: "string",
      name: "string",
      surname: "string",
      phone: "string",
      location: "string",
      isDependant: "boolean",
      registeredAt: "date",
    }

    let rulesStats = {
      createdAt: "date",
      startedAt: "date|null",
      endedAt: "date|null",
      assigneeId: "string",
    }

    let rules = {
      name: rulesName,
      data: rulesData,
      stats: rulesStats,
    }

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
})

describe('Validator#sanitize', () => {
  it('should throw (temporarily) a not implemented exception for now', () => {
    try {
      validator.sanitize('string', 'mystring')
      assert.fail()
    }
    catch (e) {
      if (e.name !== 'Error') {
        throw e
      }
      assert.equal(e.name, 'Error')
      assert.equal(e.message, 'Not implemented yet!')
    }
  })
})



