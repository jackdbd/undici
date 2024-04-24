# {{pkg.name}}

<!-- {{badges}} -->

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

## Usage

Let's say that you are hosting your Eleventy site on Vercel and that you want to programmatically add a `Content-Security-Policy` header to a bunch of routes. You could do something like this:

```ts
import { updateVercelJSON } from '@jackdbd/hosting-utils'

await updateVercelJSON({
  headerKey: 'Content-Security-Policy',
  headerValue: "default-src 'self'; img-src 'self' cdn.example.com;",
  filepath: '_site/vercel.json',
  sources: ['/(404|index).html', '/posts/**/*.html']
})
```

{{configuration}}

## Troubleshooting

This plugin uses the [debug](https://github.com/debug-js/debug) library for logging.
You can control what's logged using the `DEBUG` environment variable.

For example, if you set your environment variables in a `.envrc` file, you can do:

```sh
# print all logging statements
export DEBUG=hosting-utils:*
```

{{pkg.deps}}

{{pkg.peerDependencies}}

{{pkg.license}}
