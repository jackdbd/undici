import { z } from 'zod'

export const asset_name = z.string().min(1).describe('Name of the audio file')

export const file_extension = z.string().min(1).describe('File extension')

/**
 * URL or subpath (if the asset is self hosted) where the audio asset will be
 * hosted.
 *
 * @remarks
 * Do NOT add `.url()` in the Zod schema: self-hosted audio assets will be
 * something like /assets/foo.opus and NOT a URL.
 */
export const href = z.string().min(1)

export const output_path = z.string().min(1)

// eslint-disable-next-line no-undef
export const string_or_uint8 = z.union([z.string(), z.instanceof(Uint8Array)])
