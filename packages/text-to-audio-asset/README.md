# @jackdbd/text-to-audio-asset

<!-- [![npm version](https://badge.fury.io/js/@jackdbd%2Ftext-to-audio-asset.svg)](https://badge.fury.io/js/@jackdbd%2Ftext-to-audio-asset)
[![install size](https://packagephobia.com/badge?p=@jackdbd/text-to-audio-asset)](https://packagephobia.com/result?p=@jackdbd/text-to-audio-asset)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/text-to-audio-asset)](https://socket.dev/npm/package/@jackdbd/text-to-audio-asset) -->

Generate an audio asset from a text.

- [Installation](#installation)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install @jackdbd/text-to-audio-asset
```

> :warning: **Peer Dependencies**
>
> This package defines 6 peer dependencies.

| Peer | Version range |
|---|---|
| `@11ty/eleventy` | `>=2.0.0 or 3.0.0-alpha.4` |
| `@aws-sdk/client-s3` | `>=3.0.0` |
| `@aws-sdk/lib-storage` | `>=3.0.0` |
| `@google-cloud/storage` | `>=7.0.0` |
| `@google-cloud/text-to-speech` | `>=5.0.0` |
| `debug` | `>=4.0.0` |

## Usage

TODO

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
