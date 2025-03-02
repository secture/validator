declare module '@secture/validator' {
  export interface ValidationException {
    param: string;
    message: string;
  }

  export type ValidatorFunction = (value: any) => boolean;
  export type SanitizerFunction = (value: any, original?: any) => any;
  export type Rule = string | Record<string, any> | any[] | ((value: any, paramName?: string) => ValidationException[]);

  export default class Validator {
    constructor();
    
    /**
     * Adds a custom type validator
     */
    addType(type: string, callback: ValidatorFunction): void;
    
    /**
     * Removes a type validator
     */
    removeType(type: string): void;
    
    /**
     * Clears all custom types and resets sanitizers
     */
    clear(): void;

    /**
     * Validates data against rules
     * Returns an array of ValidationException or empty array if valid
     */
    validate(rules: Rule, data: any, fieldPrefix?: string): ValidationException[];
    
    /**
     * Validates a value against a parsed rule
     */
    validateSimple(rules: { 
      required: boolean;
      command: string;
      types: string[];
      constraints: Record<string, string>;
    }, value: any, parameterName?: string): ValidationException[];
    
    /**
     * Validates data against rules and throws an error if invalid
     */
    assert(rules: Rule, data: any): void;

    /**
     * Adds a custom sanitizer function
     */
    addSanitizer(name: string, callback: SanitizerFunction): void;
    
    /**
     * Sanitizes data according to rules
     */
    sanitize(rules: Rule, data: any, original?: any): any;
    
    /**
     * Sanitizes a value according to a parsed rule
     */
    sanitizeSimple(rules: { 
      required: boolean;
      command: string;
      types: string[];
      constraints: Record<string, string>;
    }, value: any): any;
  }
}

