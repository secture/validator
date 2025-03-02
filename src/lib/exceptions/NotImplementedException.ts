export class NotImplementedException extends Error {
  constructor() {
    super('Not implemented yet!')
    this.name = 'NotImplementedException'
    // Required for proper Error subclassing in TypeScript
    Object.setPrototypeOf(this, NotImplementedException.prototype)
  }
}