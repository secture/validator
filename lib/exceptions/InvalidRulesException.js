
class InvalidRulesException extends Error
{
  constructor (message) {
    super(`InvalidRulesException: ${message}`)
  }
}

module.exports = InvalidRulesException
