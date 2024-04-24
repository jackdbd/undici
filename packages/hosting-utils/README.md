# @jackdbd/hosting-utils

<!-- [![npm version](https://badge.fury.io/js/@jackdbd%2Fhosting-utils.svg)](https://badge.fury.io/js/@jackdbd%2Fhosting-utils)
[![install size](https://packagephobia.com/badge?p=@jackdbd/hosting-utils)](https://packagephobia.com/result?p=@jackdbd/hosting-utils)
[![CodeCov badge](https://codecov.io/gh/jackdbd/undici/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/undici?flags%5B0%5D=hosting-utils)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/hosting-utils)](https://socket.dev/npm/package/@jackdbd/hosting-utils) -->

Utilities for working with the configuration files of various hosting providers.

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install @jackdbd/hosting-utils
```

**Note**: this library was tested on Node.js >=18. It might work on other Node.js versions though.

## Usage

Let's say that you are hosting your Eleventy site on Vercel and that you want to programmatically add a `Content-Security-Policy` header to a bunch of routes. You could do something like this:

```ts
import { updateVercelJSON } from '@jackdbd/hosting-utils'

await updateVercelJSON({
  headerKey: 'Content-Security-Policy',
  headerValue: "default-src 'self'; img-src 'self' cdn.example.com;",
  filepath: '_site/vercel.json',
  sources: ['/(404|index).html', '/posts/**/*.html']
})
```

## Configuration

Read these resources to understand how to configure `_headers`, `serve.json`, `vercel.json`.

- [Attach headers to Cloudflare Pages responses](https://developers.cloudflare.com/pages/configuration/headers/)
- [serve](https://github.com/vercel/serve)
- [serve-handler options](https://github.com/vercel/serve-handler#options)
- [Configure headers in `vercel.json`](https://vercel.com/docs/projects/project-configuration#headers)

## Troubleshooting

This plugin uses the [debug](https://github.com/debug-js/debug) library for logging.
You can control what's logged using the `DEBUG` environment variable.

For example, if you set your environment variables in a `.envrc` file, you can do:

```sh
# print all logging statements
export DEBUG=hosting-utils:*
```

## Dependencies

| Package | Version |
|---|---|
| [netlify-headers-parser](https://www.npmjs.com/package/netlify-headers-parser) | `^7.1.4` |
| [proper-lockfile](https://www.npmjs.com/package/proper-lockfile) | `^4.1.2` |

> ⚠️ **Peer Dependencies**
>
> This package defines 1 peer dependency.

| Peer | Version range |
|---|---|
| `debug` | `>=4.0.0` |

## License

&copy; 2022 - 2024 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
