import { 
  NotImplementedException, 
  InvalidRulesException, 
  ValidationException 
} from './lib/exceptions'
import {
  ValidatorFunction,
  SanitizerFunction,
  ParsedRules,
  Types,
  Sanitizers,
  Rule,
  ValidatorFunctionReturn
} from './types'

class Validator {
  private types: Types = {}
  private sanitizers: Sanitizers = {}

  constructor() {
    this.clear()
  }

  addType(type: string, callback: ValidatorFunction): void {
    this.types[type] = callback
  }

  removeType(type: string): void {
    delete this.types[type]
  }

  clear(): void {
    this.types = {}
    this.sanitizers = {
      delete: (x: any): undefined => undefined,

      trim: (x: any): string => x ? x.trim() : '',
      emptyString: (x: any): string => x ? x : '',
      emptyArray: (x: any): any[] => x ? x : [],
      emptyObject: (x: any): Record<string, any> => x ? x : {},

      onlyNumbers: (x: string): string => x.replace(/[^0-9]/g, ''),

      toInt: (x: any): number | null => {
        if (isNaN(x)) {
          return null
        }
        const number = parseInt(x)
        if (isNaN(number)) {
          return null
        }
        return number
      },
      toFloat: (x: any): number | null => {
        if (isNaN(x)) {
          return null
        }
        const number = parseFloat(x)
        if (isNaN(number)) {
          return null
        }
        return number
      },
      toString: (x: any): string | null => x ? '' + x : null,

      firstCapitalCase: (x: string): string | null => x.length ? x.charAt(0).toUpperCase() + x.slice(1) : null,
      lowerCase: (x: string): string | null => x.length ? x.toLowerCase() : null,
      upperCase: (x: string): string | null => x.length ? x.toUpperCase() : null,
    }
  }

  private _parseRules(rule: string): ParsedRules {
    const rules: ParsedRules = {
      required: true,
      command: rule,
      types: [],
      constraints: {} as Record<string, string>,
    }

    const chunks = rule.split('|')
    for (const i in chunks) {
      const [key, value] = chunks[i].split(':')

      if (!value) {
        if (key.substr(-1) === '?') {
          const newKey = key.substr(0, key.length - 1)
          rules.required = false
          rules.types.push(newKey)
        } else if (key === 'undefined') {
          rules.required = false
        } else {
          rules.types.push(key)
        }
      } else {
        rules.constraints[key] = value
      }
    }

    return rules
  }

  validateSimple(rules: ParsedRules, value: any, parameterName?: string): ValidationException[] {
    const errors: ValidationException[] = []
    let type = this._getTypeFor(value)

    // validation of types need to be done here since _getTypeFor needs to be
    // used for determining type of rules
    for (const i in this.types) {
      if (this.types[i](value)) {
        type = i
      }
    }

    if (!rules.types.includes(type)) {
      if (!parameterName) {
        errors.push(new ValidationException(
          '',
          `Validation Error: the default parameter is waiting for a '${rules.command}' argument but received a '${type}': ${JSON.stringify(value)}`
        ))
      } else {
        errors.push(new ValidationException(
          parameterName,
          `Validation Error: parameter '${parameterName}' is waiting for a '${rules.command}' argument but received a '${type}': ${JSON.stringify(value)}`
        ))
      }
    }

    return errors
  }

  /**
   * Validates a field against a rule
   */
  private _validateField(rule: string, value: any, parameterName: string): ValidationException[] {
    const errors: ValidationException[] = []

    const rules = this._parseRules(rule)

    if (this._getTypeFor(value) === 'undefined') {
      if (rules.required) {
        errors.push(new ValidationException(parameterName, `Validation Error: parameter '${parameterName}' is a required field`))
      }
    } else {
      errors.push(...this.validateSimple(rules, value, parameterName))
    }

    return errors
  }

  private _validateArray(rules: any[], value: any[], fieldPreffix?: string): ValidationException[] {
    if (!fieldPreffix) {
      fieldPreffix = ''
    }
    if (fieldPreffix !== '') {
      fieldPreffix += '.'
    }

    const errors: ValidationException[] = []

    if (rules.length !== 1) {
      throw new InvalidRulesException(`Invalid rule ${JSON.stringify(rules)} in ${fieldPreffix}`)
    }

    for (const j in value) {
      errors.push(...this.validate(rules[0], value[j], fieldPreffix + j))
    }

    return errors
  }

  private _validateObject(rules: Record<string, any>, value: any, fieldPreffix?: string): ValidationException[] {
    if (!fieldPreffix) {
      fieldPreffix = ''
    }
    if (fieldPreffix !== '') {
      fieldPreffix += '.'
    }

    const errors: ValidationException[] = []

    let copy: Record<string, any> = {}
    
    if (typeof value === 'object' && value !== null) {
      if (Object.getPrototypeOf(value) !== Object.prototype) {
        // For objects with non-standard prototypes
        copy = Object.create(value)
      } else {
        copy = { ...value }
      }
    }

    if (typeof value !== 'object' || value === null) {
      if (fieldPreffix) {
        const field = fieldPreffix.substring(0, fieldPreffix.length - 1)
        errors.push(new ValidationException(
          field,
          `Validation Error: parameter '${field}' should be an object`
        ))
      } else {
        errors.push(new ValidationException(
          '',
          `Validation Error: the provided element should be an object`
        ))
      }
    }

    for (const j in rules) {
      if (j === '*') {
        if (value !== null && typeof value === 'object') {
          for (const i in copy) {
            errors.push(...this.validate(rules[j], copy[i], fieldPreffix + i))
          }
        }
      } else {
        errors.push(...this.validate(rules[j], value && typeof value === 'object' ? value[j] : undefined, fieldPreffix + j))
      }
      if (copy && typeof copy === 'object') {
        delete copy[j]
      }
    }

    if (rules && rules['*'] === undefined && value !== null && typeof value === 'object') {
      for (const missingField in copy) {
        errors.push(new ValidationException(
          fieldPreffix + missingField,
          `Validation Error: parameter '${fieldPreffix + missingField}' found but was not expected`
        ))
      }
    }

    return errors
  }

  private _getTypeFor(value: any): string {
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
   * Validates data against rules
   * Returns an array with errors or an empty array if nothing fails
   */
  validate(rules: Rule, original: any, fieldPreffix?: string): ValidationException[] {
    if (rules === undefined) {
      throw new InvalidRulesException(`Parameter rules cannot be undefined`)
    }

    const errors: ValidationException[] = []

    // special field
    if (rules !== '*') {
      const type = this._getTypeFor(rules)

      switch (type) {
        case 'string':
          errors.push(...this._validateField(rules as string, original, fieldPreffix || ''))
          break
        case 'object':
          errors.push(...this._validateObject(rules as Record<string, any>, original, fieldPreffix))
          break
        case 'array':
          errors.push(...this._validateArray(rules as any[], original, fieldPreffix))
          break
        case 'function':
          const result = (rules as Function)(original, fieldPreffix)
          if (Array.isArray(result)) {
            errors.push(...result)
          }
          break
        default:
          throw new InvalidRulesException(`Unknown type of rule: ${type}`)
      }
    }

    return errors
  }

  addSanitizer(name: string, callback: SanitizerFunction): void {
    this.sanitizers[name] = callback
  }

  sanitizeSimple(rules: ParsedRules, value: any): any {
    let result = value
    
    for (const i in rules.types) {
      const sanitizer = rules.types[i]
      if (!this.sanitizers[sanitizer]) {
        throw new InvalidRulesException(`Invalid sanitizer: ${sanitizer}`)
      }

      result = this.sanitizers[sanitizer](result)
    }

    return result
  }

  private _sanitizeField(rule: string, value: any, original: any): any {
    const rules = this._parseRules(rule)
    return this.sanitizeSimple(rules, value)
  }

  private _sanitizeArray(rules: any[], value: any[], original: any): any[] {
    const copy: any[] = []

    if (rules.length !== 1) {
      throw new InvalidRulesException(`Invalid rule ${JSON.stringify(rules)}`)
    }

    for (const j in value) {
      copy.push(this.sanitize(rules[0], value[j], original))
    }

    return copy
  }

  private _sanitizeObject(rules: Record<string, any>, value: Record<string, any>, original: any): Record<string, any> {
    const copy: Record<string, any> = {}

    const unique = (value: string, index: number, self: string[]) => self.indexOf(value) === index

    const keys = [...Object.keys(rules), ...Object.keys(value)].filter(unique)

    for (const j in keys) {
      const key = keys[j]

      copy[key] = value[key]
      if (rules.hasOwnProperty(key)) {
        copy[key] = this.sanitize(rules[key], copy[key], original)
        if (copy[key] === undefined) {
          delete copy[key]
        }
      }
    }

    return copy
  }

  sanitize(rules: Rule, data: any, original?: any): any {
    if (original === undefined) {
      original = JSON.parse(JSON.stringify(data))
    }

    if (rules === undefined) {
      throw new InvalidRulesException(`Parameter rules cannot be undefined`)
    }

    let result = data
    const type = this._getTypeFor(rules)

    switch (type) {
      case 'string':
        result = this._sanitizeField(rules as string, data, original)
        break
      case 'object':
        result = this._sanitizeObject(rules as Record<string, any>, data, original)
        break
      case 'array':
        result = this._sanitizeArray(rules as any[], data, original)
        break
      case 'function':
        result = (rules as Function)(data, original)
        break
      default:
        throw new InvalidRulesException(`Unknown type of rule: ${type}`)
    }

    return result
  }

  assert(rules: Rule, data: any): void {
    const errors = this.validate(rules, data)
    if (errors.length) {
      throw new Error(JSON.stringify(errors, null, 2))
    }
  }
}

export default Validator