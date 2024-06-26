<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@jackdbd/eleventy-plugin-text-to-speech](./eleventy-plugin-text-to-speech.md) &gt; [textToAudioAsset](./eleventy-plugin-text-to-speech.texttoaudioasset.md)

## textToAudioAsset() function

Synthesizes some text into a readable stream representing the speech. Then it generates an audio asset from that speech.

**Signature:**

```typescript
textToAudioAsset: (config: Config) => Promise<{
    error: Error;
    value?: undefined;
} | {
    value: {
        message: string;
        href: string;
    };
    error?: undefined;
}>
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

config


</td><td>

Config


</td><td>


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;{ error: Error; value?: undefined; } \| { value: { message: string; href: string; }; error?: undefined; }&gt;


