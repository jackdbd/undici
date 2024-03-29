/**
 * Configuration for commitlint.
 *
 * commitlint checks if your commit messages meet the conventional commit format.
 *
 * Here is the template of a commit message:
 * type(scope?): subject
 *
 * scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")
 *
 * See here for examples of conventional commit messages that trigger a
 * patch/minor/major release with semantic-release:
 * https://www.conventionalcommits.org/en/v1.0.0/#summary
 *
 * <type>[optional scope]: <description>
 *
 * [optional body]
 *
 * [optional footer(s)]
 */

const config = {
  // https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional
  extends: ['@commitlint/config-conventional'],

  // The first commit message of this git repo is "initial commit". Since it has
  // no subject, it would throw an error because there is a rule in the
  // @commitlint/config-conventional preset that disallows empty subjects. Since
  // I don't care about the commit message of the first commit, I ignore it.
  // There are also a few commit messages that have a header a bit too long.
  ignores: [
    (message) => {
      return (
        message.includes('initial commit') ||
        message.includes(
          'feat(eleventy-plugin-text-to-speech): new API that uses rules with regexes'
        ) ||
        message.includes(
          'feat(eleventy-plugin-text-to-speech): allow hosting audio files on Cloud Storage'
        ) ||
        message.includes('chore(eleventy-plugin-text-to-speech): release') ||
        message.includes('chore(eleventy-plugin-ensure-env-vars): release') ||
        message.includes('eleventy-plugin-content-security-policy') ||
        message.includes('eleventy-plugin-permissions-policy')
      )
    }
  ],

  // reference for commitlint rules:
  // https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md
  //
  // rules of the @commitlint/config-conventional preset:
  // https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional
  //
  // The first element in the rule array is the LEVEL. It can be 0, 1 or 2.
  // Here is what a level means:
  // 0 => disables the rule. 1 => warning. 2 => error
  rules: {
    // I configured semantic-release git plugin to create a release commit
    // message containing release notes in the commit body. This might exceed
    // the limit set by the config-conventional preset. Since I don't think it's
    // a problem to have a long commit message body, I disable the rule.
    'body-max-line-length': [0],
    // From now on, the header of each commit message should not exceed 72
    // characters. A few old commits have a header that exceeds 72 characters,
    // but I ignore those commit messages "manually" using the `ignores` array.
    'header-max-length': [2, 'always', 72]
  }
}

// console.log('=== commitlint ===', config)

module.exports = config
