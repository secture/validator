
class NotImplementedException extends Error
{
  constructor () {
    super()
    this.message = 'Not implemented yet!'
  }
}


class ValidationException
{
  constructor (param, message) {
    this.param = param
    this.message = message
  }
}

class Validator
{
  /**
   *
   * @param rule string
   * @param value mixed
   */
  static _validateField(rule, value, parameterName) {
    const errors = []

    let isRequired = true
    if (typeof value === 'undefined') {
      if (isRequired) {
        errors.push(new ValidationException(parameterName, `Validation Error: parameter '${parameterName}' is a required field`))
      }
    } else {
      if (typeof value !== rule) {
        errors.push(new ValidationException(
          parameterName,
          `Validation Error: parameter '${parameterName}' is waiting for a '${rule}' argument but received a '${typeof value}'`
        ))
      }
    }

    return errors
  }

  /**
   * Returns an object with errors or null if nothing fails.
   */
  static validate (rules, object, fieldPreffix) {

    if (! fieldPreffix) {
      fieldPreffix = ''
    }

    let copy = Object.assign({}, object)

    let errors = []

    for (let i in rules) {
      // special field
      if (i === '*') {
        continue
      }

      let rule = rules[i]
      let value = object[i]

      if (typeof rule === 'string') {
        let fieldErrors = this._validateField(rule, value, fieldPreffix + i)
        for (let j in fieldErrors) {
          errors.push(fieldErrors[j])
        }
      } else {
        throw new NotImplementedException()
      }

      delete copy[i]
    }

    if (rules['*'] === undefined) {
      let missingField = Object.keys(copy)[0]
      if (missingField !== undefined) {
        errors.push(new ValidationException(
          missingField,
          `Validation Error: parameter '${missingField}' found but was not expected`
        ))
      }
    }

    if (errors.length === 0) {
      errors = null
    }

    return errors
  }

  static sanitize (rules, data) {
    throw new NotImplementedException()
  }
}

module.exports = Validator

