
const { NotImplementedException, ValidationException } = require('./lib/exceptions')


class Validator
{
  /**
   *
   * @param rule string
   * @param value mixed
   */
  _validateField(rule, value, parameterName) {
    // console.log('_validateField')
    // console.log(rule, 'rule')
    // console.log(value, 'value')

    let errors = []

    if (rule === '*') {
      return errors
    }

    if (typeof value === 'undefined') {
      errors.push(new ValidationException(parameterName, `Validation Error: parameter '${parameterName}' is a required field`))
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
  _validateArray(rules, value, fieldPreffix) {
    // console.log('_validateArray')
    // console.log(rules, 'rules')
    // console.log(value, 'value')

    if (! fieldPreffix) {
      fieldPreffix = ''
    }
    if (fieldPreffix !== '') {
      fieldPreffix += '.'
    }

    let errors = []

    if (rules.length !== 1) {
      throw new Error(`Invalid rule ${JSON.stringify(rules)} in ${fieldPreffix}`)
    }

    for (let j in value) {
      errors = errors.concat(this._validateField(rules[0], value[j], fieldPreffix + j))
    }

    return errors
  }
  _validateObject(rules, value, fieldPreffix) {
    // console.log('_validateObject')
    // console.log(rules, 'rules')
    // console.log(value, 'value')

    if (! fieldPreffix) {
      fieldPreffix = ''
    }
    if (fieldPreffix !== '') {
      fieldPreffix += '.'
    }

    let errors = []

    const copy = Object.assign({}, value)

    for (let j in rules) {
      errors = errors.concat(this.validate(rules[j], copy[j], fieldPreffix + j))
      delete copy[j]
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

    return errors
  }

  /**
   * Returns an object with errors or [] if nothing fails.
   */
  validate (rules, original, fieldPreffix) {

    if (rules === undefined) {
      throw new Error(`Parameter rules cannot be undefined`)
    }

    let errors = []

    // special field
    if (rules !== '*') {

      let type = typeof rules

      switch (type) {
      case 'string':
        errors = errors.concat(this._validateField(rules, original, fieldPreffix))
        break;
      case 'object': // and array
        if (Array.isArray(rules)) {
          errors = errors.concat(this._validateArray(rules, original, fieldPreffix))
        } else {
          errors = errors.concat(this._validateObject(rules, original, fieldPreffix))
        }
        break;
      default:
        throw new NotImplementedException()
        break;
      }
    }

    return errors
  }
  sanitize (rules, data) {
    throw new NotImplementedException()
  }
}

module.exports = Validator

