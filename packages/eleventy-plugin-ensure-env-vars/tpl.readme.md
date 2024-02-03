# {{pkg.name}}

{{badges}}

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

{{pkg.peerDependencies}}

## Usage

In your Eleventy config file:

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

{{configuration}}

{{troubleshooting}}

{{pkg.deps}}

{{pkg.license}}
