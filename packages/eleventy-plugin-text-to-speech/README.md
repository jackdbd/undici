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

> :warning: The Cloud Text-to-Speech API has a [limit of 5000 characters](https://cloud.google.com/text-to-speech/quotas).
> 
> See also:
>
> - [this issue of the Wavenet for Chrome extension](https://github.com/wavenet-for-chrome/extension/issues/12)
>
> - [this discussion on Google Groups](https://groups.google.com/g/google-translate-api/c/2JsRdq0tEdA)

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


## GCP Cloud Storage

```sh
gsutil ls -p $GCP_PROJECT_ID
```

https://cloud.google.com/storage/docs/using-uniform-bucket-level-access#gsutil

https://cloud.google.com/storage/docs/access-control

Create a Cloud Storage bucket with [uniform bucket-level access](https://cloud.google.com/storage/docs/uniform-bucket-level-access).

```sh
gsutil mb \
  -p $GCP_PROJECT_ID \
  -l $CLOUD_STORAGE_LOCATION \
  -c nearline \
  -b on \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

Check that uniform bucket-level access is **enabled**:

```sh
gsutil uniformbucketlevelaccess get \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

Add a couple of labels to the bucket:

```sh
gsutil label ch \
  -l CUSTOMER:$CUSTOMER \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

Check that the bucket has the expected labels:

```sh
gsutil label get gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

``sh
gsutil cp \
  ./packages/demo-site/_site/posts/capybaras-are-cool.mp3 \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

Make the bucket's objects publicly readable:

```sh
gsutil iam ch allUsers:objectViewer \
  gs://bkt-eleventy-plugin-text-to-speech-audio-files
```

List all files in the bucket:

```sh
gsutil ls gs://bkt-eleventy-plugin-text-to-speech-audio-files
```
