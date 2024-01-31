# @jackdbd/eleventy-plugin-plausible

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-plausible)

Eleventy plugin that retrieves analytics data from the [Plausible API](https://plausible.io/docs/stats-api), caches it, and makes it available using an [Eleventy global data key](https://www.11ty.dev/docs/data-global-custom/) of your choice.

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
npm install --save-dev @jackdbd/eleventy-plugin-plausible
```

## Usage

Configure the plugin with your Plausible API key and site ID, and the options you want.

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

### Required parameters

| Parameter | Explanation |
| --- | --- |
| `apiKey` | Your Plausible account API key. |
| `siteId` | The domain of your site as configured in Plausible. |

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `cacheDirectory` | `.cache-plausible-json-responses` | Directory where to store JSON responses coming from the Plausible API. |
| `cacheDuration` | `1d` | How long to cache JSON responses for. See details on the [eleventy-fetch documentation](https://www.11ty.dev/docs/plugins/fetch/#change-the-cache-duration). |
| `cacheVerbose` | `false` | Whether to log requested remote URLs to the console. |
| `statsBreakdownGlobalDataKey` | `plausibleStatsBreakdown` | Key that this plugin should add to the `eleventyConfig.globalData` object. |
| `statsBreakdownLimit` | `10` | Number of results to return from the Plausible `/stats` API endpoint. |
| `statsBreakdownMetrics` | `visitors` | Comma-separated list of [metrics](https://plausible.io/docs/stats-api#metrics) to return from the Plausible `/stats` API endpoint. See [here](https://plausible.io/docs/metrics-definitions) for all plausible.io metrics and their definitions. |
| `statsBreakdownPeriod` | `30d` | todo. See [Time periods](https://plausible.io/docs/stats-api#time-periods) on the Plausible API docs for details. |
