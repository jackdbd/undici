# {{pkg.name}}

{{badges}}

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

{{pkg.peerDependencies}}

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

{{configuration}}

{{troubleshooting}}

{{pkg.deps}}

{{pkg.license}}
