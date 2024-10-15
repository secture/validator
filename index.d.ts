declare module '@secture/validator' {
  export default class Validator {
    constructor();
    addType(type: string, callback: (value: any) => boolean): void;
    removeType(type: string): void;
    clear(): void;

    validate(rules: string | object | any[], data: any, fieldPrefix?: string): any[];
    validateSimple(rules: { [key: string]: any }, value: any, parameterName?: string): any[];
    assert(rules: string | object | any[], data: any): void;

    addSanitizer(name: string, callback: (value: any) => any): void;
    sanitize(rules: string | object | any[], data: any, original?: any): any;
    sanitizeSimple(rules: { [key: string]: any }, value: any): any;
  }
}

