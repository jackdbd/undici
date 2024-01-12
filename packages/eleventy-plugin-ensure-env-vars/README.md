# @jackdbd/eleventy-plugin-ensure-env-vars

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-plugin-ensure-env-vars)

Eleventy plugin that checks environment variables before Eleventy builds your site.

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
npm install --save-dev @jackdbd/eleventy-plugin-ensure-env-vars
```

## Usage

```js
const { ensureEnvVarsPlugin } = require('@jackdbd/eleventy-plugin-ensure-env-vars')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(ensureEnvVarsPlugin, {
    envVars: ['DEBUG', 'ELEVENTY_ENV', 'NODE_ENV']
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
| `envVars` | `['ELEVENTY_ENV', 'NODE_ENV']` | environment variables to check before the Eleventy build. |

## Trobleshooting

This plugin declares [debug](https://github.com/debug-js/debug) as a peer dependency. Since Eleventy itself declares `debug` in [its dependencies](https://github.com/11ty/eleventy/blob/main/package.json), there is no need for you to declare `debug` as a direct dependency in your project.

You can selectively enable debug logging for each module of this plugin. For example:

```sh
export DEBUG="11ty-plugin:ensure-env-vars:*"
```
