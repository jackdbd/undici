# hosting

Self-host an audio asset (i.e. write it to disk) or host it to the cloud using one the provided clients:

- filesystem
- [Google Cloud Storage](https://cloud.google.com/storage/docs/apis)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

If you want to provide your own hosting client, implement an object that has a `write` method. See existing clients for reference.
