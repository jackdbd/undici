export {
  defClient as defCloudflareR2Client,
  write as uploadToCloudflareR2
} from './cloudflare-r2.js'
export type { WriteConfig as CloudflareR2WriteConfig } from './cloudflare-r2.js'

export {
  defClient as defCloudStorageClient,
  write as uploadToCloudStorage
} from './cloud-storage.js'
export type { WriteConfig as CloudStorageWriteConfig } from './cloud-storage.js'

export {
  defClient as defFilesystemClient,
  write as writeToFilesystem
} from './fs.js'
export type { WriteConfig as FilesystemWriteConfig } from './fs.js'

export { write_func, write_result, hosting, hosting_client } from './schemas.js'
export type { Write, WriteResult, Hosting } from './schemas.js'
