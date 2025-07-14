/**
 * This function makes using assert easier by just passing the assertion type and values
 * it will not fail the test right away but allow the other asserts to be executed
 * @param actual {mixed}
 * @param expected {any}
 * @param message {string}
 * @param operator {any}
 * @param assertionType {string}
 * @returns {Promise<void>}
 */
const errors = [];
let consoleOutput = '';

/**
 * This function is for collecting the console errors
 * @type {{(message?: any, ...optionalParams: any[]): void, (...data: any[]): void}}
 */
const originalConsoleError = console.error;
console.error = function (message) {
  consoleOutput += message + '\n';
  originalConsoleError.apply(console, arguments);
};

// Global variables to store the imported libraries
let expectWebdriverIO = null;
let chai = null;
let assert = null;

/**
 * Initialize the libraries (called once)
 * @returns {Promise<void>}
 */
async function initializeLibraries() {
  if (!expectWebdriverIO || !chai) {
    const expectModule = await import('expect-webdriverio');
    expectWebdriverIO = expectModule.expect;
    
    // Use dynamic import for Chai v5 (ES module)
    const chaiModule = await import('chai');
    chai = chaiModule.default || chaiModule;
    assert = chai.assert || chaiModule.assert;
    
    // Final check
    if (!assert) {
      throw new Error('Could not initialize Chai assert. Please check your Chai installation.');
    }
  }
}

/**
 * Get the full expect-webdriverio instance
 * @returns {Promise<Object>}
 */
async function getExpect() {
  await initializeLibraries();
  return expectWebdriverIO;
}

/**
 * Get the full Chai instance
 * @returns {Promise<Object>}
 */
async function getChai() {
  await initializeLibraries();
  return chai;
}

/**
 * Get the Chai assert instance
 * @returns {Promise<Object>}
 */
async function getAssert() {
  await initializeLibraries();
  return assert;
}

/**
 * Enhanced softAssert function that can handle any Chai or expect-webdriverio method
 * @param actual - The actual value to test
 * @param assertionType - Either a predefined type or a function
 * @param expected - The expected value (optional for function calls)
 * @param message - Optional error message
 * @param operator - Optional operator (for backward compatibility)
 * @returns {Promise<void>}
 */
async function softAssert(actual, assertionType, expected, message, operator) {
  await initializeLibraries();
  const assertExpect = expectWebdriverIO;

  try {
    // If assertionType is a function, execute it directly
    if (typeof assertionType === 'function') {
      await assertionType(actual, expected);
      return;
    }

    // If assertionType is a string, check if it's a direct method call
    if (typeof assertionType === 'string') {
      // Check if it's a Chai assert method
      if (assert[assertionType]) {
        if (expected !== undefined) {
          assert[assertionType](actual, expected);
        } else {
          assert[assertionType](actual);
        }
        return;
      }

      // Check if it's an expect-webdriverio method
      if (assertExpect(actual)[assertionType]) {
        if (expected !== undefined) {
          await assertExpect(actual)[assertionType](expected);
        } else {
          await assertExpect(actual)[assertionType]();
        }
        return;
      }

      // Check if it's a chained expect-webdriverio method (like .not.toBeEnabled())
      const methodParts = assertionType.split('.');
      if (methodParts.length > 1) {
        let expectChain = assertExpect(actual);
        for (const part of methodParts) {
          if (part === 'not') {
            expectChain = expectChain.not;
          } else {
            expectChain = expectChain[part];
          }
        }
        if (expected !== undefined) {
          await expectChain(expected);
        } else {
          await expectChain();
        }
        return;
      }
    }

    // Fallback to predefined assertion types for backward compatibility
    const getAssertionType = {
      equals: async () => await assertExpect(actual).toEqual(expected),
      contains: async () => await assertExpect(actual).toContain(expected),
      doesexist: async () => await assertExpect(await actual).toBeExisting(),
      doesnotexist: async () => await assertExpect(await actual).not.toBeExisting(),
      isnotenabled: async () => await assertExpect(await actual).not.toBeEnabled(),
      doesnotcontain: async () => await assertExpect(actual).not.toContain(expected),
      isdisabled: async () => await assertExpect(await actual).toBeDisabled(),
      tobedisabled: async () => await assertExpect(await actual).toBeDisabled(),
      tobeclickable: async () => await assertExpect(await actual).toBeClickable(),
      isenabled: async () => await assertExpect(await actual).toBeEnabled(),
      tobeenabled: async () => await assertExpect(await actual).toBeEnabled(),
      tobeselected: async () => await assertExpect(await actual).toBeSelected(),
      tobechecked: async () => await assertExpect(await actual).toBeChecked(),
      tohavehtml: async () => await assertExpect(await actual).toHaveHTML(expected),
      tobefocused: async () => await assertExpect(await actual).toBeFocused(),
      tobepresent: async () => await assertExpect(await actual).toBePresent(),
      tobedisplayed: async () => await assertExpect(await actual).toBeDisplayed(),
      toexist: async () => await assertExpect(await actual).toBeExisting(),
      tobeexisting: async () => await assertExpect(await actual).toBeExisting(),
      tohavetitle: async () => await assertExpect(await actual).toHaveTitle(expected),
      tohaveurl: async () => await assertExpect(await actual).toHaveUrl(expected),
      tohavetext: async () => await handleTextAssertion(actual, expected),
      containstext: async () => await handleTextAssertion(actual, expected),

      isOK: async () => assert.isOk(actual),
      isNotOk: async () => assert.isNotOk(actual),
      equal: async () => assert.equal(actual, expected),
      notEqual: async () => assert.notEqual(actual, expected),
      toNotEqual: async () => assert.notEqual(actual, expected),
      isTrue: async () => assert.isTrue(actual),
      isNotTrue: async () => assert.isNotTrue(actual),
      isFalse: async () => assert.isFalse(actual),
      isNotFalse: async () => assert.isNotFalse(actual),
      isNull: async () => assert.isNull(actual),
      isNotNull: async () => assert.isNotNull(actual),
      exists: async () => assert.exists(actual),
      notExists: async () => assert.notExists(actual),
      isUndefined: async () => assert.isUndefined(actual),
      isString: async () => assert.isString(actual),
      typeOf: async () => assert.typeOf(actual, expected),
      isArray: async () => assert.isArray(actual),
      include: async () => assert.include(actual, expected),
      notInclude: async () => assert.notInclude(actual, expected),
      match: async () => assert.match(actual, expected),
      lengthOf: async () => assert.lengthOf(actual, expected),
      isEmpty: async () => assert.isEmpty(actual),
      isNotEmpty: async () => assert.isNotEmpty(actual),

      default: () => {
        const errorMsg = `Invalid assertion type: "${assertionType}". You can use any Chai assert method, expect-webdriverio method, predefined types, or pass a function.`;
        throw new Error(errorMsg);
      }
    };
    await (getAssertionType[assertionType] || getAssertionType['default'])();
  } catch (err) {
    const filteredActual = typeof actual === 'string' ? actual.replace(/[<>]/g, '') : actual;
    let errmsg;
    if (message) {
      errmsg = `${message} (Assertion failed: expected ${filteredActual} to ${operator ? operator : assertionType}${expected ? ' '+expected : ''})`;
    } else {
      errmsg = `Assertion failed: expected ${filteredActual} to ${operator ? operator : assertionType}${expected ? ' '+expected : ''}`;
    }
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
    }
    errors.push(err);
  }
}

/**
 * This function handles text assertions
 * @param actual
 * @param expected
 * @returns {Promise<void>}
 */
async function handleTextAssertion(actual, expected) {
  await initializeLibraries();
  const softAssert = expectWebdriverIO;

  if (typeof actual === 'string') {
    await softAssert(actual).toContain(expected);
  } else if (typeof actual.getText === 'function') {
    await softAssert(actual).toHaveText(expected);
  } else {
    throw new Error('Invalid WebdriverIO element or string');
  }
}

/**
 * This function throws all the collected errors at the end of the test run
 */
function throwCollectedErrors() {
  if (errors.length > 0) {
    const formattedErrorMessages = errors.map(err => {
      const match = err.message.match(/Expected substring: (.*)\nReceived string: (.*)/);
      if (match) {
        return `Expected substring: ${match[1]}\nReceived string: ${match[2]}`;
      }
      return err.message;
    }).join('\n');
    const fullErrorMessage = `Collected assertion errors:\n${formattedErrorMessages}`;
    const cleanConsoleOutput = consoleOutput.replace(/\x1b\[[0-9;]*m/g, ''); // Remove color codes
    const consoleMessage = `<div style="color:red;">${fullErrorMessage}</div>\n${cleanConsoleOutput}`;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`${consoleMessage}`);
    }
    errors.length = 0; // Empty error buffer
    throw new Error(consoleMessage);
  }
}

/**
 * Soft assert wrapper for any Chai assertion
 * @param assertionFunction {Function} - The Chai assertion function to execute
 * @param message {string} - Optional error message
 * @returns {Promise<void>}
 */
async function softAssertChai(assertionFunction, message) {
  await initializeLibraries();
  try {
    await assertionFunction();
  } catch (err) {
    const errmsg = message ? `${message} (${err.message})` : err.message;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
    }
    errors.push(err);
  }
}

/**
 * Soft assert wrapper for any expect-webdriverio assertion
 * @param assertionFunction {Function} - The expect-webdriverio assertion function to execute
 * @param message {string} - Optional error message
 * @returns {Promise<void>}
 */
async function softAssertExpect(assertionFunction, message) {
  await initializeLibraries();
  try {
    await assertionFunction();
  } catch (err) {
    const errmsg = message ? `${message} (${err.message})` : err.message;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
    }
    errors.push(err);
  }
}

module.exports = { 
  softAssert, 
  throwCollectedErrors, 
  getExpect, 
  getChai, 
  getAssert,
  softAssertChai,
  softAssertExpect
};
