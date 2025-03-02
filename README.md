
# @secture/validator

A schema validator for JavaScript and TypeScript that validates object
structures against defined rules.

## Installation

```bash
npm install @secture/validator
# or
yarn add @secture/validator
```

## Basic Usage

```typescript
import Validator from '@secture/validator';

const validator = new Validator();

// Simple validation
const data = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
};

const rules = {
  name: 'string',
  age: 'number',
  email: 'string'
};

// Returns array of errors, empty if valid
const errors = validator.validate(rules, data);

// Or use assert to throw on invalid data
try {
  validator.assert(rules, data);
  // Data is valid
} catch (e) {
  // Handle validation errors
}
```

## Features

- Validate nested objects and arrays
- Custom type validators
- Optional fields with `field?` or `field|undefined` syntax
- Multiple type validation with `string|number|null` syntax
- Wildcards for flexible validation
- Data sanitization
- Written in TypeScript with type definitions

