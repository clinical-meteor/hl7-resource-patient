'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = appendAffectedKey;
function appendAffectedKey(affectedKey, key) {
  if (key === '$each') return affectedKey;
  return affectedKey ? affectedKey + '.' + key : key;
}