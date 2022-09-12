# @jackdbd/eleventy-plugin-text-to-speech

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-plugin-text-to-speech)

Eleventy plugin that synthesizes **any text** you want, on **any page** of your Eleventy site, using the [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech). You can either self-host the audio assets this plugin generates, or host them on [Cloud Storage](https://cloud.google.com/storage).

> :warning: The Cloud Text-to-Speech API has a [limit of 5000 characters](https://cloud.google.com/text-to-speech/quotas).
> 
> See also:
>
> - [this issue of the Wavenet for Chrome extension](https://github.com/wavenet-for-chrome/extension/issues/12)
>
> - [this discussion on Google Groups](https://groups.google.com/g/google-translate-api/c/2JsRdq0tEdA)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details><summary>Table of Contents</summary>

- [Installation](#installation)
- [Preliminary Operations](#preliminary-operations)
  - [Enable the Text-to-Speech API](#enable-the-text-to-speech-api)
  - [Set up authentication via a service account](#set-up-authentication-via-a-service-account)
  - [Optional: Create Cloud Storage bucket (only if you want to host audio files on Cloud Storage)](#optional-create-cloud-storage-bucket-only-if-you-want-to-host-audio-files-on-cloud-storage)
- [Usage](#usage)
  - [Self-hosting the generated audio assets](#self-hosting-the-generated-audio-assets)
  - [Hosting the generated audio assets on Cloud Storage](#hosting-the-generated-audio-assets-on-cloud-storage)
  - [Multiple hosts](#multiple-hosts)
- [Configuration](#configuration)
  - [Required parameters](#required-parameters)
  - [Options](#options)
- [Debug](#debug)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
</details>

## Installation

```sh
npm install --save-dev @jackdbd/eleventy-plugin-text-to-speech
```

## Preliminary Operations

### Enable the Text-to-Speech API

Before you can begin using the Text-to-Speech API, you must enable it. You can enable the API with the following command:

```sh
gcloud services enable texttospeech.googleapis.com
```

### Set up authentication via a service account

This plugin uses the [official Node.js client library for the Text-to-Speech API](https://github.com/googleapis/nodejs-text-to-speech). In order to authenticate to any Google Cloud API you will need some kind of credentials. At the moment this plugin supports only authentication via a service account JSON key.

First, create a service account that can use the Text-to-Speech API. You can also reuse an existing service account if you want. This service account should have the necessary IAM permissions to create/delete objects in a Cloud Storage bucket. You can grant the service account the [Storage Object Admin predefined IAM role](https://cloud.google.com/storage/docs/access-control/iam-roles).

```sh
gcloud iam service-accounts create sa-text-to-speech-user \
  --display-name "Text-to-Speech user SA"
```

Second, [download the JSON key of this service account](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) and store it somewhere safe. Do **not** track this file in git.

### Optional: Create Cloud Storage bucket (only if you want to host audio files on Cloud Storage)

Create a Cloud Storage bucket in your desired [location](https://cloud.google.com/storage/docs/locations). Enable [uniform bucket-level access](https://cloud.google.com/storage/docs/uniform-bucket-level-access) and use the `nearline` [storage class](https://cloud.google.com/storage/docs/storage-classes).

```sh
gsutil mb \
  -p $GCP_PROJECT_ID \
  -l $CLOUD_STORAGE_LOCATION \
  -c nearline \
  -b on \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

If you want, you can check that uniform bucket-level access is **enabled** using this command:

```sh
gsutil uniformbucketlevelaccess get \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

Make the bucket's objects publicly available for read access (otherwise people will not be able to listen/download the audio files):

```sh
gsutil iam ch allUsers:objectViewer \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

## Usage

Let's say that you are hosting your Eleventy website on Cloudflare Pages. Your current deployment is at the URL indicated by the [environment variable](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables) `CF_PAGES_URL`.

### Self-hosting the generated audio assets

If you want to self-host the audio assets that this plugin generates and use all default options, you can register the plugin with this code:

```js
const { plugin: tts } = require('@jackdbd/eleventy-plugin-text-to-speech')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(tts, {
    audioHost: process.env.CF_PAGES_URL
      ? new URL(`${process.env.CF_PAGES_URL}/assets/audio`)
      : new URL('http://localhost:8090/assets/audio')
  })

  // some more eleventy configuration...
}
```

### Hosting the generated audio assets on Cloud Storage

If you want to host the audio assets on a Cloud Storage bucket and configure the rules for the audio matches, you could register the plugin using something like this:

```js
const { plugin: tts } = require('@jackdbd/eleventy-plugin-text-to-speech')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(tts, {
    audioHost: {
      bucketName: 'some-bucket-containing-publicly-readable-files'
    },
    rules: [
      // synthesize the text contained in all <h1> tags, in all posts
      {
        regex: new RegExp('posts\\/.*\\.html$'),
        cssSelectors: ['h1']
      },
      // synthesize the text contained in all <p> tags that start with "Once upon a time", in all HTML pages, except the 404.html page
      {
        regex: new RegExp('^((?!404).)*\\.html$'),
        xPathExpressions: ['//p[starts-with(., "Once upon a time")]']
      }
    ],
    voice: 'en-GB-Wavenet-C'
  })

  // some more eleventy configuration...
}
```

### Multiple hosts

If you want to host the generated audio assets on multiple hosts, register this plugin multiple times. Here are a few examples:

- self-host some audio assets, and host on a Cloud Storage bucket some other assets
- host all audio assets on Cloud Storage, but host some on one bucket, and some others on a different bucket.

Have a look at the Eleventy configuration of the [demo-site in this monorepo](../demo-site/README.md).

## Configuration

### Required parameters

| Parameter | Explanation |
| --- | --- |
| `audioHost` | Each audio host should have a matching writer responsible for writing/uploading the assets to the host. |

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `audioEncodings` | `['OGG_OPUS', 'MP3']` | List of [audio encodings](https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings) to use when generating audio assets from text matches. |
| `audioInnerHTML` | see in [src/dom.ts](./src/dom.ts) | Function to use to generate the innerHTML of the `<audio>` tag to inject in the page for each text match. |
| `cacheExpiration` | `365d` | Expiration for the 11ty AssetCache. See [here](https://www.11ty.dev/docs/plugins/fetch/#change-the-cache-duration). |
| `collectionName` | `audio-items` | Name of the 11ty collection created by this plugin. |
| `keyFilename` | `process.env.GOOGLE_APPLICATION_CREDENTIALS` | credentials for the Cloud Text-to-Speech API (and for the Cloud Storage API if you don't set it in `audioHost`). |
| `rules` | see in [src/constants.ts](./src/constants.ts) | Rules that determine which texts to convert into speech. |
| `transformName` | `inject-audio-tags-into-html` | Name of the 11ty transform created by this plugin. |
| `voice` | `en-US-Standard-J` | Voice to use when generating audio assets from text matches. The Speech-to-Text API supports [these voices](https://cloud.google.com/text-to-speech/docs/voices), and might have different [pricing](https://cloud.google.com/text-to-speech/pricing) for diffent voices. |

> :warning: Don't forget to set either `keyFilename` or the `GOOGLE_APPLICATION_CREDENTIALS` environment variable on your build server.
>
> *Tip*: check what I did in the Eleventy configuration file for the [demo-site](../demo-site/README.md) of this monorepo.

## Debug

This plugin uses the [debug](https://github.com/debug-js/debug) library for logging. You can control what's logged using the `DEBUG` environment variable. For example, if you set your environment variables in a `.envrc` file, you could do:

```sh
# print all logging statements
export DEBUG=eleventy-plugin-text-to-speech/*

# print just the logging statements from the dom module and the writers module
export DEBUG=eleventy-plugin-text-to-speech/dom,eleventy-plugin-text-to-speech/writers

# print all logging statements, except the ones from the dom module and the transforms module
export DEBUG=eleventy-plugin-text-to-speech/*,-eleventy-plugin-text-to-speech/dom,-eleventy-plugin-text-to-speech/transforms
```

## Credits

I had the idea of this plugin while reading the code of the homonym [eleventy-plugin-text-to-speech](https://github.com/larryhudson/eleventy-plugin-text-to-speech) by [Larry Hudson](https://larryhudson.io/). There are a few differences between these plugins, the main one is that this plugin uses the [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech), while Larry's plugin uses the [Microsoft Azure Speech SDK](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-sdk).
