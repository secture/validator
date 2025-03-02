
// This is a compatibility layer for existing code that uses require('@secture/validator')
// It forwards to the TypeScript compiled version
module.exports = require('./dist/index.js').default;

