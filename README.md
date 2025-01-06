# Klassijs 'soft assert' Assertion Tool

## Overview

The Assertion Tool is designed to enhance your testing framework by allowing tests to continue running even when assertions fail. Instead of halting the test upon an assertion failure, this tool collects all failed assertions and compiles them into a comprehensive report at the end of the test run. This approach ensures that non-functional features do not prevent your tests from executing completely.

## Features

- **Non-blocking Assertions**: Failures in assertions do not stop the execution of tests.
- **Comprehensive Reporting**: All failed assertions are accumulated and reported at the end of the test run.
- **Easy Integration**: Seamlessly integrates with your existing test framework.

## Installation

To add the Assertion Tool to your project, follow these steps:

1. Add to project:
   ```bash
   pnpm add klassijs-soft-assert
   ```
2. Import the tool into your test files:
   ```javascript
   const softAssert = require('klassijs-soft-assert');
   ```

## Usage

1. **Use the assertion methods**:
   Use the assertion methods as you normally would. If an assertion fails, it will not stop the test:
   ```javascript
    await softAssert(actual, assertionType, expected, message, operator);
   ```

2. **The report**:
   At the end of your test suite, as part of the report method a summary of all failed assertions will be attached to te report

## Example

Here’s a simple example of how to use the Assertion Tool:

```javascript
const softAssert = require('klassijs-soft-assert');

describe('Sample Test Suite', async() => {
    it('should run all tests and report failed assertions', () => {
      await softAssert(title, 'tohavetext', 'our priority', 'This will pass');
      await softAssert(title, 'tohavetext', 'our priorities', 'This will fail');
      await softAssert(elem.elementId,'equal', null, 'This will pass');
      await softAssert(elem.elementId,'toNotEqual', null, 'This will fail');
    });
});
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
