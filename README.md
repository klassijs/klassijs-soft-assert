# Klassijs 'soft assert' Assertion Tool

## Overview

The Assertion Tool is designed to enhance your testing framework by allowing tests to continue running even when assertions fail. Instead of halting the test upon an assertion failure, this tool collects all failed assertions and compiles them into a comprehensive report at the end of the test run. This approach ensures that non-functional features do not prevent your tests from executing completely.

## Features

- **Non-blocking Assertions**: Failures in assertions do not stop the execution of tests.
- **Comprehensive Reporting**: All failed assertions are accumulated and reported at the end of the test run.
- **Easy Integration**: Seamlessly integrates with your existing test framework.
- **Full API Access**: Provides access to the complete Chai API and expect-webdriverio functionality.
- **Flexible Assertion Methods**: Use predefined assertion types, any Chai/expect-webdriverio method, or custom functions.

## Installation

To add the Assertion Tool to your project, follow these steps:

1. Add to project:
   ```bash
   pnpm add klassijs-soft-assert
   ```
2. Import the tool into your test files:
   ```javascript
   const { softAssert, getExpect, getChai, getAssert, softAssertChai, softAssertExpect } = require('klassijs-soft-assert');
   ```

## Usage

### Method 1: Enhanced softAssert with Full API Access

The `softAssert` function now accepts any Chai or expect-webdriverio method directly:

```javascript
// Any Chai assert method
await softAssert(actual, 'deepEqual', expected, 'Deep equality check');
await softAssert(actual, 'isArray', undefined, 'Should be an array');
await softAssert(actual, 'include', expected, 'Should include value');

// Any expect-webdriverio method
await softAssert(element, 'toBeDisplayed', undefined, 'Element should be displayed');
await softAssert(element, 'toHaveAttribute', 'class', 'Element should have class');
await softAssert(element, 'toHaveText', expected, 'Element should have text');

// Chained expect-webdriverio methods
await softAssert(element, 'not.toBeEnabled', undefined, 'Element should not be enabled');
await softAssert(element, 'not.toBeSelected', undefined, 'Element should not be selected');

// Custom function
await softAssert(actual, async (actual, expected) => {
  // Your custom assertion logic
  assert.deepEqual(actual, expected);
}, expected, 'Custom assertion');
```

### Method 2: Using Predefined Assertion Types (Backward Compatible)

Your existing code continues to work unchanged:

```javascript
await softAssert(actual, 'equals', expected, 'message');
await softAssert(actual, 'tohavetext', expected, 'message');
```

### Method 3: Direct Library Access

Get access to the complete libraries:

```javascript
const { getChai, getAssert } = require('klassijs-soft-assert');

// Get the full Chai instance
const chai = await getChai();
const assert = await getAssert();

// Use any method from these libraries
assert.deepEqual(actual, expected);
chai.expect(myValue).to.be.a('string');
```

### Method 4: Soft Assertion Wrappers

Wrap any assertion in soft assert functionality:

```javascript
const { softAssertChai, softAssertExpect } = require('klassijs-soft-assert');

// Wrap any Chai assertion
await softAssertChai(async () => {
  assert.deepEqual(actual, expected);
}, 'Custom error message');

// Wrap any expect-webdriverio assertion
await softAssertExpect(async () => {
  await expect(element).toHaveAttribute('class', 'active');
}, 'Custom error message');
```

## Example

Here's a comprehensive example showing the enhanced functionality:

```javascript
const { 
  softAssert, 
  getExpect, 
  getChai, 
  getAssert, 
  softAssertChai, 
  softAssertExpect,
  throwCollectedErrors 
} = require('klassijs-soft-assert');

describe('Sample Test Suite', async() => {
    it('should run all tests and report failed assertions', async () => {
      // Method 1: Enhanced softAssert with full API access
      await softAssert(title, 'toHaveText', 'our priority', 'This will pass');
      await softAssert(elem.elementId, 'deepEqual', null, 'This will pass');
      await softAssert(element, 'toBeDisplayed', undefined, 'Element should be displayed');
      await softAssert(element, 'not.toBeEnabled', undefined, 'Element should not be enabled');
      
      // Method 2: Backward compatible (your existing approach)
      await softAssert(title, 'tohavetext', 'our priority', 'This will pass');
      await softAssert(elem.elementId,'equal', null, 'This will pass');

      // Method 3: Custom function
      await softAssert(actual, async (actual, expected) => {
        const assert = await getAssert();
        assert.deepEqual(actual, expected);
      }, expected, 'Custom deep equality check');

      // Method 4: Direct library usage (will fail immediately)
      const assert = await getAssert();
      assert.isArray(myArray);
    });

    afterEach(async () => {
      // Throw all collected errors at the end
      throwCollectedErrors();
    });
});
```

## Available Functions

- `softAssert(actual, assertionType, expected, message, operator)` - Enhanced function that accepts any Chai/expect-webdriverio method
- `getExpect()` - Get the full expect-webdriverio instance
- `getChai()` - Get the full Chai instance  
- `getAssert()` - Get the Chai assert instance
- `softAssertChai(assertionFunction, message)` - Wrap any Chai assertion in soft assert
- `softAssertExpect(assertionFunction, message)` - Wrap any expect-webdriverio assertion in soft assert
- `throwCollectedErrors()` - Throw all collected errors at the end of the test

## Supported Methods

### Chai Assert Methods
Any method from `chai.assert` can be used directly:
- `deepEqual`, `equal`, `notEqual`, `strictEqual`, `notStrictEqual`
- `isTrue`, `isFalse`, `isNull`, `isNotNull`, `isUndefined`
- `isArray`, `isString`, `isNumber`, `isBoolean`, `isFunction`
- `include`, `notInclude`, `match`, `lengthOf`
- `isEmpty`, `isNotEmpty`, `exists`, `notExists`
- And many more...

### Expect-WebdriverIO Methods
Any method from expect-webdriverio can be used directly:
- `toBeDisplayed`, `toBeEnabled`, `toBeSelected`, `toBeChecked`
- `toHaveText`, `toHaveAttribute`, `toHaveHTML`, `toHaveTitle`
- `toHaveUrl`, `toBeClickable`, `toBeFocused`, `toBePresent`
- `toEqual`, `toContain`, `toBeExisting`
- Chained methods like `not.toBeEnabled`, `not.toBeSelected`
- And many more...

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
