'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongoObject = require('mongo-object');

var _mongoObject2 = _interopRequireDefault(_mongoObject);

var _doValidation = require('./doValidation.js');

var _doValidation2 = _interopRequireDefault(_doValidation);

var _lodash = require('lodash.findwhere');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ValidationContext = function () {
  function ValidationContext(ss) {
    var _this = this;

    _classCallCheck(this, ValidationContext);

    this._simpleSchema = ss;
    this._schema = ss.schema();
    this._schemaKeys = Object.keys(this._schema);
    this._validationErrors = [];

    // Set up validation dependencies
    this._deps = {};
    var tracker = ss._constructorOptions.tracker;

    if (tracker) {
      this._depsAny = new tracker.Dependency();
      this._schemaKeys.forEach(function (key) {
        _this._deps[key] = new tracker.Dependency();
      });
    }
  }

  _createClass(ValidationContext, [{
    key: '_markKeyChanged',
    value: function _markKeyChanged(key) {
      var genericKey = _mongoObject2.default.makeKeyGeneric(key);
      if (this._deps.hasOwnProperty(genericKey)) this._deps[genericKey].changed();
    }
  }, {
    key: '_markKeysChanged',
    value: function _markKeysChanged(keys) {
      var _this2 = this;

      if (!keys || !Array.isArray(keys) || !keys.length) return;

      keys.forEach(function (key) {
        return _this2._markKeyChanged(key);
      });

      this._depsAny && this._depsAny.changed();
    }
  }, {
    key: 'setValidationErrors',
    value: function setValidationErrors(errors) {
      var previousValidationErrors = this._validationErrors.map(function (o) {
        return o.name;
      });
      var newValidationErrors = errors.map(function (o) {
        return o.name;
      });

      this._validationErrors = errors;

      // Mark all previous plus all new as changed
      var changedKeys = previousValidationErrors.concat(newValidationErrors);
      this._markKeysChanged(changedKeys);
    }
  }, {
    key: 'addValidationErrors',
    value: function addValidationErrors(errors) {
      var _this3 = this;

      var newValidationErrors = errors.map(function (o) {
        return o.name;
      });

      errors.forEach(function (error) {
        return _this3._validationErrors.push(error);
      });

      // Mark all new as changed
      this._markKeysChanged(newValidationErrors);
    }

    // Reset the validationErrors array

  }, {
    key: 'reset',
    value: function reset() {
      this.setValidationErrors([]);
    }
  }, {
    key: 'getErrorForKey',
    value: function getErrorForKey(key) {
      var genericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _mongoObject2.default.makeKeyGeneric(key);

      var errors = this._validationErrors;
      return (0, _lodash2.default)(errors, { name: key }) || (0, _lodash2.default)(errors, { name: genericKey });
    }
  }, {
    key: '_keyIsInvalid',
    value: function _keyIsInvalid(key, genericKey) {
      return !!this.getErrorForKey(key, genericKey);
    }

    // Like the internal one, but with deps

  }, {
    key: 'keyIsInvalid',
    value: function keyIsInvalid(key) {
      var genericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _mongoObject2.default.makeKeyGeneric(key);

      if (this._deps.hasOwnProperty(genericKey)) this._deps[genericKey].depend();

      return this._keyIsInvalid(key, genericKey);
    }
  }, {
    key: 'keyErrorMessage',
    value: function keyErrorMessage(key) {
      var genericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _mongoObject2.default.makeKeyGeneric(key);

      if (this._deps.hasOwnProperty(genericKey)) this._deps[genericKey].depend();

      var errorObj = this.getErrorForKey(key, genericKey);
      if (!errorObj) return '';

      return this._simpleSchema.messageForError(errorObj);
    }

    /**
     * Validates the object against the simple schema and sets a reactive array of error objects
     */

  }, {
    key: 'validate',
    value: function validate(obj) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$extendedCustomCo = _ref.extendedCustomContext,
          extendedCustomContext = _ref$extendedCustomCo === undefined ? {} : _ref$extendedCustomCo,
          _ref$ignore = _ref.ignore,
          ignoreTypes = _ref$ignore === undefined ? [] : _ref$ignore,
          keysToValidate = _ref.keys,
          _ref$modifier = _ref.modifier,
          isModifier = _ref$modifier === undefined ? false : _ref$modifier,
          mongoObject = _ref.mongoObject,
          _ref$upsert = _ref.upsert,
          isUpsert = _ref$upsert === undefined ? false : _ref$upsert;

      var validationErrors = (0, _doValidation2.default)({
        extendedCustomContext: extendedCustomContext,
        ignoreTypes: ignoreTypes,
        isModifier: isModifier,
        isUpsert: isUpsert,
        keysToValidate: keysToValidate,
        mongoObject: mongoObject,
        obj: obj,
        schema: this._simpleSchema,
        validationContext: this
      });

      if (keysToValidate) {
        // We have only revalidated the listed keys, so if there
        // are any other existing errors that are NOT in the keys list,
        // we should keep these errors.
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function _loop() {
            var error = _step.value;

            var wasValidated = keysToValidate.some(function (key) {
              return key === error.name || error.name.startsWith(key + '.');
            });
            if (!wasValidated) validationErrors.push(error);
          };

          for (var _iterator = this._validationErrors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      this.setValidationErrors(validationErrors);

      // Return true if it was valid; otherwise, return false
      return !validationErrors.length;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      this._depsAny && this._depsAny.depend();
      return this._validationErrors.length === 0;
    }
  }, {
    key: 'validationErrors',
    value: function validationErrors() {
      this._depsAny && this._depsAny.depend();
      return this._validationErrors;
    }
  }, {
    key: 'clean',
    value: function clean() {
      var _simpleSchema;

      return (_simpleSchema = this._simpleSchema).clean.apply(_simpleSchema, arguments);
    }
  }]);

  return ValidationContext;
}();

exports.default = ValidationContext;