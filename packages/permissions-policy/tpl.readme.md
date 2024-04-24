# {{pkg.name}}

<!-- {{badges}} -->

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

## About

This library allows you to define a [Permissions-Policy](https://w3c.github.io/webappsec-permissions-policy/) and a [Feature-Policy](https://developer.mozilla.org/en-US/docs/Web/API/FeaturePolicy) in JavaScript, and then it generates the corresponding headers for you.

{{pkg.docs}}

## Usage

Here is how you can generate a `Permissions-Policy` header:

```ts
import { permissionsPolicy } from '@jackdbd/permissions-policy'

const { error, value } = permissionsPolicy({
  features: {
    bluetooth: [],
    camera: ['self'],
    fullscreen: ['*'],
    microphone: ['self', 'https://*.example.com']
  },
  reportingEndpoint: 'permissions_policy'
})
```

Since at the moment [browser support for Permissions-Policy](https://caniuse.com/?search=Permissions-Policy) is [not as wide as for Feature-Policy](https://caniuse.com/?search=Feature-Policy), it's probably a good idea to generate `Feature-Policy` too. This library has you covered:

```ts
import { featurePolicy } from '@jackdbd/permissions-policy'

const { error, value } = featurePolicy({
  features: {
    bluetooth: [],
    camera: ['self'],
    fullscreen: ['*'],
    microphone: ['self', 'https://*.example.com']
  }
})
```

{{configuration}}

## Troubleshooting

This library uses [debug](https://github.com/debug-js/debug) for logging.
You can control what's logged using the `DEBUG` environment variable.

For example, if you set your environment variables in a `.envrc` file, you can do:

```sh
export DEBUG=permissions-policy
```

If you are trying to configure `Permissions-Policy` or `Feature-Policy` with one or more features not implemented in this library, you can opt out of the schema validation by setting the environment variable `SKIP_VALIDATION` to `1`.

```sh
export SKIP_VALIDATION=1
```

{{pkg.deps}}

{{pkg.peerDependencies}}

{{pkg.license}}
