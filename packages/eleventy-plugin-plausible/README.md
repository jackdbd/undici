# @jackdbd/eleventy-plugin-plausible

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible)
[![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-plausible)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-plausible)
[![CodeCov badge](https://codecov.io/gh/jackdbd/undici/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/undici?flags%5B0%5D=eleventy-plugin-plausible)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/eleventy-plugin-plausible)](https://socket.dev/npm/package/@jackdbd/eleventy-plugin-plausible)

Eleventy plugin that retrieves analytics from Plausible when building your site.

- [Installation](#installation)
- [About](#about)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Plugin options](#plugin-options)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install @jackdbd/eleventy-plugin-plausible
```

**Note**: this library was tested on Node.js >=18. It might work on other Node.js versions though.

## About

This plugin retrieves analytics data from the [Plausible API](https://plausible.io/docs/stats-api), caches it, then makes it available using an [Eleventy global data key](https://www.11ty.dev/docs/data-global-custom/) of your choice.

## Usage

Configure this plugin with your Plausible API key and site ID, and then the options for analytics and caching.

```js
import { plausiblePlugin } from '@jackdbd/eleventy-plugin-plausible'

export default function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(plausiblePlugin, {
    apiKey: 'YOUR-API-KEY',
    siteId: 'YOUR-SITE-ID',
    cacheDuration: '30m',
    cacheVerbose: true,
    statsBreakdownPeriod: '7d'
  })

  // some more eleventy configuration...
}
```

Then use it in your Eleventy config...

```js
eleventyConfig.on('eleventy.after', async () => {
  const breakdown = await eleventyConfig.globalData.plausibleStatsBreakdown()
  console.log('stats breakdown from Plausible', breakdown)
})
```

...or in your templates (here is an example with nunjucks):

```html
<p>Breakdown from Plausible analytics.</p>
<ul>
{%- for item in plausibleStatsBreakdown -%}
  <li>
    <a href="{{ item.page | url }}">
      {% if item.page %}
        <span>{{ item.page | slugify }}</span> <span>({{ item.visitors }} visitors)</span>
      {% else %}
        Untitled page
      {% endif %}
    </a>
  </li>
{%- endfor -%}
</ul>
```

## Configuration

### Plugin options

| Key | Default | Description |
|---|---|---|
| `apiKey` | `undefined` | Your Plausible account API key. |
| `cacheDirectory` | `undefined` | Directory where to store JSON responses coming from the Plausible API. |
| `cacheDuration` | `undefined` | How long to cache JSON responses for. See details on the [eleventy-fetch documentation](https://www.11ty.dev/docs/plugins/fetch/#change-the-cache-duration). |
| `cacheVerbose` | `undefined` | Whether to log requested remote URLs to the console. |
| `statsBreakdownGlobalDataKey` | `undefined` | Key that this plugin should add to the `eleventyConfig.globalData` object. |
| `statsBreakdownLimit` | `undefined` | Number of results to return from the Plausible `/stats` API endpoint. |
| `statsBreakdownMetrics` | `undefined` | Comma-separated list of [metrics](https://plausible.io/docs/stats-api#metrics) to return from the Plausible /stats API endpoint. See [here](https://plausible.io/docs/metrics-definitions) for all plausible.io metrics and their definitions. |
| `statsBreakdownPeriod` | `undefined` | See [Time periods](https://plausible.io/docs/stats-api#time-periods) on the Plausible API docs for details. |
| `siteId` | `undefined` | The domain of your site as configured in Plausible. |

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
| [@jackdbd/plausible-client](https://www.npmjs.com/package/@jackdbd/plausible-client) | `^1.0.2` |
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
