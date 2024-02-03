# @jackdbd/eleventy-plugin-plausible

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible)
[![install size](https://packagephobia.com/badge?p=@jackdbd/eleventy-plugin-plausible)](https://packagephobia.com/result?p=@jackdbd/eleventy-plugin-plausible)
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
| `cacheDirectory` | `".cache-plausible-json-responses"` | Directory where to store JSON responses coming from the Plausible API. |
| `cacheDuration` | `"1d"` | How long to cache JSON responses for. See details on the [eleventy-fetch documentation](https://www.11ty.dev/docs/plugins/fetch/#change-the-cache-duration). |
| `cacheVerbose` | `false` | Whether to log requested remote URLs to the console. |
| `statsBreakdownGlobalDataKey` | `"plausibleStatsBreakdown"` | Key that this plugin should add to the `eleventyConfig.globalData` object. |
| `statsBreakdownLimit` | `10` | Number of results to return from the Plausible `/stats` API endpoint. |
| `statsBreakdownMetrics` | `"visitors"` | Comma-separated list of [metrics](https://plausible.io/docs/stats-api#metrics) to return from the Plausible /stats API endpoint. See [here](https://plausible.io/docs/metrics-definitions) for all plausible.io metrics and their definitions. |
| `statsBreakdownPeriod` | `"30d"` | See [Time periods](https://plausible.io/docs/stats-api#time-periods) on the Plausible API docs for details. |
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
| [zod](https://www.npmjs.com/package/zod) | `^3.22.4` |
| [zod-validation-error](https://www.npmjs.com/package/zod-validation-error) | `^3.0.0` |

## License

&copy; 2022 - 2024 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
