'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _lodash = require('lodash.includes');

var _lodash2 = _interopRequireDefault(_lodash);

var _utility = require('../utility');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getFieldInfo(mongoObject, key) {
  var keyInfo = mongoObject.getInfoForKey(key) || {};
  return {
    isSet: keyInfo.value !== undefined,
    value: keyInfo.value,
    operator: keyInfo.operator || null
  };
}

var AutoValueRunner = function () {
  function AutoValueRunner(options) {
    _classCallCheck(this, AutoValueRunner);

    this.options = options;
    this.doneKeys = [];
  }

  _createClass(AutoValueRunner, [{
    key: 'runForPosition',
    value: function runForPosition(_ref) {
      var affectedKey = _ref.key,
          operator = _ref.operator,
          position = _ref.position,
          value = _ref.value;
      var _options = this.options,
          closestSubschemaFieldName = _options.closestSubschemaFieldName,
          extendedAutoValueContext = _options.extendedAutoValueContext,
          func = _options.func,
          isModifier = _options.isModifier,
          mongoObject = _options.mongoObject;

      // If already called for this key, skip it

      if ((0, _lodash2.default)(this.doneKeys, affectedKey)) return;

      var fieldParentName = (0, _utility.getParentOfKey)(affectedKey, true);
      var parentFieldInfo = getFieldInfo(mongoObject, fieldParentName.slice(0, -1));

      var doUnset = false;

      if (Array.isArray(parentFieldInfo.value)) {
        if (isNaN(affectedKey.split('.').slice(-1).pop())) {
          // parent is an array, but the key to be set is not an integer (see issue #80)
          return;
        }
      }

      var autoValue = func.call(_extends({
        closestSubschemaFieldName: closestSubschemaFieldName.length ? closestSubschemaFieldName : null,
        field: function field(fName) {
          return getFieldInfo(mongoObject, closestSubschemaFieldName + fName);
        },

        isSet: value !== undefined,
        key: affectedKey,
        operator: operator,
        parentField: function parentField() {
          return parentFieldInfo;
        },
        siblingField: function siblingField(fName) {
          return getFieldInfo(mongoObject, fieldParentName + fName);
        },
        unset: function unset() {
          doUnset = true;
        },

        value: value
      }, extendedAutoValueContext || {}), mongoObject.getObject());

      // Update tracking of which keys we've run autovalue for
      this.doneKeys.push(affectedKey);

      if (doUnset && position) mongoObject.removeValueForPosition(position);

      if (autoValue === undefined) return;

      // If the user's auto value is of the pseudo-modifier format, parse it
      // into operator and value.
      if (isModifier) {
        var op = void 0;
        var newValue = void 0;
        if (autoValue && (typeof autoValue === 'undefined' ? 'undefined' : _typeof(autoValue)) === 'object') {
          var avOperator = Object.keys(autoValue).find(function (avProp) {
            return avProp.substring(0, 1) === '$';
          });
          if (avOperator) {
            op = avOperator;
            newValue = autoValue[avOperator];
          }
        }

        // Add $set for updates and upserts if necessary. Keep this
        // above the "if (op)" block below since we might change op
        // in this line.
        if (!op && position.slice(0, 1) !== '$') {
          op = '$set';
          newValue = autoValue;
        }

        if (op) {
          // Update/change value
          mongoObject.removeValueForPosition(position);
          mongoObject.setValueForPosition(op + '[' + affectedKey + ']', (0, _clone2.default)(newValue));
          return;
        }
      }

      // Update/change value. Cloning is necessary in case it's an object, because
      // if we later set some keys within it, they'd be set on the original object, too.
      mongoObject.setValueForPosition(position, (0, _clone2.default)(autoValue));
    }
  }]);

  return AutoValueRunner;
}();

exports.default = AutoValueRunner;