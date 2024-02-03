# @jackdbd/eleventy-plugin-ensure-env-vars

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars)
[![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-ensure-env-vars)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-ensure-env-vars)
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
| `envVars` | `["DEBUG","ELEVENTY_ROOT","ELEVENTY_SOURCE","ELEVENTY_RUN_MODE","NODE_ENV"]` | Environment variables you want to be set when building your Eleventy site |

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
| [zod](https://www.npmjs.com/package/zod) | `^3.22.4` |
| [zod-validation-error](https://www.npmjs.com/package/zod-validation-error) | `^3.0.0` |

## License

&copy; 2022 - 2024 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
