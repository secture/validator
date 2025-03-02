import { ValidationException } from './lib/exceptions'

// Type for validation functions
export type ValidatorFunction = (value: any) => boolean

// Type for sanitization functions
export type SanitizerFunction = (value: any, original?: any) => any

// Type for parsed rule structure
export interface ParsedRules {
  required: boolean
  command: string
  types: string[]
  constraints: Record<string, string>
}

// Type for validator types collection
export type Types = Record<string, ValidatorFunction>

// Type for sanitizer collection
export type Sanitizers = Record<string, SanitizerFunction>

// Rules can be strings, objects, arrays, or functions
export type Rule = string | Record<string, any> | any[] | ((value: any, paramName?: string) => ValidationException[])

// Custom function validator return type
export type ValidatorFunctionReturn = ValidationException[]