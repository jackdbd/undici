# {{pkg.name}}

{{badges}}

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

{{pkg.peerDependencies}}

## About

Hosting providers like [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/) and [Netlify](https://docs.netlify.com/routing/headers/) allow to define custom response headers in a plain text file called `_headers`. This file must be placed in the publish directory of your site (e.g. usually `_site` for a Eleventy site).

This plugin allows you to define a [Permissions-Policy](https://w3c.github.io/webappsec-permissions-policy/) or a [Feature-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy) header in your Eleventy configuration file, and then it automatically writes those headers into your `_headers` file when you build your site.

{{pkg.docs}}

## Usage

In your Eleventy config file:

```js
import { permissionsPolicyPlugin } from '@jackdbd/eleventy-plugin-permissions-policy'

export default function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(permissionsPolicyPlugin, {
    directives: [
      { feature: 'autoplay', allowlist: ['*'] },
      { feature: 'geolocation', allowlist: ['self'] },
      { feature: 'camera', allowlist: ['self', 'https://trusted-site.example'] },
      { feature: 'fullscreen', allowlist: [] }
    ],
    includeFeaturePolicy: true
  })

  // some more eleventy configuration...
}
```

{{configuration}}

{{troubleshooting}}

{{pkg.deps}}

{{pkg.license}}
