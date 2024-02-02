<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@jackdbd/eleventy-plugin-text-to-speech](./eleventy-plugin-text-to-speech.md) &gt; [mediaType](./eleventy-plugin-text-to-speech.mediatype.md)

## mediaType variable

The `<audio>` tag supports 3 audio formats: MP3 (audio/mpeg), WAV (audio/wav), and OGG (audio/ogg).

**Signature:**

```typescript
mediaType: (ext: string) => {
    value: string;
    error?: undefined;
} | {
    error: Error;
    value?: undefined;
}
```