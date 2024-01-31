# @jackdbd/eleventy-plugin-text-to-speech

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech)

Eleventy plugin that uses text-to-speech to generate audio assets for your website, then injects audio players in your HTML.

To **synthesize** text into speech you can use:

- [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech)
- [ElevenLabs Text to speech API](https://elevenlabs.io/docs/api-reference/text-to-speech)

To **host** the generated audio assets you can use:

- [Cloud Storage](https://cloud.google.com/storage)
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)
- Filesystem (self host your audio assets)

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
  - [Plugin config](#plugin-config)
  - [Rule config](#rule-config)
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
import { textToSpeechPlugin } from '@jackdbd/eleventy-plugin-text-to-speech'

export default function (eleventyConfig) {
  // some eleventy configuration...
  
  eleventyConfig.addPlugin(textToSpeechPlugin, {
    // TODO: add config with process.env.CF_PAGES_URL here
  })

  // some more eleventy configuration...

}
```

### Hosting the generated audio assets on Cloud Storage

If you want to host the audio assets on a Cloud Storage bucket and configure the rules for the audio matches, you could register the plugin using something like this:

```js
import { textToSpeechPlugin } from '@jackdbd/eleventy-plugin-text-to-speech'

export default function (eleventyConfig) {
  // some eleventy configuration...
  
  eleventyConfig.addPlugin(textToSpeechPlugin, {
    // TODO: add config with Cloud Storage bucket here
  })

  // some more eleventy configuration...

}
```

### Multiple hosts

If you want to host the generated audio assets on multiple hosts, register this plugin multiple times. Here are a few examples:

- Self-host some audio assets, and host on a Cloud Storage bucket some other assets.
- Host all audio assets on Cloud Storage, but host some on one bucket, and some others on a different bucket.

Have a look at the Eleventy configuration of the [demo-site in this monorepo](../demo-site/README.md).

## Configuration

<!-- BEGIN zod-to-doc config -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN zod-to-doc TO UPDATE -->
### Plugin config

| Key | Default | Description |
|---|---|---|
| collectionName | audio-items | Name of the 11ty collection defined by this plugin |
| rules |  | Rules that determine which texts to convert into speech (1 to ∞ elements) |
| transformName | inject-audio-tags-into-html | Name of the 11ty transform defined by this plugin |
<!-- END zod-to-doc config -->

<!-- BEGIN zod-to-doc rule -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN zod-to-doc TO UPDATE -->
### Rule config

| Key | Default | Description |
|---|---|---|
| audioInnerHTML |  | Function that returns some HTML from the list of hrefs where the generated audio assets are hosted. |
| cssSelectors | [] | CSS selectors to find matches in a HTML document |
| hosting |  | Client that provides hosting capabilities |
| regex | /^((?!404).)*\.html$/ | RegExp to find matches in the output path |
| synthesis |  | Client that provides Text-to-Speech capabilities |
| xPathExpressions | [] | XPath expressions to find matches in a HTML document |
<!-- END zod-to-doc rule -->

## Debug

This plugin uses the [debug](https://github.com/debug-js/debug) library for logging. You can control what's logged using the `DEBUG` environment variable. For example, if you set your environment variables in a `.envrc` file, you could do:

```sh
# print all logging statements
export DEBUG=11ty-plugin:TTS:*

# print just the logging statements from the dom module
export DEBUG=11ty-plugin:TTS:dom

# print all logging statements, except the ones from the dom module
export DEBUG=11ty-plugin:TTS:*,-11ty-plugin:TTS:dom
```

## Credits

I had the idea of this plugin while reading the code of the homonym [eleventy-plugin-text-to-speech](https://github.com/larryhudson/eleventy-plugin-text-to-speech) by [Larry Hudson](https://larryhudson.io/). Larry's plugin uses the [Microsoft Azure Speech SDK](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-sdk).
