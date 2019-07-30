'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPositionsForAutoValue = require('./getPositionsForAutoValue');

var _getPositionsForAutoValue2 = _interopRequireDefault(_getPositionsForAutoValue);

var _AutoValueRunner = require('./AutoValueRunner');

var _AutoValueRunner2 = _interopRequireDefault(_AutoValueRunner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method setAutoValues
 * @private
 * @param {Array} autoValueFunctions - An array of objects with func, fieldName, and closestSubschemaFieldName props
 * @param {MongoObject} mongoObject
 * @param {Boolean} [isModifier=false] - Is it a modifier doc?
 * @param {Object} [extendedAutoValueContext] - Object that will be added to the context when calling each autoValue function
 * @returns {undefined}
 *
 * Updates doc with automatic values from autoValue functions or default
 * values from defaultValue. Modifies the referenced object in place.
 */
function setAutoValues(autoValueFunctions, mongoObject, isModifier, extendedAutoValueContext) {
  // Sort by how many dots each field name has, asc, such that we can auto-create
  // objects and arrays before we run the autoValues for properties within them.
  var sortedAutoValueFunctions = autoValueFunctions.sort(function (a, b) {
    return a.fieldName.split('.').length - b.fieldName.split('.').length;
  });

  sortedAutoValueFunctions.forEach(function (_ref) {
    var func = _ref.func,
        fieldName = _ref.fieldName,
        closestSubschemaFieldName = _ref.closestSubschemaFieldName;

    var avRunner = new _AutoValueRunner2.default({
      closestSubschemaFieldName: closestSubschemaFieldName,
      extendedAutoValueContext: extendedAutoValueContext,
      func: func,
      isModifier: isModifier,
      mongoObject: mongoObject
    });

    var positions = (0, _getPositionsForAutoValue2.default)({ fieldName: fieldName, isModifier: isModifier, mongoObject: mongoObject });

    // Run the autoValue function once for each place in the object that
    // has a value or that potentially should.
    positions.forEach(avRunner.runForPosition.bind(avRunner));
  });
}

exports.default = setAutoValues;