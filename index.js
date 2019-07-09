
const { NotImplementedException, InvalidRulesException, ValidationException } = require('./lib/exceptions')


class Validator
{

  constructor () {
    this.clear()
  }

  addType (type, callback) {
    this.types[type] = callback
  }

  clear () {
    this.types = {

    }
    this.sanitizers = {
      trim: x => x ? x.trim() : '',
      emptyString: x => x ? x : '',
      firstCapitalCase: x => x.length ? x.charAt(0).toUpperCase() + x.slice(1) : x,
      universalPhone: x => {
        x = x.replace(/-/g, '').replace(/ /g, '')
        if (x[0] !== '+') {
          x = '+34' + x
        }
        return x
      },
    }
  }


  _parseRules (rule) {
    let rules = {
      command: rule,
      types: [],
      constraints: [],
    }

    let chunks = rule.split('|')
    for (let i in chunks) {
      let [ key, value ] = chunks[i].split(':')

      if (! value) {
        rules.types.push(key)
      } else {
        rules.constraints[key] = value
      }
    }

    return rules
  }

  validateSimple (rules, value, parameterName) {
    let errors = []

    /*
    console.log(rules, 'rules')
    console.log(value, 'value')
    console.log(this._getTypeFor(value), 'type')
    console.log(rules.includes(this._getTypeFor(value)), 'includes')
    */

    let type = this._getTypeFor(value)

    // validation of types need to be done here since _getTypeFor needs to be
    // used for determining type of rules
    for (let i in this.types) {
      if (this.types[i](value)) {
        type = i
      }
    }

    if (! rules.types.includes(type)) {
      if (! parameterName) {
        errors.push(new ValidationException(
            '',
            `Validation Error: the default parameter is waiting for a '${rules.command}' argument but received a '${type}'`
        ))
      } else {
        errors.push(new ValidationException(
            parameterName,
            `Validation Error: parameter '${parameterName}' is waiting for a '${rules.command}' argument but received a '${type}'`
        ))
      }
    }

    return errors
  }

  /**
   *
   * @param rule string
   * @param value mixed
   */
  _validateField(rule, value, parameterName) {
    let errors = []

    let rules = this._parseRules(rule)

    if (this._getTypeFor(value) === 'undefined') {
      errors.push(new ValidationException(parameterName, `Validation Error: parameter '${parameterName}' is a required field`))
    } else {
      errors = errors.concat(this.validateSimple(rules, value, parameterName))
    }

    return errors
  }
  _validateArray(rules, value, fieldPreffix) {

    if (! fieldPreffix) {
      fieldPreffix = ''
    }
    if (fieldPreffix !== '') {
      fieldPreffix += '.'
    }

    let errors = []

    if (rules.length !== 1) {
      throw new InvalidRulesException(`Invalid rule ${JSON.stringify(rules)} in ${fieldPreffix}`)
    }

    for (let j in value) {
      errors = errors.concat(this.validate(rules[0], value[j], fieldPreffix + j))
    }

    return errors
  }
  _validateObject(rules, value, fieldPreffix) {

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
      for (let missingField in copy) {
        errors.push(new ValidationException(
            fieldPreffix + missingField,
            `Validation Error: parameter '${fieldPreffix + missingField}' found but was not expected`
        ))
      }
    }

    return errors
  }

  _getTypeFor(value) {

    if (typeof value !== 'object') {
      return typeof value
    }

    if (Array.isArray(value)) {
      return 'array'
    }

    if (value === null) {
      return 'null'
    }

    return 'object'
  }

  /**
   * Returns an object with errors or [] if nothing fails.
   */
  validate (rules, original, fieldPreffix) {

    if (rules === undefined) {
      throw new InvalidRulesException(`Parameter rules cannot be undefined`)
    }

    let errors = []

    // special field
    if (rules !== '*') {

      let type = this._getTypeFor(rules)

      switch (type) {
      case 'string':
        errors = errors.concat(this._validateField(rules, original, fieldPreffix))
        break;
      case 'object':
        errors = errors.concat(this._validateObject(rules, original, fieldPreffix))
        break;
      case 'array':
        errors = errors.concat(this._validateArray(rules, original, fieldPreffix))
        break;
      case 'function':
        errors = errors.concat(rules(original, fieldPreffix))
        break;
      default:
        throw new InvalidRulesException(`Unknown type of rule: ${type}`)
      }
    }

    return errors
  }

  addSanitizer (name, callback) {
    this.sanitizers[name] = callback
  }

  sanitizeSimple(rules, value) {
    for (let i in rules.types) {
      let sanitizer = rules.types[i]
      if (! this.sanitizers[sanitizer]) {
        throw new InvalidRulesException(`Invalid sanitizer: ${sanitizer}`)
      }

      value = this.sanitizers[sanitizer](value)
    }

    return value
  }

  _sanitizeField(rule, value, original) {
    let rules = this._parseRules(rule)
    return this.sanitizeSimple(rules, value)
  }
  _sanitizeArray(rules, value, original) {

    if (rules.length !== 1) {
      throw new InvalidRulesException(`Invalid rule ${JSON.stringify(rules)}`)
    }

    for (let j in value) {
      value[j] = this.sanitize(rules[0], value[j], original)
    }

    return value
  }
  _sanitizeObject(rules, value, original) {

    for (let j in rules) {
      value[j] = this.sanitize(rules[j], value[j], original)
      if (value[j] === undefined) {
        delete value[j]
      }
    }

    return value
  }

  sanitize (rules, data, original) {
    if (original === undefined) {
      original = JSON.parse(JSON.stringify(data))
    }

    if (rules === undefined) {
      throw new InvalidRulesException(`Parameter rules cannot be undefined`)
    }

    let type = this._getTypeFor(rules)

    switch (type) {
    case 'string':
      data = this._sanitizeField(rules, data, original)
      break;
    case 'object':
      data = this._sanitizeObject(rules, data, original)
      break;
    case 'array':
      data = this._sanitizeArray(rules, data, original)
      break;
    case 'function':
      data = rules(data, original)
      break;
    default:
      throw new InvalidRulesException(`Unknown type of rule: ${type}`)
    }

    return data
  }
}

module.exports = Validator

