# @jackdbd/demo-site

11ty site to test and showcase the usage of several 11ty plugins.

The site is deployed on [Cloudflare Pages](https://pages.cloudflare.com/) at https://undici.pages.dev/

> :warning: **IMPORTANT information about the deployment on Cloudflare Pages**
>
> Use the [V2 build system](https://developers.cloudflare.com/pages/configuration/language-support-and-tools/).
>
> Set these [environment variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables):
>
> - `DEBUG` (always include `Eleventy:EleventyErrorHandler` to log build errors)
> - `NODE_ENV` (always use `production`, [as Matteo Collina suggests in this video](https://youtu.be/HMM7GJC5E2o?si=ofyi78QbZjtArAju))
> - `NODE_VERSION` (use the [Active LTS version of Node.js](https://nodejs.org/en/about/previous-releases))

## Development

Note: run each command from the monorepo root.

Build all libraries and the demo site, both in watch mode, and serve the demo site:

```sh
npm run dev
```

Watch eleventy-plugin-text-to-speech and the demo site, and serve the demo site:

```sh
npm run dev:site:tts
```

Copy the build of [eleventy-test-utils](../eleventy-test-utils/README.md) to `demo site/eleventy-test-utils`, so they are available on Cloudflare Pages:

```sh
npm run site:copy-utils
```

## Troubleshooting

Eleventy prints this very unintuitive error message [when it cannot find its configuration file](https://github.com/11ty/eleventy/issues/1211#issuecomment-1488904452):

```sh
TemplateLayoutPathResolver directory does not exist...
```

Double check that Eleventy is using the configuration file you'd expect, and always use the `--config` flag to specify it.

## Credits

- [CSS Remedy](https://github.com/jensimmons/cssremedy) for CSS resets.
- [Lorem Ipsum generator with english translation](https://www.lipsum.com/)
