## API Report File for "@jackdbd/eleventy-plugin-text-to-speech"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import type { EleventyConfig } from '@panoply/11ty';

// Warning: (ae-forgotten-export) The symbol "AudioEncoding" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "audioExtension" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const audioExtension: (audioEncoding: AudioEncoding) => "alaw" | "l16" | "mp3" | "mulaw" | "opus" | "wav";

// Warning: (ae-missing-release-tag) "mediaType" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export const mediaType: (ext: string) => {
    value: string;
    error?: undefined;
} | {
    error: Error;
    value?: undefined;
};

// Warning: (ae-missing-release-tag) "Options" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface Options {
    audioEncodings?: AudioEncoding[];
    // Warning: (ae-forgotten-export) The symbol "CloudStorageHost" needs to be exported by the entry point index.d.ts
    audioHost: URL | CloudStorageHost;
    // Warning: (ae-forgotten-export) The symbol "AudioInnerHTML" needs to be exported by the entry point index.d.ts
    audioInnerHTML?: AudioInnerHTML;
    cacheExpiration?: string;
    collectionName?: string;
    keyFilename?: string;
    // Warning: (ae-forgotten-export) The symbol "Rule" needs to be exported by the entry point index.d.ts
    rules: Rule[];
    transformName?: string;
    voice?: string;
}

// Warning: (ae-missing-release-tag) "plugin" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const plugin: {
    initArguments: {};
    configFunction: (eleventyConfig: EleventyConfig, options: Options) => void;
};

// (No @packageDocumentation comment for this package)

```