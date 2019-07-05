
const { NotImplementedException, ValidationException } = require('./lib/exceptions')


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
  static validate (rules, original, fieldPreffix) {

    if (! fieldPreffix) {
      fieldPreffix = ''
    }

    if (fieldPreffix !== '') {
      fieldPreffix += '.'
    }

    if (rules === undefined) {
      throw new Error(`Parameter rules cannot be undefined`)
    }

    const copy = Object.assign({}, original)

    const errors = []

    for (let i in rules) {
      // special field
      if (i === '*') {
        continue
      }

      let rule = rules[i]
      let value = copy[i]

      let type = typeof rule

      let fieldErrors = []

      switch (type) {
      case 'string':
        fieldErrors = this._validateField(rule, value, fieldPreffix + i)
        break;
      case 'object':
        fieldErrors = this.validate(rule, value, fieldPreffix + i)
        break;
      default:
        throw new NotImplementedException()
        break;
      }

      for (let j in fieldErrors) {
        errors.push(fieldErrors[j])
      }

      delete copy[i]
    }

    if (! rules) {
      let missingField = Object.keys(copy)[0]
      errors.push(new ValidationException(
        fieldPreffix + missingField,
        `Validation Error: parameter '${fieldPreffix + missingField}' found but was not expected`
      ))
    }

    if (rules && rules['*'] === undefined) {
      let missingField = Object.keys(copy)[0]
      if (missingField !== undefined) {
        errors.push(new ValidationException(
          fieldPreffix + missingField,
          `Validation Error: parameter '${fieldPreffix + missingField}' found but was not expected`
        ))
      }
    }

    // console.groupEnd()

    return errors
  }

  static sanitize (rules, data) {
    throw new NotImplementedException()
  }
}

module.exports = Validator

