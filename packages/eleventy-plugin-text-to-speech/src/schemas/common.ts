import { z } from 'zod'

export const asset_name = z.string().min(1).describe('Name of the audio file')

export const file_extension = z.string().min(1).describe('File extension')

export const href = z.string().min(1).url()

export const output_path = z.string().min(1)

export const string_or_uint8 = z.union([z.string(), z.instanceof(Uint8Array)])
