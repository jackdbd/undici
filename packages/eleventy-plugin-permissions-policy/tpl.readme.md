# {{pkg.name}}

{{badges}}

{{pkg.description}}

<!-- toc -->

## About

Eleventy plugin for the [Permissions-Policy](https://w3c.github.io/webappsec-permissions-policy/) and [Feature-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy) headers.

{{pkg.installation}}

{{pkg.docs}}

## Usage

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
