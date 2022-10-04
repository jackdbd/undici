const project = (package_name) => {
  // Jest uses chalk for colors
  // https://github.com/chalk/chalk
  let color
  if (package_name.indexOf('telegram') === 0) {
    color = 'blue'
  } else {
    color = 'white'
  }

  // https://jestjs.io/docs/configuration
  return {
    // I like to make Jest stop running tests after a few failures
    // https://jestjs.io/docs/configuration#bail-number--boolean
    bail: 3,

    // https://jestjs.io/docs/configuration#clearmocks-boolean
    clearMocks: true,

    // https://jestjs.io/docs/configuration#displayname-string-object
    displayName: {
      name: package_name,
      color
    },

    // https://jestjs.io/docs/configuration#errorondeprecated-boolean
    errorOnDeprecated: true,

    globals: {},

    moduleFileExtensions: ['cjs', 'js', 'mjs'],

    // The order in which the mappings are defined matters. Patterns are checked
    // one by one until one fits. The most specific rule should be listed first.
    // https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring
    moduleNameMapper: {},

    testMatch: [`<rootDir>/packages/${package_name}/**/*.test.{cjs,js,mjs}`],

    // 5s is the default value for slowTestThreshold, but I keep it here to remember it.
    // https://jestjs.io/docs/configuration#slowtestthreshold-number
    slowTestThreshold: 5,

    // https://jestjs.io/docs/configuration#testenvironment-string
    testEnvironment: 'node',

    // jest-circus/runner is the default value for testRunner, but I keep it here to remember it.
    // https://jestjs.io/docs/configuration#testrunner-string
    testRunner: 'jest-circus/runner',

    // 5000ms is the default value for testTimeout.
    // https://jestjs.io/docs/configuration#testtimeout-number
    testTimeout: 5000,

    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    // https://jestjs.io/docs/ecmascript-modules
    transform: {}
  }
}

// https://jestjs.io/docs/configuration#projects-arraystring--projectconfig
const projects = [
  project('eleventy-plugin-content-security-policy'),
  project('eleventy-plugin-ensure-env-vars'),
  project('eleventy-plugin-telegram'),
  project('eleventy-plugin-text-to-speech')
]

const config = {
  projects,
  // https://jestjs.io/docs/configuration#verbose-boolean
  verbose: true
}

module.exports = config
