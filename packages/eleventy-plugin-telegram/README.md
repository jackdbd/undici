# @jackdbd/eleventy-plugin-telegram

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram)
[![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-telegram)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-telegram)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-telegram)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-telegram)

Eleventy plugin that sends Telegram messages when Eleventy starts/finishes building your site.

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install @jackdbd/eleventy-plugin-telegram
```

> :warning: **Peer Dependencies**
>
> This package defines 2 peer dependencies.

| Peer | Version range |
|---|---|
| `@11ty/eleventy` | `>=2.0.0 or 3.0.0-alpha.4` |
| `debug` | `>=4.0.0` |

## Usage

In your Eleventy config file:

```js
import { telegramPlugin } from '@jackdbd/eleventy-plugin-telegram'

export default function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(telegramPlugin, {
    chatId: 'YOUR_TELEGRAM_CHAT_ID', // or set process.env.TELEGRAM_CHAT_ID and leave this undefined
    token: 'YOUR_TELEGRAM_BOT_TOKEN', // or set process.env.TELEGRAM_BOT_TOKEN and leave this undefined
    textBeforeBuild: '⏱️ 11ty <b>started</b> building my website',
    textAfterBuild: '🏁 11ty <b>finished</b> building my website'
  })

  // some more eleventy configuration...
}
```

See Telegram [sendMessage](https://core.telegram.org/bots/api#sendmessage) API method for formatting options.

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `chatId` | `process.env.TELEGRAM_CHAT_ID` | Your Telegram chat ID  |
| `token` | `process.env.TELEGRAM_BOT_TOKEN` | Your Telegram Bot token |
| `textBeforeBuild` | `undefined` | Text message to send when Eleventy starts building the site |
| `textAfterBuild` | `undefined` | Text message to send when Eleventy finishes building the site |

If you forgot the API token of a Telegram bot you created, you can retrieve it at any time using BotFather. Just go to `BotFather > bot list > API token`.

> :warning: **A few things to keep in mind**
>
> - Telegram messages can be 1-4096 characters long, after entities parsing. See [formatting options here](https://core.telegram.org/bots/api#formatting-options).
> - Depending on the environment your building your 11ty website in, this plugin might not be able to send you the text message defined in `textAfterBuild`. For example, when building on Cloudflare Pages, I always receive the `textBeforeBuild` text, but not always the `textAfterBuild` text. My guess is that Cloudflare kills the Node.js process before all event handlers registered with `eleventy.after` are resolved.

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
