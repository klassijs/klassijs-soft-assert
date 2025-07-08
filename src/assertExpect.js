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

/**
 * This function makes using assert easier by just passing the assertion type and values
 * @param actual
 * @param assertionType
 * @param expected
 * @param message
 * @param operator
 * @returns {Promise<void>}
 */
async function softAssert(actual, assertionType, expected, message, operator) {
  const { expect } = await import('expect-webdriverio');
  const chai = await import('chai');
  const assertExpect = expect;
  const assert = chai.assert;

  try {
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
        const errorMsg = `Invalid assertion type: "${assertionType}". Valid assertion types are: "equals", "contains", "doesexist", "doesnotexist", "isnotenabled", "doesnotcontain", "isdisabled", "tobedisabled", "tobeclickable", "isenabled", "tobeenabled", "tobeselected", "tobechecked", "tohavehtml", "tobefocused", "tobepresent", "tobedisplayed", "exists", "toexist", "tobeexisting", "tohavetitle", "tohaveurl", "tohavetext", "containstext", "toNotEqual", "isOK", "equal", "notEqual", "isTrue", "isFalse", "isNull", "notExists", "isUndefined", "isString", "typeOf", "isArray", "include", "notInclude", "match", "lengthOf".`;
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
  const { expect } = await import('expect-webdriverio');
  const softAssert = expect;

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
      cucumberThis.attach(`${fullErrorMessage}\n${cleanConsoleOutput}`);
    }
    errors.length = 0; // Empty error buffer
    throw new Error(consoleMessage);
  }
}

module.exports = { softAssert, throwCollectedErrors };
