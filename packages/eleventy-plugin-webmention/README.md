# @jackdbd/eleventy-plugin-webmention

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-webmention.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-webmention)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-plugin-webmention)

Eleventy plugin that retrieves webmentions from [Webmention.io](https://webmention.io/) when you build your site.

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
npm install --save-dev @jackdbd/eleventy-plugin-webmention
```


## Usage

```js
const { webmentionPlugin } = require('@jackdbd/eleventy-plugin-webmention')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(webmentionPlugin, {
    token: 'your-webmention.io-token'
  })

  // some more eleventy configuration...
}
```

## Configuration

### Required parameters

None.

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `token` | `undefined` | Your Webmention.io token. |
