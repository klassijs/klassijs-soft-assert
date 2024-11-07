/**
 * This function makes using expect easier by just passing the assertion type and values
 * it will not fail the test right away but allow the other expects to be executed
 * @param assertionType {string}
 * @param actual {any}
 * @param expected {any}
 * @param message {string}
 * @param operator {any}
 * @returns {Promise<void>}
 */
async function expectAdv(assertionType, actual, expected = '', message = '', operator = '') {
  const { expect } = await import('expect-webdriverio');
  const softAssert = expect;
  let errmsg;
  try {
    const getAssertionType = {
      equal: () => softAssert(actual).to.equal(expected),
      contain: () => softAssert(actual).to.contain(expected),
      exist: () => softAssert(actual, message).to.exist,
      exists: () => assert.exists(actual, message),
      doesNotExist: () => softAssert(actual, message).to.not.exist,
      doesNotContain: () => softAssert(actual).to.not.contain(expected),
      oneOf: () => softAssert(actual).to.be.oneOf(expected),
      toInclude: () => softAssert(actual).to.include(expected),
      include: () => assert.include(actual, expected),
      isTrue: () => assert.isTrue(actual, message),
      isFalse: () => assert.isFalse(actual, message),
      notEqual: () => softAssert(actual).to.not.equal(expected, message),
      fail: () => assert.fail(actual, expected, message, operator),
      isAbove: () => assert.isAbove(actual, expected, message),
      toBeDisplayed: () => softAssert(actual).toBeDisplayed(),

      default: () => console.info('Invalid assertion type: =======>>>>>>>>>>> ', assertionType),
    };
    (getAssertionType[assertionType] || getAssertionType['default'])();
    errmsg = `Assertion Passes: Valid Assertion Type = ${assertionType}`;
    cucumberThis.attach(`<div style="color:green;"> ${errmsg} </div>`);
  } catch (err) {
    const filteredActual = actual.replace(/[<>]/g, '');
    errmsg =
      `Assertion Failure: Invalid Assertion Type = ${assertionType}` +
      '\n' +
      `Assertion failed: expected ${filteredActual} to ${assertionType} ${expected}`;
    cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
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
async function assertAdv(assertionType, actual, expected = '', message = '', operator = '') {
  await expectAdv(assertionType, actual, expected, message, operator);
}

module.exports = { expectAdv, assertAdv };