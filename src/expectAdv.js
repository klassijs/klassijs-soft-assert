/**
 * This is the function for performing asserts and passing the results to the report
 * @param actual
 * @param assertionType
 * @param expected
 */
const errors = [];

async function expectAdv(actual, assertionType, expected, message, operator) {
  const { expect } = await import('expect-webdriverio');
  const softAssert = expect;

  try {
    const getAssertionType = {
      equals: async () => await softAssert(actual).toEqual(expected),
      contains: async () => await softAssert(actual).toContain(expected),
      exists: async () => await softAssert(await actual).toBeExisting(),
      doesexist: async () => await softAssert(await actual).toBeExisting(),
      doesnotexist: async () => await softAssert(await actual).not.toBeExisting(),
      isenabled: async () => await softAssert(await actual).toBeEnabled(),
      isnotenabled: async () => await softAssert(await actual).not.toBeEnabled(),
      isdisabled: async () => await softAssert(await actual).toBeDisabled(),
      doesnotcontain: async () => await softAssert(actual).not.toContain(expected),
      tohavetext: async () => await handleTextAssertion(actual, expected),
      containstext: async () => await handleTextAssertion(actual, expected),

      // Default handler for unknown assertion types
      default: () => {
        const errorMsg = `Invalid assertion type: "${assertionType}". Valid assertion types are: "equals", "contains", "exists", "isenabled", "isdisabled", "doesnotexist", "doesnotcontain", "tohavetext", "containstext".`;
        throw new Error(errorMsg);
      }
    };
    await (getAssertionType[assertionType] || getAssertionType['default'])();
    message = `Assertion Passes: Valid Assertion Type = ${assertionType}`;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:green;"> ${message} </div>`);
    }
  } catch (err) {
    const filteredActual = actual.replace(/[<>]/g, '');
    const errmsg =
      `Assertion Failure: Invalid Assertion Type = ${assertionType}` +
      '\n' +
      `Assertion failed: expected ${filteredActual} to ${assertionType} ${expected}`;
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
    }
    errors.push(err); // Collect the error
  }
}

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

// Function to throw collected errors at the end of the test run
function throwCollectedErrors() {
  if (errors.length > 0) {
    const errorMessages = errors.map(err => err.message).join('\n');
    const formattedErrorMessages = errors.map(err => {
      const match = err.message.match(/Expected substring: (.*)\nReceived string: (.*)/);
      if (match) {
        return `Expected substring: ${match[1]}\nReceived string: ${match[2]}`;
      }
      return err.message;
    }).join('\n');
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:red;">Collected assertion errors:\n${formattedErrorMessages}</div>`);
    }
    throw new Error(`Collected assertion errors:\n${formattedErrorMessages}`);
  } else {
    if (cucumberThis && cucumberThis.attach) {
      cucumberThis.attach(`<div style="color:green;">No assertion errors collected.</div>`);
    }
  }
}



// TODO: add function to record failed assertions and pass it to the end so that the test fails.
/**
 * This function makes using assert easier by just passing the assertion type and values
 * it will not fail the test right away but allow the other asserts to be executed
 * @param assertionType {string}
 * @param actual {mixed}
 * @param expected {any}
 * @param message {string}
 * @param operator {any}
 * @returns {Promise<void>}
 */
async function assertAdv(actual, assertionType, expected, message, operator){
  await expectAdv(actual, assertionType, expected, message, operator);
};


// /**
//  * This function makes using expect easier by just passing the assertion type and values
//  * it will not fail the test right away but allow the other expects to be executed
//  * @param assertionType {string}
//  * @param actual {any}
//  * @param expected {any}
//  * @param message {string}
//  * @param operator {any}
//  * @returns {Promise<void>}
//  */
// async function expectAdv(actual, assertionType, expected = '', message = '', operator = '') {
//   const { expect } = await import('expect-webdriverio');
//   const softAssert = expect;
//   let msg;
//   try {
//     const getAssertionType = {
//       isDisplayed: async () => (await softAssert(await actual).toBeDisplayed()),
//       isExisting: () => softAssert(actual).toExist(),
//       toBePresent: async () => (await softAssert(await actual).toBePresent()),
//       toBeExisting: () => softAssert(actual).toBeExisting(),
//       toBeFocused: () => softAssert(actual).toBeFocused(),
//
//       equal: () => softAssert(actual).to.equal(expected),
//       contain: () => softAssert(actual).to.contain(expected),
//       doesNotExist: () => softAssert(actual, message).to.not.exist,
//       doesNotContain: () => softAssert(actual).to.not.contain(expected),
//       oneOf: () => softAssert(actual).to.be.oneOf(expected),
//       toInclude: () => softAssert(actual).to.include(expected),
//       toNotEqual: () => softAssert(actual).to.not.equal(expected, message),
//
//       exists: async () => (await softAssert(await actual).toBeExisting()),
//       isClickable: async () => (await softAssert(await actual).isClickable),
//       include: () => assert.include(actual, expected),
//       isTrue: () => assert.isTrue(actual, message),
//       isFalse: () => assert.isFalse(actual, message),
//       fail: () => assert.fail(actual, expected, message, operator),
//       isAbove: () => assert.isAbove(actual, expected, message),
//       default: () => console.info('Invalid assertion type: =======>>>>>>>>>>> ', assertionType),
//     };
//     (getAssertionType[assertionType] || getAssertionType['default'])();
//     msg = `Assertion Passes: Valid Assertion Type = ${assertionType}`;
//     cucumberThis.attach(`<div style="color:green;"> ${msg} </div>`);
//   } catch (err) {
//     const filteredActual = actual.replace(/[<>]/g, '');
//     msg =
//       `Assertion Failure: Invalid Assertion Type = ${assertionType}` +
//       '\n' +
//       `Assertion failed: expected ${filteredActual} to ${assertionType} ${expected}`;
//     cucumberThis.attach(`<div style="color:red;"> ${msg} </div>`);
//   }
// }
//
// // TODO: add function to record failed assertions and pass it to the end so that the test fails.
// /**
//  * This function makes using assert easier by just passing the assertion type and values
//  * it will not fail the test right away but allow the other asserts to be executed
//  * @param assertionType {string}
//  * @param actual {mixed}
//  * @param expected {any}
//  * @param message {string}
//  * @param operator {any}
//  * @returns {Promise<void>}
//  */
// async function assertAdv(assertionType, actual, expected = '', message = '', operator = '') {
//   await expectAdv(assertionType, actual, expected, message, operator);
// }

// /**
//  * This will assert text being returned
//  * @param selector
//  * @param expected
//  */
// async function assertText(selector, expected) {
//   let actual = await browser.$(selector);
//   await actual.getText();
//   actual = actual.trim();
//   await expectAdv('equal', actual, expected);
//   return this;
// }

//   /**
//    * This will assert text being returned includes
//    * @param selector
//    * @param expectedText
//    */
//   async function expectToIncludeText(selector, expectedText) {
//   const actual = await browser.$(selector);
//   await actual.getText();
//   await expectAdv('include', elem.length, 0);
//   expect(actual).to.include(expectedText);
//   return this;
// }

module.exports = { expectAdv, assertAdv, throwCollectedErrors };
