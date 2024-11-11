/**
 * This is the function for performing asserts and passing the results to the report
 * @param actual
 * @param assertionType
 * @param expected
 */

// async function expectAdv(
//   actual = WebdriverIO.Element | string,
//   assertionType = AssertionType,
//   expected = any
// ) {
//   // Early exit if the test has already ended
//   // if (ASB.get("TEST_ENDED")) {
//   //   await log(`WARN: Assertion ${assertionType} skipped because the test has already ended`);
//   //   return;
//   // }
//
//   let invalidAssertion = false;
//   let failed = false;
//   let errorMessage = "";
//
//   const softAssert = expect; // Alias for Jest expect function
//   assertionType = assertionType.replace(/\s+/g, "").toLowerCase();
//
//   // Helper function to add allure attachments
//   // const addAllureAttachment = (title: string, content: string) => {
//   //   allureReporter.addAttachment(title, content, 'text/plain');
//   // };
//
//   // Helper function to handle logging and errors
//   // const handleFailure = async ({ title = '', content}) => {
//   //   // ASB.set("alreadyFailed", true);
//   //   console.log(title);
//   //   // addAllureAttachment(title, content);
//   // };
//
//   // Define possible assertion actions
//   const getAssertionAction = {
//     equals: async () => await softAssert(actual).toEqual(expected),
//     contains: async () => await softAssert(actual).toContain(expected),
//     exists: async () => await softAssert(await actual).toBeExisting(),
//     doesexist: async () => await softAssert(await actual).toBeExisting(),
//     doesnotexist: async () => await softAssert(await actual).not.toBeExisting(),
//     isenabled: async () => await softAssert(await actual).toBeEnabled(),
//     isnotenabled: async () => await softAssert(await actual).not.toBeEnabled(),
//     isdisabled: async () => await softAssert(await actual).toBeDisabled(),
//     doesnotcontain: async () => await softAssert(actual).not.toContain(expected),
//     tohavetextcontaining: async () => await softAssert(actual).toHaveTextContaining(expected),
//     containstext: async () => await softAssert(actual).toHaveTextContaining(expected),
//
//     // Default handler for unknown assertion types
//     default: async () => {
//       // invalidAssertion = true;
//       // failed = true;
//       const errorMsg = `Invalid assertion type: "${assertionType}". Valid assertion types are: "equals", "contains", "exists", "isenabled", "isdisabled", "doesnotexist", "doesnotcontain", "tohavetextcontaining", "containstext".`;
//       await handleFailure({ title: 'Assertion Failure ########################## 456', content: errorMsg });
//     }
//   };
//
//   // Perform the assertion or handle unknown assertion types
//   // try {
//   //   const assertionAction = getAssertionAction[assertionType] || getAssertionAction['default'];
//   //   await assertionAction();
//   //
//   //   // Logging for successful assertions
//   //   if (!invalidAssertion && !failed) {
//   //     // addAllureAttachment(`Assertion Pass`, `"${actual}" ${assertionType} "${expected}"`);
//   //     const passMessage = `PASS ######################: "${actual}" ${assertionType} "${expected}"`;
//   //     await log(passMessage);
//   //   }
//   //
//   // } catch (error) {
//   //   // Handle failure logging and reporting based on the type of assertion
//   //   if (expected === null) {
//   //     // const failMessage = `FAIL: Selector "${ASB.get("ELEMENT_SELECTOR")}" ${assertionType} - ${error}`;
//   //     const failMessage = `FAIL: Selector ${assertionType} - ${error}`;
//   //     handleFailure({ title: 'Object Assertion Error ######################', content: failMessage });
//   //   } else {
//   //     let failMessage = `FAIL: "${actual}" ${assertionType} "${expected}" - ${error}`;
//   //     await handleFailure({ title: 'This is the String Assertion Error ################# 10', content: failMessage });
//   //   }
//
//     // if (!ASB.get("SOFT_ASSERT")) {
//     //   throw error; // Rethrow to fail the test if not in soft assert mode
//     // }
//   // } finally {
//   //   // allureReporter.endStep();
//   // }
// }

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
    cucumberThis.attach(`<div style="color:green;"> ${message} </div>`);
  } catch (err) {
    const filteredActual = actual.replace(/[<>]/g, '');
    const errmsg =
      `Assertion Failure: Invalid Assertion Type = ${assertionType}` +
      '\n' +
      `Assertion failed: expected ${filteredActual} to ${assertionType} ${expected}`;
    cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
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
async function throwCollectedErrors() {
  if (errors.length > 0) {
    const errorMessages = errors.map(err => err.message).join('\n');
    cucumberThis.attach(`<div style="color:red;">Collected assertion errors:\n${errorMessages}</div>`);
    throw new Error(`Collected assertion errors:\n${errorMessages}`);
  } else {
    cucumberThis.attach(`<div style="color:green;">No assertion errors collected.</div>`);
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