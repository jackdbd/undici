# @jackdbd/eleventy-telegram-plugin

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-telegram-plugin.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-telegram-plugin)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-telegram-plugin)

Eleventy plugin that send messages to a Telegram chat of your choice.

## Installation

```sh
npm install --save-dev @jackdbd/eleventy-telegram-plugin
```


## Usage

```js
const { telegramPlugin } = require('@jackdbd/eleventy-telegram-plugin')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(telegramPlugin, {
    chatId: 'YOUR_TELEGRAM_CHAT_ID',
    token: 'YOUR_TELEGRAM_BOT_TOKEN',
    textBeforeBuild: '11ty have just started building my site',
    textAfterBuild: '11ty has finished building my awesome site'
  })

  // some more eleventy configuration...
}
```

See Telegram [sendMessage](https://core.telegram.org/bots/api#sendmessage) API method for formatting options.