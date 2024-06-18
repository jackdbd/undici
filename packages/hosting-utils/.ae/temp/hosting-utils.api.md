## API Report File for "@jackdbd/hosting-utils"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// Warning: (ae-missing-release-tag) "DEBUG_PREFIX" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const DEBUG_PREFIX = "hosting-utils";

// Warning: (ae-missing-release-tag) "ERR_PREFIX" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const ERR_PREFIX = "[\u274C hosting-utils]";

// Warning: (ae-missing-release-tag) "RuleMap" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface RuleMap {
    // (undocumented)
    [url_pattern: string]: string[];
}

// Warning: (ae-forgotten-export) The symbol "Config" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "updateHeaders" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export const updateHeaders: (config: Config) => Promise<{
    error: Error;
    value?: undefined;
} | {
    value: string;
    error?: undefined;
}>;

// Warning: (ae-forgotten-export) The symbol "Config_2" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "updateServeJSON" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export const updateServeJSON: (config: Config_2) => Promise<{
    error: Error;
    value?: undefined;
} | {
    value: string;
    error?: undefined;
}>;

// Warning: (ae-missing-release-tag) "updateVercelJSON" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export const updateVercelJSON: (config: Config_2) => Promise<{
    error: Error;
    value?: undefined;
} | {
    value: string;
    error?: undefined;
}>;

// Warning: (ae-missing-release-tag) "VercelJSON" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type VercelJSON = {
    headers: VercelJSONHeaderObject[];
};

// Warning: (ae-missing-release-tag) "VercelJSONHeaderObject" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type VercelJSONHeaderObject = {
    source: string;
    headers: VercelJSONHeadersEntry[];
    has?: any[];
    missing?: any[];
};

// Warning: (ae-missing-release-tag) "VercelJSONHeadersEntry" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type VercelJSONHeadersEntry = {
    key: string;
    value: string;
};

// (No @packageDocumentation comment for this package)

```