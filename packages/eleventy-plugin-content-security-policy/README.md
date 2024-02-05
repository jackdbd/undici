# @jackdbd/eleventy-plugin-content-security-policy

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-content-security-policy)
[![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-content-security-policy)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-content-security-policy)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-content-security-policy)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-content-security-policy)

Eleventy plugin that writes Content-Security-Policy and Content-Security-Policy-Report-Only headers to a `_headers` file when Eleventy builds your site.

- [Installation](#installation)
- [About](#about)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install @jackdbd/eleventy-plugin-content-security-policy
```

> :warning: **Peer Dependencies**
>
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@11ty/eleventy` | `>=2.0.0 or 3.0.0-alpha.4` |
| `debug` | `>=4.0.0` |

## About

Hosting providers like [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/) and [Netlify](https://docs.netlify.com/routing/headers/) allow to define custom response headers in a plain text file called `_headers`. This file must be placed in the publish directory of your site (e.g. usually `_site` for a Eleventy site).

This plugin allows you to define a Content-Security-Policy (CSP) or a Content-Security-Policy-Report-Only header in your Eleventy configuration file, and then it automatically writes those headers into your `_headers` file when you build your site.

## Usage

In your Eleventy config file:

```js
import { contentSecurityPolicyPlugin } from '@jackdbd/eleventy-plugin-content-security-policy'

export default function (eleventyConfig) {
  // some other eleventy configuration...

  // use the default CSP directives (not recommended)...
  eleventyConfig.addPlugin(contentSecurityPolicyPlugin)

  // ...or define your CSP directives
  eleventyConfig.addPlugin(contentSecurityPolicyPlugin, {
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

## Troubleshooting

This plugin uses the [debug](https://github.com/debug-js/debug) library for logging.
You can control what's logged using the `DEBUG` environment variable.

For example, if you set your environment variables in a `.envrc` file, you can do:

```sh
# print all logging statements
export DEBUG=11ty-plugin:*
```

## Dependencies

| Package | Version |
|---|---|
| [@jackdbd/content-security-policy](https://www.npmjs.com/package/@jackdbd/content-security-policy) | `2.1.1` |
| [zod](https://www.npmjs.com/package/zod) | `^3.22.4` |
| [zod-validation-error](https://www.npmjs.com/package/zod-validation-error) | `^3.0.0` |

## License

&copy; 2022 - 2024 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
