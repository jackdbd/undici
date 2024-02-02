<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@jackdbd/eleventy-plugin-permissions-policy](./eleventy-plugin-permissions-policy.md) &gt; [DEFAULT\_OPTIONS](./eleventy-plugin-permissions-policy.default_options.md)

## DEFAULT\_OPTIONS variable

Default options for the plugin.

**Signature:**

```typescript
DEFAULT_OPTIONS: {
    directives: {
        feature: "accelerometer" | "ambient-light-sensor" | "autoplay" | "battery" | "browsing-topics" | "camera" | "clipboard-read" | "clipboard-write" | "conversion-measurement" | "cross-origin-isolated" | "display-capture" | "document-domain" | "encrypted-media" | "execution-while-not-rendered" | "execution-while-out-of-viewport" | "focus-without-user-activation" | "fullscreen" | "gamepad" | "geolocation" | "gyroscope" | "hid" | "idle-detection" | "layout-animations" | "legacy-image-formats" | "magnetometer" | "microphone" | "midi" | "navigation-override" | "oversized-images" | "payment" | "picture-in-picture" | "publickey-credentials-get" | "screen-wake-lock" | "serial" | "speaker-selection" | "sync-script" | "sync-xhr" | "trust-token-redemption" | "unload" | "unoptimized-images" | "unsized-media" | "usb" | "vertical-scroll" | "web-share" | "window-placement" | "xr-spatial-tracking";
        allowlist?: string[] | undefined;
    }[];
    excludePatterns: string[];
    includeFeaturePolicy: boolean;
    includePatterns: string[];
    jsonRecap: boolean;
}
```