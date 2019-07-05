
let ValidationException = function (param, message) {
  this.param = param
  this.message = message
}

class Validator
{
  /**
   * Returns an object with errors or null if nothing fails.
   */
  static validate (rules, object) {

    let copy = Object.assign({}, object)

    let errors = []

    for (let i in rules) {
      // special field
      if (i === '*') {
        continue
      }

      let requirement = rules[i]
      let property = object[i]

      let defaultValue = null

      let isRequired = true
      if (typeof requirement === 'object') {
        isRequired = false
        defaultValue = requirement[1]
        requirement = requirement[0]
      }

      if (typeof property === 'undefined') {
        if (isRequired) {
          errors.push([ i, `Validation Error: parameter '${i}' is a required field` ])
        }

        object[i] = defaultValue

      } else {
        if (typeof property !== requirement) {
          errors.push([
            i,
            `Validation Error: parameter '${i}' is waiting for a '${requirement}' argument but received a '${typeof property}'`
          ])
        }
      }

      delete copy[i]
    }

    if (rules['*'] === undefined) {
      let missingField = Object.keys(copy)[0]
      if (missingField !== undefined) {
        errors.push([
          missingField,
          `Validation Error: parameter '${missingField}' found but was not expected`
        ])
      }
    }

    if (errors.length === 0) {
      errors = null
    }

    return errors
  }

  static sanitize (rules, data) {
    throw new Error('not implemented yet')
  }
}

module.exports = Validator

