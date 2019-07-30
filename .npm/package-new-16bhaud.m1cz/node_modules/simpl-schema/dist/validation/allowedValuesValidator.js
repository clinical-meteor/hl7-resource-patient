'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = allowedValuesValidator;

var _SimpleSchema = require('../SimpleSchema');

var _lodash = require('lodash.includes');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function allowedValuesValidator() {
  if (!this.valueShouldBeChecked) return;

  var allowedValues = this.definition.allowedValues;
  if (!allowedValues) return;

  var isAllowed = void 0;
  // set defined in scope and allowedValues is its instance
  if (typeof Set === 'function' && allowedValues instanceof Set) {
    isAllowed = allowedValues.has(this.value);
  } else {
    isAllowed = (0, _lodash2.default)(allowedValues, this.value);
  }

  return isAllowed ? true : _SimpleSchema.SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED;
}