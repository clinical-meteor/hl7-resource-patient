# MessageBox Changelog

## 0.2.2

Updated `lodash` dependency to latest version

## 0.2.1

Switched to depending on the full `lodash` package. The individual `lodash` packages are no longer maintained and have security vulnerabilities. Properly configured Webpack should be able to "tree shake" the `lodash` package when building your app, so that only the needed code gets added to your JavaScript bundle.

## 0.2.0

Added `messageBox.clone()` to clone an instance
