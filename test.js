
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
    assert.equal(errors[0].message, "Validation Error: parameter 'name' is waiting for a 'string' argument but received a 'number': 35")
  })

  it('should append all errors in the same structure', () => {
    let data = {
      a: 35,
      b: 35,
      c: 35
    }

    let rules = {
      a: "string",
      b: "string",
      c: "string"
    }

    let errors = validator.validate(rules, data)
    assert.equal(errors.length, 3)
    assert.equal(errors[0].param, 'a')
    assert.equal(errors[1].param, 'b')
    assert.equal(errors[2].param, 'c')
  })

  it('should append all errors in the same structure when not in rules', () => {
    let data = {
      a: 'menganito',
      b: 'juanito',
      c: 'jaimito'
    }

    let rules = {
      b: "string",
    }

    let errors = validator.validate(rules, data)
    assert.equal(errors.length, 2)
    assert.equal(errors[0].param, 'a')
    assert.equal(errors[1].param, 'c')
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
      "Validation Error: parameter 'a.x' should be an object",
      "Validation Error: parameter 'a.x.c' is a required field",
      "Validation Error: parameter 'a.b' found but was not expected",
    ]
    assert.equal(errors.length, 3)
    assert.equal(errors[0].message, expectedMessages[0])
    assert.equal(errors[1].message, expectedMessages[1])
    assert.equal(errors[2].message, expectedMessages[2])
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
      "Validation Error: the default parameter is waiting for a 'string' argument but received a 'array': []",
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
      "Validation Error: parameter '1' is waiting for a 'string' argument but received a 'null': null",
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
      assert.equal(e.message, 'InvalidRulesException: Invalid rule ["string","object"] in ')
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
      assert.equal(e.message, 'InvalidRulesException: Parameter rules cannot be undefined')
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
    assert.equal(errors[0].message, "Validation Error: the default parameter is waiting for a 'null' argument but received a 'number': 35")
  })

  it('should validate undefined values', () => {

    validator.addType('id', (a) => /^[0-9a-f]{24}$/.test(a))

    let data = {
    }
    let rules = {
      'user_id': 'id|undefined',
    }

    let errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)

    validator.removeType('id')
  })
  it('should validate undefined values with the ? syntax (provided)', () => {

    validator.addType('id', (a) => /^[0-9a-f]{24}$/.test(a))

    let data = {
      'user_id': '000000000000000000000000',
    }
    let rules = {
      'user_id': 'id?',
    }

    let errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)

    validator.removeType('id')
  })
  it('should validate undefined values with the ? syntax (undefined)', () => {

    validator.addType('id', (a) => /^[0-9a-f]{24}$/.test(a))

    let data = {
    }
    let rules = {
      'user_id': 'id?',
    }

    let errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)

    validator.removeType('id')
  })

  it('should validate double types', () => {
    let data = 35
    let rules = 'string|number|null'

    let errors = validator.validate(rules, data)
    assert.equal(errors.length, 0)

    data = '35'
    errors = validator.validate(rules, data)
    assert.equal(errors.length, 0)

    data = null
    errors = validator.validate(rules, data)
    assert.equal(errors.length, 0)
  })
  it('should throw a schema exception if rules contains anything not understandable', () => {
    try {
      validator.validate(null, 'mystring')
      assert.fail()
    } catch (e) {
      if (e.name !== 'Error') {
        throw e
      }
      assert.equal(e.message, 'InvalidRulesException: Unknown type of rule: null')
    }
  })
  it('should validate a complex object with no types', () => {

    validator.clear()

    let data = {
      'name': 'registered-contact',
      'data': {
        'contactId': '000000000011111111112222',
        'name': 'Pablo',
        'surname': 'López',
        'phone': '+34637412012',
        'location': 'Las Rozas, Madrid',
        'isDependant': false,
        'registeredAt': '2019-09-18 12:30:00',
      },
      'stats': {
        'createdAt': '2019-09-21 10:00:00',
        'startedAt': '',
        'endedAt': '',
        'assigneeId': '999999999988888888887777',
      },
      'executions': [
        { 'name': 'executed-1', 'id': 31 },
        { 'name': 'executed-2', 'id': 32 },
        { 'name': 'executed-3', 'id': 33 },
        { 'name': 'executed-4', 'id': 34 },
        { 'name': 'executed-5', 'id': 35 },
        { 'name': 'executed-6', 'id': 36 },
      ]
    }

    let rulesName = 'string'

    let rulesData = {
      contactId: 'string',
      name: 'string',
      surname: 'string',
      phone: 'string',
      location: 'string',
      isDependant: 'boolean',
      registeredAt: 'string',
    }

    let rulesStats = {
      createdAt: 'string',
      startedAt: 'string',
      endedAt: 'string',
      assigneeId: 'string',
    }

    let rulesExecutions = [
      { name: 'string', id: 'number' }
    ]

    let rules = {
      name: rulesName,
      data: rulesData,
      stats: rulesStats,
      executions: rulesExecutions,
    }

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should validate a complex object', () => {

    validator.addType(
      'datetime',
      (a) => /^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(a)
    )

    validator.addType(
      'id',
      (a) => /^[0-9a-f]{24}$/.test(a)
    )

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
      contactId: "id",
      name: "string",
      surname: "string",
      phone: "string",
      location: "string",
      isDependant: "boolean",
      registeredAt: "datetime",
    }

    let rulesStats = {
      createdAt: "datetime",
      startedAt: "datetime|null",
      endedAt: "datetime|null",
      assigneeId: "id",
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

  describe('test wildcards', () => {

    it('should validate that the wilcard with a type does work', () => {

      let data = {
        'a': 1234,
        'b': 5678,
      }

      let rules = {
        '*': 'number'
      }

      let errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 0)
    })

    it('should validate that the wilcard with a wrong type does not work', () => {

      let data = {
        'a': 1234,
        'b': 5678,
      }

      let rules = {
        '*': 'string'
      }

      let errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 2)
    })


    it('should validate that the wilcard with a type and no elements does work', () => {

      let data = {
      }

      let rules = {
        '*': 'string'
      }

      let errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 0)
    })

    it.skip('should validate that an object is present and cannot be a string', () => {

      let data = {
        'a': 'string'
      }

      let rules = {
        a: {
        }
      }

      let errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 1)
    })

    it('should validate that an object is present and cannot be undefined', () => {

      let data = undefined
      let rules = { }

      let errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 1)
    })

  })


  it('should validate functions inside an object', () => {

    let data = {
      "doSomething": () => {
      }
    }

    let rulesName = "string"

    let rules = {
      doSomething: 'function'
    }

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })


  it('should validate inline functions', () => {

    let data = {
      doSomething () {
      }
    }

    let rulesName = "string"

    let rules = {
      doSomething: 'function'
    }

    let errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should validate functions in a class', () => {

    class MyClass {
      doSomething () {

      }
    }

    let myObject = new MyClass()

    let rulesName = "string"

    let rules = {
      doSomething: 'function'
    }

    let errors = validator.validate(rules, myObject)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })


  it('should accept a function as a validator and work', () => {

    let myValue = '#3941'

    let rules = (value) => {
      let errors = []

      if (! typeof value === 'string') {
        errors.push(`Invalid type for value (should be a string) ${typeof value}`)
      }

      if (typeof value === 'string' && ! value.match(/^#[0-9]{4}$/)) {
        errors.push(`The value should be in the format #0000`)
      }

      return errors
    }

    let errors = validator.validate(rules, myValue)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should accept a function as a validator and fail if not string', () => {

    let myValue = { a: 'a' }

    let rules = (value) => {
      let errors = []

      if (! typeof value === 'string') {
        errors.push(`Invalid type for value (should be a string) ${typeof value}`)
      }

      if (typeof value === 'string' && ! value.match(/^#[0-9]{4}$/)) {
        errors.push(`The value should be in the format #0000`)
      }

      return errors
    }

    let errors = validator.validate(rules, myValue)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  it('should accept a function as a validator and fail if wrong format', () => {

    let myValue = '#39d1'

    let rules = (value) => {
      let errors = []

      if (! typeof value === 'string') {
        errors.push(`Invalid type for value (should be a string) ${typeof value}`)
        return errors
      }

      if (typeof value === 'string' && ! value.match(/^#[0-9]{4}$/)) {
        errors.push(`The value should be in the format #0000`)
      }

      return errors
    }

    let errors = validator.validate(rules, myValue)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1)
    assert.equal(errors[0], 'The value should be in the format #0000')
  })

})

describe('Validator#assert', () => {
  it('should not throw an error on assert ok', () => {
    let data = 'something expected'
    let rules = 'string'

    validator.assert(rules, data)
  })
  it('should throw an error on assert failed', async (done) => {
    let data = 35
    let rules = 'string'

    try {
      validator.assert(rules, data)
    } catch (e) {
      done()
    }
  })
})

describe('Validator#sanitize', () => {

  it('should sanitize a complex object', () => {

    let data = {
      "name": "registered-contact",
      "data": {
        "contactId": "000000000011111111112222",
        "name": "Pablo   ",
        "surname": "lópez ",
        "phone": "637 41-20-12",
        "isDependant": false,
        "registeredAt": "2019-09-18 12:30:00",
      }
    }

    let sanitization = {
      name: "emptyString",
      data: {
        name: "trim|firstCapitalCase",
        surname: "trim|firstCapitalCase",
        phone: "onlyNumbers",
        location: "emptyString",
      },
    }

    let sanitized = validator.sanitize(sanitization, data)

    assert.equal(sanitized.data.name, "Pablo")
    assert.equal(sanitized.data.surname, "López")
    assert.equal(sanitized.data.phone, "637412012")
    assert.equal(sanitized.data.location, "")
  })

  it('should not modify the provided object', () => {

    let data = {
      "name": "registered-contact",
      "data": {
        "name": "Pablo   ",
      }
    }

    let sanitization = {
      data: {
        name: x => x.trim()
      },
    }

    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.name, "Pablo")
    assert.equal(data.data.name, "Pablo   ")
  })

  it('should make sure that array is still an array', () => {

    let data = [
      "Pablo   ",
      "  LOPEZ ",
      " Torres ",
    ]

    let sanitization = [
      x => x.trim()
    ]

    let sanitized = validator.sanitize(sanitization, data)

    assert.equal(Array.isArray(data), true)
    assert.equal(Array.isArray(sanitized), true)
  })

  it('should not modify the provided array', () => {

    let data = [
      "Pablo   ",
      "  LOPEZ ",
      " Torres ",
    ]

    let sanitization = [
      x => x.trim()
    ]

    let sanitized = validator.sanitize(sanitization, data)

    assert.equal(sanitized[0], "Pablo")
    assert.equal(sanitized[1], "LOPEZ")
    assert.equal(sanitized[2], "Torres")

    assert.equal(Array.isArray(sanitized), true)

    assert.equal(data[0], "Pablo   ")
    assert.equal(data[1], "  LOPEZ ")
    assert.equal(data[2], " Torres ")

    assert.equal(Array.isArray(data), true)

  })

  it('should allow a function for sanitization', () => {
    let data = {
      "name": "registered-contact",
      "data": {
        "name": "Pablo   ",
      }
    }

    let sanitization = {
      data: {
        name: x => x.trim()
      },
    }

    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.name, "Pablo")
  })

  it('should remove all keys with an undefined value', () => {
    let data = {
      "name": "registered-contact",
      "data": {
        "contact_id": "000000000011111111112222",
      }
    }

    let sanitization = {
      name: "emptyString",
      data: {
        contactId: (x, o) => {
          return x ? x : o.data.contact_id
        },
        contact_id: (x, o) => {
          return undefined
        },
      },
    }

    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.contactId, '000000000011111111112222')
    assert.equal(sanitized.data.contact_id, undefined)
    assert.equal('contact_id' in sanitized.data, false)
  })

  it('should not change the original record', () => {
    let data = {
      "name": "registered-contact",
      "data": {
        "contact_id": "000000000011111111112222",
      }
    }

    let sanitization = {
      name: "emptyString",
      data: {
        contact_id: (x, o) => {
          return undefined
        },
        contactId: (x, o) => {
          return x ? x : o.data.contact_id
        },
      },
    }

    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.contactId, '000000000011111111112222')
    assert.equal(sanitized.data.contact_id, undefined)
    assert.equal('contact_id' in sanitized.data, false)
  })
})

describe('Validator#sanitize toFloat', () => {
  it('should sanitize string to float', () => {
    let data = '35'
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 35)
  })
  it('should not sanitize 0', () => {
    let data = 0
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 0)
  })
  it('should sanitize string 0 to float', () => {
    let data = '0'
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 0)
  })
  it('should sanitize decimal to float', () => {
    let data = '0.5'
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 0.5)
  })
  it('should return null if error', () => {
    let data = 'hey mi amigo'
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, null)
  })
  it('should return null if null', () => {
    let data = null
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, null)
  })
  it('should return null if object', () => {
    let data = []
    let sanitization = 'toFloat'
    let sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, null)
  })
})



