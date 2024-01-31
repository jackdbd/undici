# @jackdbd/eleventy-plugin-ensure-env-vars

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-ensure-env-vars)

Eleventy plugin that checks environment variables before Eleventy builds your site.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details><summary>Table of Contents</summary>

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Required parameters](#required-parameters)
  - [Options](#options)
- [Trobleshooting](#trobleshooting)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
</details>

## Installation

```sh
npm install --save-dev @jackdbd/eleventy-plugin-ensure-env-vars
```

## Usage

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

### Required parameters

None.

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `envVars` | `['ELEVENTY_ROOT', 'ELEVENTY_SOURCE', 'ELEVENTY_RUN_MODE', 'NODE_ENV']` | environment variables to check before the Eleventy build. |

## Trobleshooting

This plugin declares [debug](https://github.com/debug-js/debug) as a peer dependency. Since Eleventy itself declares `debug` in [its dependencies](https://github.com/11ty/eleventy/blob/main/package.json), there is no need for you to declare `debug` as a direct dependency in your project.

You can enable debug logging for this plugin setting the `DEBUG` environment variable:

```sh
export DEBUG="11ty-plugin:ensure-env-vars"
```
