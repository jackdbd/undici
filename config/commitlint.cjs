const config = {
  // https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => {
      return message.includes('initial commit')
    }
  ],
  // https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md
  rules: {
    // I configured semantic-release git plugin to create a release commit
    // message containing release notes in the commit body. This would exceed
    // the limit set by the config-conventional preset. So I override the rule.
    // Level is [0..2]: 0 => disables the rule. 1 => warning. 2 => error
    'body-max-line-length': [2, 'always', Infinity]
  }
}

// see here for examples of conventional commit messages that trigger a
// patch/minor/major release with semantic-release.
// https://www.conventionalcommits.org/en/v1.0.0/#summary
//
// <type>[optional scope]: <description>
//
// [optional body]
//
// [optional footer(s)]

module.exports = config
