
class NotImplementedException extends Error
{
  constructor () {
    super()
    this.message = 'Not implemented yet!'
  }
}

module.exports = NotImplementedException
