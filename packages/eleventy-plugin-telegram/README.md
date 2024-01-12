# @jackdbd/eleventy-plugin-telegram

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-telegram)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-plugin-telegram)](https://security.snyk.io/vuln?search=%40jackdbd%2Feleventy-plugin-telegram)

Eleventy plugin that sends Telegram messages when Eleventy starts/finishes building your site.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details><summary>Table of Contents</summary>

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Trobleshooting](#trobleshooting)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
</details>

## Installation

```sh
npm install --save-dev @jackdbd/eleventy-plugin-telegram
```

## Usage

In your Eleventy config file:

```js
import { telegramPlugin } from '@jackdbd/eleventy-plugin-telegram'

export default function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(telegramPlugin, {
    chatId: 'YOUR_TELEGRAM_CHAT_ID', // or set process.env.TELEGRAM_CHAT_ID and leave this undefined
    token: 'YOUR_TELEGRAM_BOT_TOKEN', // or set process.env.TELEGRAM_TOKEN and leave this undefined
    textBeforeBuild: '⏱️ 11ty <b>started</b> building my website',
    textAfterBuild: '🏁 11ty <b>finished</b> building my website'
  })

  // some more eleventy configuration...
}
```

See Telegram [sendMessage](https://core.telegram.org/bots/api#sendmessage) API method for formatting options.

## Options

| Option | Default | Explanation |
| --- | --- | --- |
| `chatId` | `process.env.TELEGRAM_CHAT_ID` | Your Telegram chat ID  |
| `token` | `process.env.TELEGRAM_TOKEN` | Your Telegram Bot token. |
| `textBeforeBuild` | `undefined` | Text message to send when Eleventy starts building the site. |
| `textAfterBuild` | `undefined` | Text message to send when Eleventy finishes building the site. |

If you forgot the API token of a Telegram bot you created, you can retrieve it at any time using BotFather. Just go to `BotFather > bot list > API token`.

> :warning: **A few things to keep in mind**
>
> - Telegram messages can be 1-4096 characters long, after entities parsing. See [formatting options here](https://core.telegram.org/bots/api#formatting-options).
> - Depending on the environment your building your 11ty website in, this plugin might not be able to send you the text message defined in `textAfterBuild`. For example, when building on Cloudflare Pages, I always receive the `textBeforeBuild` text, but not always the `textAfterBuild` text. My guess is that Cloudflare kills the Node.js process before all event handlers registered with `eleventy.after` are resolved.

## Trobleshooting

This plugin declares [debug](https://github.com/debug-js/debug) as a peer dependency. Since Eleventy itself declares `debug` in [its dependencies](https://github.com/11ty/eleventy/blob/main/package.json), there is no need for you to declare `debug` as a direct dependency in your project.

You can selectively enable debug logging for each module of this plugin. For example:

```sh
export DEBUG="11ty-plugin:telegram:*,-11ty-plugin:telegram:index"
```
