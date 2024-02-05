#!/usr/bin/env zx

import defDebug from 'debug'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { cloudTextToSpeechClientOptions } from '@jackdbd/eleventy-test-utils'
// import { throwIfInvokedFromMonorepoRoot } from './utils.mjs'

const debug = defDebug('script:list-voices')
const client = new TextToSpeechClient(cloudTextToSpeechClientOptions())

const [response] = await client.listVoices()

debug(`${response.voices.length} voices available`)
console.log(response.voices)

client.close()
