export class ValidationException {
  param: string
  message: string

  constructor(param: string, message: string) {
    this.param = param
    this.message = message
  }
}