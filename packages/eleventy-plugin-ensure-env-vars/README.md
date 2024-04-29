# @jackdbd/eleventy-plugin-ensure-env-vars

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars)
[![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-ensure-env-vars)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-ensure-env-vars)
[![CodeCov badge](https://codecov.io/gh/jackdbd/undici/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/undici?flags%5B0%5D=eleventy-plugin-ensure-env-vars)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-ensure-env-vars)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-ensure-env-vars)

Eleventy plugin that checks environment variables before Eleventy builds your site.

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Plugin options](#plugin-options)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install @jackdbd/eleventy-plugin-ensure-env-vars
```

**Note**: this library was tested on Node.js >=18. It might work on other Node.js versions though.

## Usage

In your Eleventy config file:

```js
import { ensureEnvVarsPlugin } from '@jackdbd/eleventy-plugin-ensure-env-vars'

export default function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(ensureEnvVarsPlugin, {
    envVars: ['DEBUG', 'NODE_ENV']
  })

  // some more eleventy configuration...
}
```

## Configuration

### Plugin options

| Key | Default | Description |
|---|---|---|
| `envVars` | `undefined` | Environment variables you want to be set when building your Eleventy site |

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
| [zod](https://www.npmjs.com/package/zod) | `^3.23.0` |
| [zod-validation-error](https://www.npmjs.com/package/zod-validation-error) | `^3.1.0` |

> ⚠️ **Peer Dependencies**
>
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@11ty/eleventy` | `>=2.0.0 or 3.0.0-alpha.6` |
| `debug` | `>=4.0.0` |

## License

&copy; 2022 - 2024 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
