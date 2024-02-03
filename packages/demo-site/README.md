# @jackdbd/demo-site

11ty site to test and showcase the usage of several 11ty plugins.

The site is deployed on [Cloudflare Pages](https://pages.cloudflare.com/) at https://undici.pages.dev/

> :warning: **Environment variables on Cloudflare Pages**
>
> Don't forget to set these [environment variables on Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables):
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

## Credits

- [CSS Remedy](https://github.com/jensimmons/cssremedy) for CSS resets.
- [Lorem Ipsum generator with english translation](https://www.lipsum.com/)
