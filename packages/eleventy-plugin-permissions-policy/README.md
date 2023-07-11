# @jackdbd/eleventy-plugin-permissions-policy

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-permissions-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-permissions-policy)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-plugin-permissions-policy)

Eleventy plugin for the [Permissions-Policy](https://w3c.github.io/webappsec-permissions-policy/) and [Feature-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy) headers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details><summary>Table of Contents</summary>

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Required parameters](#required-parameters)
  - [Options](#options)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
</details>

## Installation

```sh
npm install --save-dev @jackdbd/eleventy-plugin-permissions-policy
```

## Usage

```js
const { permissionsPolicyPlugin } = require('@jackdbd/eleventy-plugin-permissions-policy')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(permissionsPolicyPlugin, {
    directives: [
      { feature: 'autoplay', allowlist: ['*'] },
      { feature: 'geolocation', allowlist: ['self'] },
      { feature: 'camera', allowlist: ['self', 'https://trusted-site.example'] },
      { feature: 'fullscreen', allowlist: [] }
    ],
    includeFeaturePolicy: true
  })

  // some more eleventy configuration...
}
```

## Configuration

Read these resources to understand how to configure these HTTP response headers.

- [A new security header: Feature Policy](https://scotthelme.co.uk/a-new-security-header-feature-policy/)
- [Goodbye Feature Policy and hello Permissions Policy!](https://scotthelme.co.uk/goodbye-feature-policy-and-hello-permissions-policy/)
- [Permissions Policy Explainer](https://github.com/w3c/webappsec-permissions-policy/blob/main/permissions-policy-explainer.md)
- [Policy Controlled Features](https://github.com/w3c/webappsec-permissions-policy/blob/main/features.md)
- [Controlling browser features with Permissions Policy](https://developer.chrome.com/en/docs/privacy-sandbox/permissions-policy/)

### Required parameters

None.

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `directives` | `[]` | [Policy directives](https://w3c.github.io/webappsec-permissions-policy/#policy-directives). |
| `excludePatterns` | `[]` | Files that match these patterns will **not** be served with the Permissions-Policy header (nor with the Feature-Policy header, if generated). |
| `includePatterns` | `['/', '/*/']` | Files that match these patterns will be served with the Permissions-Policy header (and also with the Feature-Policy header, if generated). |
| `jsonRecap` | `false` | Whether to write a JSON containing the configuration of this plugin. This can useful for troubleshooting the permissions policy and/or to consume it with some other tool. |
| `includeFeaturePolicy` | `true` | Whether to generate also a Feature-Policy header. |
