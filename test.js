
const assert = require('assert')

const Validator = require('./index')

describe('Validator#validate', () => {

  it('should return true', () => {
    assert.equal(true, true)
  })

  it('should validate on simple structure', () => {
    let data = {
      name: "pablo"
    }

    let rules = {
      name: "string"
    }

    let error = Validator.validate(rules, data)

    assert.equal(error, null)
  })

  it('should not validate on simple wrong structure', () => {
    let data = {
      name: 35
    }

    let rules = {
      name: "string"
    }

    let errors = Validator.validate(rules, data)

    assert.equal(errors.length, 1)
    assert.equal(errors[0][0], 'name')
    assert.equal(errors[0][1], "Validation Error: parameter 'name' is waiting for a 'string' argument but received a 'number'")
  })

  it('should not validate when passing something not expected', () => {
    let data = {
      name: "pablo",
      unexpected: "thing"
    }

    let rules = {
      name: "string"
    }

    let errors = Validator.validate(rules, data)

    assert.equal(errors.length, 1)
    assert.equal(errors[0][0], 'unexpected')
    assert.equal(errors[0][1], "Validation Error: parameter 'unexpected' found but was not expected")
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

    let error = Validator.validate(rules, data)

    assert.equal(error, null)
  })

})



