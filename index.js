
var ValidationException = function (param, message) {
  this.param = param;
  this.message = message;
};

module.exports = function (requirements, object) {
  var copy = Object.assign({}, object);

  for (var i in requirements) {
    // special field
    if (i === '*') {
      continue;
    }

    var requirement = requirements[i];
    var property = object[i];

    var defaultValue = null;

    var isRequired = true;
    if (typeof requirement === 'object') {
      isRequired = false;
      defaultValue = requirement[1];
      requirement = requirement[0];
    }

    if (typeof property === 'undefined') {
      if (isRequired) {
        throw new ValidationException(
          i,
          `Validation Error: parameter '${i}' is a required field`
        );
      }

      object[i] = defaultValue;

    } else {
      if (typeof property !== requirement) {
        throw new ValidationException(
          i,
          `Validation Error: parameter '${i}' is waiting for a '${requirement}' argument but received a '${typeof property}'`
        );
      }
    }

    delete copy[i];
  }

  if (typeof requirements['*'] === undefined) {
    var missingField = Object.keys(copy)[0];
    if (missingField !== undefined) {
      throw new ValidationException(
        missingField,
        `Validation Error: parameter '${missingField}' found but was not expected`
      );
    }
  }

  return object;
};
