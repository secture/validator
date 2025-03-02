import assert from 'assert'
import Validator from '../src'

const validator = new Validator()

describe('Validator#validate', () => {
  it('should validate on simple structure', () => {
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
  
  it('should not validate on simple wrong structure', () => {
    const data = {
      name: 35
    }

    const rules = {
      name: "string"
    }

    const errors = validator.validate(rules, data)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'name')
    assert.equal(errors[0].message, "Validation Error: parameter 'name' is waiting for a 'string' argument but received a 'number': 35")
  })

  it('should append all errors in the same structure', () => {
    const data = {
      a: 35,
      b: 35,
      c: 35
    }

    const rules = {
      a: "string",
      b: "string",
      c: "string"
    }

    const errors = validator.validate(rules, data)
    assert.equal(errors.length, 3)
    assert.equal(errors[0].param, 'a')
    assert.equal(errors[1].param, 'b')
    assert.equal(errors[2].param, 'c')
  })

  it('should append all errors in the same structure when not in rules', () => {
    const data = {
      a: 'menganito',
      b: 'juanito',
      c: 'jaimito'
    }

    const rules = {
      b: "string",
    }

    const errors = validator.validate(rules, data)
    assert.equal(errors.length, 2)
    assert.equal(errors[0].param, 'a')
    assert.equal(errors[1].param, 'c')
  })

  it('should validate on simple structure with unknown fields', () => {
    const data = {
      name: "pepito",
      somethin: 'maybe expected'
    }
    const rules = {
      name: 'string',
      '*': '*'
    }

    const errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  
  it('should not validate when passing something not expected', () => {
    const data = {
      name: "pablo",
      unexpected: "thing"
    }

    const rules = {
      name: "string"
    }

    const errors = validator.validate(rules, data)

    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'unexpected')
    assert.equal(errors[0].message, "Validation Error: parameter 'unexpected' found but was not expected")
  })

  it('should be recursive with objects', () => {
    const data = {
      level1: {
        level2: {
          level3: "something"
        }
      }
    }

    const rules = {
      level1: {
        level2: {
          level3: "string"
        }
      }
    }

    const errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  
  it('should be super recursive with objects', () => {
    const data = {
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

    const rules = {
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

    const errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  
  it('should be recursive with objects and fail if there are errors', () => {
    const data = {
      a: {
        b: {
          c: 35
        }
      }
    }

    const rules = {
      a: {
        b: {
          c: "string"
        }
      }
    }

    const errors = validator.validate(rules, data)

    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'a.b.c')
    // @todo pablo - validate message for the error
  })
  
  it('should be recursive with objects and fail if the structure does not match', () => {
    const data = {
      a: {
        b: {
          c: 'pepito'
        }
      }
    }

    const rules = {
      a: {
        x: {
          c: 'string'
        }
      }
    }

    const errors = validator.validate(rules, data)
    // a.b.c is not expected
    // a.x.c is not defined

    const expectedMessages = [
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
    const data = {
      a: [
        'alpha',
        'bravo',
        'charlie',
        'delta',
      ]
    }

    const rules = {
      a: [ 'string' ]
    }

    const errors = validator.validate(rules, data)
    assert.equal(errors.length, 0) 
  })

  it('should validate also array types and fail if it is wrong', () => {
    const data = {
      a: [
        'alpha',
        null,
        'charlie',
        'delta',
      ]
    }

    const rules = {
      a: [ 'string' ]
    }

    const errors = validator.validate(rules, data)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, 'a.1')
  })

  it('should validate simple data', () => {
    const data = 'something expected'
    const rules = 'string'

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  
  it('should validate simple data and fail', () => {
    const data: any[] = []
    const rules = 'string'

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    const expectedMessages = [
      "Validation Error: the default parameter is waiting for a 'string' argument but received a 'array': []",
    ]
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, '') // default === ''
    assert.equal(errors[0].message, expectedMessages[0])
  })
  
  it('should validate simple arrays', () => {
    const data = [ 'something', 'is', 'expected' ]
    const rules = [ 'string' ]

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  
  it('should validate simple arrays and fail', () => {
    const data = [ 'something', null, 'expected' ]
    const rules = [ 'string' ]

    const errors = validator.validate(rules, data)
    const expectedMessages = [
      "Validation Error: parameter '1' is waiting for a 'string' argument but received a 'null': null",
    ]
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, '1') // default === ''
    assert.equal(errors[0].message, expectedMessages[0])
  })
  
  it('should raise its hand if a wrong array config is provided', () => {
    const data = [ 'something', 'not', 'expected' ]
    const rules = [ 'string', 'object' ]

    try {
      const errors = validator.validate(rules, data)
      assert.fail()
    }
    catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }

      assert.equal(e.name, 'InvalidRulesException')
      assert.equal(e.message, 'InvalidRulesException: Invalid rule ["string","object"] in ')
    }
  })

  it('should validate simple wildcard', () => {
    const data = 'something expected'
    const rules = '*'

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should fail if no params are sent to validator', () => {
    try {
      const errors = validator.validate(undefined as any, {})
      assert.fail()
    }
    catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }

      assert.equal(e.name, 'InvalidRulesException')
      assert.equal(e.message, 'InvalidRulesException: Parameter rules cannot be undefined')
    }
  })
  
  it('should validate nulls', () => {
    const data = null
    const rules = 'null'

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })
  
  it('should validate nulls and fail', () => {
    const data = 35
    const rules = 'null'

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].param, '') // default
    assert.equal(errors[0].message, "Validation Error: the default parameter is waiting for a 'null' argument but received a 'number': 35")
  })

  it('should validate undefined values', () => {

    validator.addType('id', (a) => /^[0-9a-f]{24}$/.test(a))

    const data = {
    }
    const rules = {
      'user_id': 'id|undefined',
    }

    const errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)

    validator.removeType('id')
  })
  
  it('should validate undefined values with the ? syntax (provided)', () => {

    validator.addType('id', (a) => /^[0-9a-f]{24}$/.test(a))

    const data = {
      'user_id': '000000000000000000000000',
    }
    const rules = {
      'user_id': 'id?',
    }

    const errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)

    validator.removeType('id')
  })
  
  it('should validate undefined values with the ? syntax (undefined)', () => {

    validator.addType('id', (a) => /^[0-9a-f]{24}$/.test(a))

    const data = {
    }
    const rules = {
      'user_id': 'id?',
    }

    const errors = validator.validate(rules, data)

    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)

    validator.removeType('id')
  })

  it('should validate double types', () => {
    let data: any = 35
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
      validator.validate(null as any, 'mystring')
      assert.fail()
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }
      assert.equal(e.message, 'InvalidRulesException: Unknown type of rule: null')
    }
  })
  
  it('should validate a complex object with no types', () => {

    validator.clear()

    const data = {
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

    const rulesName = 'string'

    const rulesData = {
      contactId: 'string',
      name: 'string',
      surname: 'string',
      phone: 'string',
      location: 'string',
      isDependant: 'boolean',
      registeredAt: 'string',
    }

    const rulesStats = {
      createdAt: 'string',
      startedAt: 'string',
      endedAt: 'string',
      assigneeId: 'string',
    }

    const rulesExecutions = [
      { name: 'string', id: 'number' }
    ]

    const rules = {
      name: rulesName,
      data: rulesData,
      stats: rulesStats,
      executions: rulesExecutions,
    }

    const errors = validator.validate(rules, data)
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

    const data = {
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

    const rulesName = "string"

    const rulesData = {
      contactId: "id",
      name: "string",
      surname: "string",
      phone: "string",
      location: "string",
      isDependant: "boolean",
      registeredAt: "datetime",
    }

    const rulesStats = {
      createdAt: "datetime",
      startedAt: "datetime|null",
      endedAt: "datetime|null",
      assigneeId: "id",
    }

    const rules = {
      name: rulesName,
      data: rulesData,
      stats: rulesStats,
    }

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  describe('test wildcards', () => {

    it('should validate that the wilcard with a type does work', () => {

      const data = {
        'a': 1234,
        'b': 5678,
      }

      const rules = {
        '*': 'number'
      }

      const errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 0)
    })

    it('should validate that the wilcard with a wrong type does not work', () => {

      const data = {
        'a': 1234,
        'b': 5678,
      }

      const rules = {
        '*': 'string'
      }

      const errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 2)
    })


    it('should validate that the wilcard with a type and no elements does work', () => {

      const data = {
      }

      const rules = {
        '*': 'string'
      }

      const errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 0)
    })

    it.skip('should validate that an object is present and cannot be a string', () => {

      const data = {
        'a': 'string'
      }

      const rules = {
        a: {
        }
      }

      const errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 1)
    })

    it('should validate that an object is present and cannot be undefined', () => {

      const data = undefined
      const rules = { }

      const errors = validator.validate(rules, data)
      assert.equal(Array.isArray(errors), true)
      assert.equal(errors.length, 1)
    })

  })


  it('should validate functions inside an object', () => {

    const data = {
      "doSomething": () => {
      }
    }

    const rulesName = "string"

    const rules = {
      doSomething: 'function'
    }

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })


  it('should validate inline functions', () => {

    const data = {
      doSomething() {
      }
    }

    const rulesName = "string"

    const rules = {
      doSomething: 'function'
    }

    const errors = validator.validate(rules, data)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should validate functions in a class', () => {

    class MyClass {
      doSomething() {

      }
    }

    const myObject = new MyClass()

    const rulesName = "string"

    const rules = {
      doSomething: 'function'
    }

    const errors = validator.validate(rules, myObject)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })


  it('should accept a function as a validator and work', () => {

    const myValue = '#3941'

    const rules = (value: any) => {
      const errors = []

      if (typeof value !== 'string') {
        errors.push(`Invalid type for value (should be a string) ${typeof value}`)
      }

      if (typeof value === 'string' && !value.match(/^#[0-9]{4}$/)) {
        errors.push(`The value should be in the format #0000`)
      }

      return errors
    }

    const errors = validator.validate(rules, myValue)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 0)
  })

  it('should accept a function as a validator and fail if not string', () => {

    const myValue = { a: 'a' }

    const rules = (value: any) => {
      const errors = []

      if (typeof value !== 'string') {
        errors.push(`Invalid type for value (should be a string) ${typeof value}`)
      }

      if (typeof value === 'string' && !value.match(/^#[0-9]{4}$/)) {
        errors.push(`The value should be in the format #0000`)
      }

      return errors
    }

    const errors = validator.validate(rules, myValue)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1) // Should have 1 error since value is not a string
  })
  
  it('should accept a function as a validator and fail if wrong format', () => {

    const myValue = '#39d1'

    const rules = (value: any) => {
      const errors = []

      if (typeof value !== 'string') {
        errors.push(`Invalid type for value (should be a string) ${typeof value}`)
        return errors
      }

      if (typeof value === 'string' && !value.match(/^#[0-9]{4}$/)) {
        errors.push(`The value should be in the format #0000`)
      }

      return errors
    }

    const errors = validator.validate(rules, myValue)
    assert.equal(Array.isArray(errors), true)
    assert.equal(errors.length, 1)
    assert.equal(errors[0], 'The value should be in the format #0000')
  })

})

describe('Validator#assert', () => {
  it('should not throw an error on assert ok', () => {
    const data = 'something expected'
    const rules = 'string'

    validator.assert(rules, data)
  })
  
  it('should throw an error on assert failed', () => {
    const data = 35
    const rules = 'string'

    try {
      validator.assert(rules, data)
      assert.fail('Should have thrown an error')
    } catch (e) {
      // Success - error was thrown
    }
  })
})

describe('Validator#sanitize', () => {

  it('should sanitize a complex object', () => {

    const data = {
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

    const sanitization = {
      name: "emptyString",
      data: {
        name: "trim|firstCapitalCase",
        surname: "trim|firstCapitalCase",
        phone: "onlyNumbers",
        location: "emptyString",
      },
    }

    const sanitized = validator.sanitize(sanitization, data)

    assert.equal(sanitized.data.name, "Pablo")
    assert.equal(sanitized.data.surname, "López")
    assert.equal(sanitized.data.phone, "637412012")
    assert.equal(sanitized.data.location, "")
  })

  it('should not modify the provided object', () => {

    const data = {
      "name": "registered-contact",
      "data": {
        "name": "Pablo   ",
      }
    }

    const sanitization = {
      data: {
        name: (x: string) => x.trim()
      },
    }

    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.name, "Pablo")
    assert.equal(data.data.name, "Pablo   ")
  })

  it('should make sure that array is still an array', () => {

    const data = [
      "Pablo   ",
      "  LOPEZ ",
      " Torres ",
    ]

    const sanitization = [
      (x: string) => x.trim()
    ]

    const sanitized = validator.sanitize(sanitization, data)

    assert.equal(Array.isArray(data), true)
    assert.equal(Array.isArray(sanitized), true)
  })

  it('should not modify the provided array', () => {

    const data = [
      "Pablo   ",
      "  LOPEZ ",
      " Torres ",
    ]

    const sanitization = [
      (x: string) => x.trim()
    ]

    const sanitized = validator.sanitize(sanitization, data)

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
    const data = {
      "name": "registered-contact",
      "data": {
        "name": "Pablo   ",
      }
    }

    const sanitization = {
      data: {
        name: (x: string) => x.trim()
      },
    }

    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.name, "Pablo")
  })

  it('should remove all keys with an undefined value', () => {
    const data = {
      "name": "registered-contact",
      "data": {
        "contact_id": "000000000011111111112222",
      }
    }

    const sanitization = {
      name: "emptyString",
      data: {
        contactId: (x: string, o: any) => {
          return x ? x : o.data.contact_id
        },
        contact_id: (x: string, o: any) => {
          return undefined
        },
      },
    }

    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.contactId, '000000000011111111112222')
    assert.equal(sanitized.data.contact_id, undefined)
    assert.equal('contact_id' in sanitized.data, false)
  })

  it('should not change the original record', () => {
    const data = {
      "name": "registered-contact",
      "data": {
        "contact_id": "000000000011111111112222",
      }
    }

    const sanitization = {
      name: "emptyString",
      data: {
        contact_id: (x: string, o: any) => {
          return undefined
        },
        contactId: (x: string, o: any) => {
          return x ? x : o.data.contact_id
        },
      },
    }

    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized.data.contactId, '000000000011111111112222')
    assert.equal(sanitized.data.contact_id, undefined)
    assert.equal('contact_id' in sanitized.data, false)
  })
})

describe('Validator#sanitize toFloat', () => {
  it('should sanitize string to float', () => {
    const data = '35'
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 35)
  })
  
  it('should not sanitize 0', () => {
    const data = 0
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 0)
  })
  
  it('should sanitize string 0 to float', () => {
    const data = '0'
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 0)
  })
  
  it('should sanitize decimal to float', () => {
    const data = '0.5'
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, 0.5)
  })
  
  it('should return null if error', () => {
    const data = 'hey mi amigo'
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, null)
  })
  
  it('should return null if null', () => {
    const data = null
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, null)
  })
  
  it('should return null if object', () => {
    const data: any[] = []
    const sanitization = 'toFloat'
    const sanitized = validator.sanitize(sanitization, data)
    assert.equal(sanitized, null)
  })
})