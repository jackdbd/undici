# @jackdbd/eleventy-plugin-text-to-speech

[![npm version](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech.svg)](https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@jackdbd%2Feleventy-plugin-text-to-speech)

Eleventy plugin that send messages to a Telegram chat of your choice.

## Installation

```sh
npm install --save-dev @jackdbd/eleventy-plugin-text-to-speech
```

Before you can begin using the Text-to-Speech API, you must enable it. Using Cloud Shell, you can enable the API with the following command:

```sh
gcloud services enable texttospeech.googleapis.com
```

Create a service account that can use the Text-to-Speech API.

```sh
gcloud iam service-accounts create sa-text-to-speech-user \
  --display-name "Text-to-Speech user SA"
```

## Usage

```js
const { textToSpeechPlugin } = require('@jackdbd/eleventy-plugin-text-to-speech')

module.exports = function (eleventyConfig) {
  // some eleventy configuration...

  eleventyConfig.addPlugin(textToSpeechPlugin, {
    audioEncoding: 'OGG_OPUS',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    regexPattern: '.*/posts/.*.html$',
    voice: { languageCode: 'en-GB', name: 'en-GB-Wavenet-C' }
  })

  // some more eleventy configuration...
}
```

## Configuration

### Options

| Option | Default | Explanation |
| --- | --- | --- |
| `audioEncoding` | `OGG_OPUS` | Encoding for the audio file. It must be one of [supported audio encodings](https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings) of the Cloud Text-to-Speech API. |
| `regexPattern` | `.*.html$` | regex pattern to find text files to convert into speech. |
| `keyFilename` | `process.env.GOOGLE_APPLICATION_CREDENTIALS` | credentials for the Cloud Text-to-Speech API. |
| `voiceLanguageCode` | `en-US` | Name of the Text-to-Speech languageCode to use. [See list here](https://cloud.google.com/text-to-speech/docs/voices). |
| `voiceName` | `en-US-Standard-J` | Name of the Text-to-Speech voice to use. [See list here](https://cloud.google.com/text-to-speech/docs/voices). |

> :warning: Don't forget to set either `keyFilename` or the `GOOGLE_APPLICATION_CREDENTIALS` environment variable on your build server. For example, if your build runs on the Github CI, use [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets); if the build runs on Netlify, use [Build environment variables](https://docs.netlify.com/configure-builds/environment-variables/).