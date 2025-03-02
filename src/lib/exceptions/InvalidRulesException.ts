export class InvalidRulesException extends Error {
  constructor(message: string) {
    super(`InvalidRulesException: ${message}`)
    this.name = 'InvalidRulesException'
    // Required for proper Error subclassing in TypeScript
    Object.setPrototypeOf(this, InvalidRulesException.prototype)
  }
}