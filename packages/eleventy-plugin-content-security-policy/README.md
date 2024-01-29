# @jackdbd/eleventy-plugin-content-security-policy

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy)

Eleventy plugin that writes a Content-Security-Policy to a `_headers` file.

Hosting providers like [Cloudflare Pages](https://developers.cloudflare.com/pages/platform/headers/) and [Netlify](https://docs.netlify.com/routing/headers/) allow to define custom response headers in a plain text file called `_headers`. This file must be placed in the publish directory of your site (e.g. usually _site for a Eleventy site).

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
npm install --save-dev @jackdbd/eleventy-plugin-content-security-policy
```


## Usage

```js
const cspPlugin = require('@jackdbd/eleventy-plugin-content-security-policy')

module.exports = function (eleventyConfig) {
  // some other eleventy configuration...

  // use the default CSP directives (not recommended)...
  eleventyConfig.addPlugin(cspPlugin)

  // ...or define your CSP directives
  eleventyConfig.addPlugin(cspPlugin, {
    allowDeprecatedDirectives: true,
    
    directives: {
      'base-uri': ['self'],

      // allow only self-hosted fonts (i.e. fonts hosted on this origin)
      'font-src': ['self'],

      // allow scripts hosted on this origin, on plausible.io (analytics),
      // cloudflareinsights.com (analytics), unpkg.com (preact)
      'script-src-elem': [
        'self',
        'https://plausible.io/js/plausible.js',
        'https://static.cloudflareinsights.com/beacon.min.js',
        'https://unpkg.com/htm/preact/standalone.module.js'
      ],

      // allow CSS hosted on this origin, and inline styles that match a sha256
      // hash automatically computed at build time by this 11ty plugin.
      // See also here for the pros and cons of 'unsafe-inline'
      // https://stackoverflow.com/questions/30653698/csp-style-src-unsafe-inline-is-it-worth-it
      'style-src-elem': ['self', 'sha256'],
    },

    // Only .html files should be served with the Content-Security-Policy header. Avoid header bloat by making sure that other files are not served with Content-Security-Policy header.
    globPatternsDetach: ['/*.png'],

    includePatterns: ['/**/**.html']
  })

  // some other eleventy configuration...
}
```

## Configuration

Refer also to the library [@jackdbd/content-security-policy](https://www.npmjs.com/package/@jackdbd/content-security-policy) for the configuration.

### Required parameters

None.

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `allowDeprecatedDirectives` | `false` | whether [deprecated directives](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#deprecated_directives) should be allowed or not. |
| `directives` | `{}` | [Directives](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#directives) for the Content-Security-Policy (or Content-Security-Policy-Report-Only) header. |
| `excludePatterns` | `[]` | Files that match these patterns will **not** be searched. |
| `globPatterns` | `['/', '/*/']` | Files that match these patterns will be searched. |
| `globPatternsDetach` | `[]` | Files that match these patterns will **not** be served with the Content-Security-Policy (or Content-Security-Policy-Report-Only) header. |
| `includePatterns` | `['/**/**.html']` | Files that match these patterns will be served with the Content-Security-Policy (or Content-Security-Policy-Report-Only) header. |
| `jsonRecap` | `false` | whether to write a JSON containing the configuration of this plugin. This can useful for troubleshooting the CSP and/or to consume the CSP with some other tool (e.g. send a Telegram message containing the current CSP directives). |
| `reportOnly` | `false` | whether the policy should be applied to the Content-Security-Policy header, or to the Content-Security-Policy-Report-Only header. |
